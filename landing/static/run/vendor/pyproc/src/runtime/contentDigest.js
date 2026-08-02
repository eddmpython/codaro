// contentDigest.js - Layer 0: 내용 주소 계산의 단일 정본(순수 함수, 의존은 errors.js뿐).
// 자산 SRI(assets/runtime), 저널 blob 키(machineJournal), 머신 봉투 해시(session),
// 커널 이름(kernelElection), 스냅샷 캐시 키(envManager)가 전부 같은 계산을 한다.
//
// 왜 한 곳인가: 흩어져 있던 다섯 벌은 이미 갈라져 있었다. base64 인코더 하나는 청크 처리와
// Buffer 폴백과 subtle 가드를 갖췄고 다른 하나는 셋 다 없어서, 같은 입력에 Node에서
// ReferenceError와 PyProcError로 다르게 실패했다. 내용 주소는 값이 한 비트만 달라도 계약이
// 깨지는 자리라 구현이 갈라지는 것 자체가 결함이다.
//
// pyprocSw.js는 이 파일을 쓰지 않는다: import 0인 자기충족 Service Worker 자산이라
// 의존을 들이면 SW 등록 계약(단일 파일 fetch)이 깨진다. 그 중복은 의도된 것이고
// 자산 매니페스트 graph가 그 사실을 게시한다.
import { PyProcError } from "./errors.js";

function asBytes(data) {
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  if (typeof data === "string") return new TextEncoder().encode(data);
  throw new PyProcError("PYPROC_ENV_UNSUPPORTED", "contentDigest: only bytes, ArrayBuffer, or string are accepted");
}

function subtleOrThrow() {
  const subtle = globalThis.crypto && globalThis.crypto.subtle;
  if (!subtle) throw new PyProcError("PYPROC_ENV_UNSUPPORTED", "contentDigest: crypto.subtle is required");
  return subtle;
}

// ---- 순수 코어(cryptoProvider 매개변수화, 브라우저 전역 접근 0) ----
// 상태 커널(state-kernel)의 digest 법이 여기 산다. 아래 편의 함수들은 전부 이 코어의
// 브라우저 전역 바인딩이다. machine 층의 generationIntegrity는 경계상 이 파일을 import하지
// 못해 같은 법의 주입식 사본을 유지한다. 두 구현의 경계와 일치 여부는 구조·계약 게이트가
// 지킨다.

function requireProvider(cryptoProvider) {
  if (!cryptoProvider?.subtle) throw new PyProcError("PYPROC_ENV_UNSUPPORTED", "contentDigest: cryptoProvider.subtle is required");
  return cryptoProvider.subtle;
}

export async function sha256HexWith(cryptoProvider, data) {
  const digest = new Uint8Array(await requireProvider(cryptoProvider).digest("SHA-256", asBytes(data)));
  return hexFromBytes(digest);
}

// 정본 주소 형식은 "sha256:<hex>" 하나다(알고리즘 자기 기술형). bare hex는 살아있는 저장
// 포맷(저널 blob 키, .pymachine 봉투 필드)의 인코딩 세부로만 남고, 판정은 코덱이 흡수한다.
export const SHA256_ADDRESS_RE = /^sha256:[0-9a-f]{64}$/;
const SHA256_HEX_RE = /^[0-9a-f]{64}$/;

export async function sha256AddressWith(cryptoProvider, data) {
  return "sha256:" + await sha256HexWith(cryptoProvider, data);
}

// 주소/키 -> hex. "sha256:<hex>"와 bare hex(구 포맷 인코딩)를 모두 받는 유일한 지점이다.
// 두 인코딩을 아는 곳이 여기 하나여야 형식 표류가 멈춘다. 그 외 값은 null(판정은 호출자 몫).
export function parseSha256Address(value) {
  const s = String(value || "");
  if (SHA256_ADDRESS_RE.test(s)) return s.slice("sha256:".length);
  if (SHA256_HEX_RE.test(s)) return s;
  return null;
}

