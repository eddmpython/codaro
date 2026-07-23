// wasiProtocol.js - WASI 엔진의 메인<->워커 와이어 계약(한 곳). 하드코딩 금지 원칙의 준수:
// 신호 바이트/EOT/코드 경로/SAB 상한이 여러 파일에 흩어지지 않게 명명 상수로 모은다.
// SIGNAL 표(processOs)의 WASI판. 값 채널은 무상태화돼 있다(코드=파일, stdin=신호 1바이트).

// stdin 첫 바이트로 명령 종류를 가른다. exec는 파이썬에 신호를 넘기고, meta는 워커가 소비한다.
export const SIGNAL_META = 0; // 뒤에 "checkpoint" | "restore <i>" (힙 스냅샷/복원, 파이썬 왕복 아님)
export const SIGNAL_EXEC = 1; // 뒤에 실행할 코드 바이트(워커가 /cmd 파일에 싣고 신호 1바이트만 반환)

export const EOT = 4;              // 한 왕복의 끝(드라이버가 stdout에 쓰는 EOT, \x04)
export const CMD_PATH = "/cmd";    // 코드 채널: preopen 파일 경로(힙 밖 = 힙 복원 무관)
export const DRIVER_PATH = "/driver.py"; // 드라이버 소스 경로(argv UTF-8 회피: 파일로 실행)
// 패키지 경로: 쓰기 가능한 preopen 디렉터리. 드라이버가 sys.path에 끼우고, installWheel이 여기에
// 순수 파이썬 wheel의 파일을 써서 import 가능하게 한다(= 브라우저판 site-packages).
export const SITE_PATH = "/site";

// SAB 크기: ctl은 [플래그, 길이] 2워드. data는 한 왕복의 코드 상한(초과 시 명시 예외).
export const CTL_WORDS = 2;
export const DATA_SAB_BYTES = 1 << 20; // 1MiB(코드 한 조각 상한. enginePort 실측 64KiB에서 여유 확대)

// WASI 파일타입(browser_wasi_shim wasi_defs): 신호 stdin을 문자 장치로 보고(초기화 통과).
export const FILETYPE_CHARACTER_DEVICE = 2;