// verify-on-read의 단일 판정: 바이트를 다시 해시해 기대값과 대조한다. 던지지 않고
// { ok, actual, expectedHex }를 돌려준다(층마다 자기 오류 계약으로 감싼다:
// 저널은 PYPROC_JOURNAL_CORRUPT, machine은 WebMachineError, 자산은 PYPROC_ASSET_INTEGRITY).
export async function verifySha256With(cryptoProvider, bytes, expected) {
  const expectedHex = parseSha256Address(expected);
  const actual = await sha256HexWith(cryptoProvider, bytes);
  return { ok: expectedHex !== null && actual === expectedHex, actual, expectedHex };
}

// 청크로 끊어 넣는다: 큰 배열을 String.fromCharCode에 한 번에 펼치면 인자 수 한계로 터진다.
export function base64FromBytes(data) {
  const bytes = asBytes(data);
  if (typeof btoa === "function") {
    let s = "";
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(s);
  }
  if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64");
  throw new PyProcError("PYPROC_ENV_UNSUPPORTED", "contentDigest: no base64 encoder available");
}

// base64 디코더. 인코더와 같은 규율로 둔다: 폴백이 한쪽만 있던 사본이 "같은 입력에 다르게
// 실패"를 만든 것이 이 파일 헤더의 사고 기록이고, 디코더에서 그것이 재발했다(2026-07-27:
// machineSignature의 디코더는 atob만 갖춰 Node에서 ReferenceError였다).
// urlSafe는 JWS/JWK 계열 표기(base64url)를 받는다.
export function bytesFromBase64(value, { urlSafe = false } = {}) {
  const normalized = urlSafe
    ? String(value).replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - (String(value).length % 4)) % 4)
    : String(value);
  if (typeof atob === "function") {
    const raw = atob(normalized);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    return bytes;
  }
  if (typeof Buffer !== "undefined") return new Uint8Array(Buffer.from(normalized, "base64"));
  throw new PyProcError("PYPROC_ENV_UNSUPPORTED", "contentDigest: no base64 decoder available");
}

// bytes -> 소문자 hex. 내용 주소·서명 표기가 같은 인코딩을 쓰게 하는 한 곳이다.
export function hexFromBytes(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Bytes(data) {
  return new Uint8Array(await subtleOrThrow().digest("SHA-256", asBytes(data)));
}

// 16진 다이제스트. bytes를 그대로 받고, 문자열이면 UTF-8로 인코딩한다.
export async function sha256Hex(data) {
  return sha256HexWith({ subtle: subtleOrThrow() }, data);
}

// "sha256:<hex>" 정본 주소(브라우저 전역 바인딩).
export async function sha256Address(data) {
  return sha256AddressWith({ subtle: subtleOrThrow() }, data);
}

// verify-on-read 단일 판정(브라우저 전역 바인딩).
export async function verifySha256(bytes, expected) {
  return verifySha256With({ subtle: subtleOrThrow() }, bytes, expected);
}

// 앞 n바이트만 쓰는 짧은 키(캐시 파일명 등). 내용 주소가 아니라 이름이라 충돌 비용이 낮다.
export async function sha256HexShort(data, bytes = 8) {
  return hexFromBytes((await sha256Bytes(data)).slice(0, bytes));
}

// SRI 문자열("sha256-<base64>"). 자산 무결성 계약의 표기법.
export async function sha256Sri(data) {
  return "sha256-" + base64FromBytes(await sha256Bytes(data));
}

// SRI 속성은 공백으로 여러 값을 담을 수 있다. sha256만 받는다(다른 알고리즘은 계약 밖).
export function parseSri(value) {
  return String(value || "").trim().split(/\s+/).filter((v) => v.startsWith("sha256-"));
}

// 기대 SRI 중 하나와 맞는지 확인하고 실제 값을 돌려준다. label은 오류 문장의 주어다.
export async function verifySri(data, expected, label) {
  const entries = parseSri(expected);
  if (!entries.length) throw new PyProcError("PYPROC_ASSET_INTEGRITY", `integrity: no sha256 SRI value for ${label}`);
  const actual = await sha256Sri(data);
  if (!entries.includes(actual)) {
    throw new PyProcError("PYPROC_ASSET_INTEGRITY", `integrity: ${label} hash mismatch (expected ${entries[0].slice(0, 19)}..., actual ${actual.slice(0, 19)}...)`);
  }
  return actual;
}
