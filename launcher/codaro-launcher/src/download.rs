//! 견고한 아티팩트 다운로드 엔진.
//!
//! 사용자 첫 설치(provision) 경로가 느린/불안정한 회선에서 무한 hang 하던 문제를
//! 근본 해결한다. 핵심 설계:
//!
//! - **전체 timeout 금지, 분절(segment) timeout + resume.** 큰 파일에 `reqwest`의
//!   `.timeout()`(요청 시작부터 본문 완독까지 전체 deadline)을 통째로 걸면 "느린-안정"
//!   다운로드를 죽인다. blocking reqwest에는 per-read timeout API가 없으므로, 대신
//!   **요청마다 짧은 flat timeout**을 걸고 끊기면 `Range:`로 **이어받는다**. 그러면 flat
//!   timeout은 "전체 deadline"이 아니라 "한 구간 길이"가 되어, 느린-안정 다운로드는 여러
//!   구간으로 나뉘어 끝까지 완료되고, 진짜 멈춤(stall)만 걸러진다.
//! - **진척 기반 재시도 예산.** 한 구간이 단 1바이트라도 더 받았으면(`.part`가 자랐으면)
//!   "진척 있음"으로 보고 stall 카운터를 리셋한다. **연속 무진척**만 stall로 누적해
//!   `max_stall_retries`를 넘으면 영구 실패. → 느린 회선은 무한정 진행, 멈춘 회선은 빠르게
//!   포기.
//! - **스트리밍 + `.part` 파일.** 본문을 메모리에 통째로 올리지 않고 `.part`로 흘려 쓴다.
//! - **지수 백오프 재시도.** connect/timeout/5xx/429만 재시도하고 `Retry-After`를 존중한다.
//!   `4xx`(404/403)는 즉시 영구 실패.
//!
//! `self_update.rs`의 스트리밍 다운로드 패턴을 일반화하고, 거기 없던 재시도/resume/
//! 분절-timeout을 더한 것이다.

use anyhow::{Context, Result, bail};
use reqwest::StatusCode;
use reqwest::blocking::{Client, Response};
use reqwest::header::{CONTENT_RANGE, RANGE, RETRY_AFTER, USER_AGENT};
use sha2::{Digest, Sha256};
use std::ffi::OsString;
use std::fs::{self, File, OpenOptions};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use std::thread;
use std::time::Duration;

/// 다운로드 동작 파라미터. 운영 기본값은 `Default`, 테스트는 짧은 값을 주입한다.
#[derive(Debug, Clone)]
pub struct DownloadConfig {
    /// TCP 연결 수립 한계.
    pub connect_timeout: Duration,
    /// 한 요청(구간)의 flat timeout. 끊기면 resume로 이어받으므로 "전체 deadline"이 아니라
    /// "구간 길이"다.
    pub segment_timeout: Duration,
    /// 연속 무진척(stall) 허용 횟수. 이만큼 연속으로 1바이트도 못 받으면 영구 실패.
    pub max_stall_retries: u32,
    /// 총 구간 수 절대 상한(병적인 1바이트-구간 서버에 대한 backstop). 정상 다운로드는
    /// 절대 도달하지 않는다.
    pub max_segments: u32,
    /// 첫 백오프 간격(이후 지수 증가).
    pub initial_backoff: Duration,
    /// 백오프 상한.
    pub max_backoff: Duration,
    /// 요청 User-Agent.
    pub user_agent: String,
}

impl Default for DownloadConfig {
    fn default() -> Self {
        Self {
            connect_timeout: Duration::from_secs(15),
            segment_timeout: Duration::from_secs(30),
            max_stall_retries: 5,
            max_segments: 4096,
            initial_backoff: Duration::from_millis(500),
            max_backoff: Duration::from_secs(30),
            user_agent: format!("codaro-launcher/{}", env!("CARGO_PKG_VERSION")),
        }
    }
}

/// `dest` 옆에 임시 `.part` 경로를 만든다(확장자 치환이 아니라 덧붙임 — 같은 stem의
/// 다른 확장자 아티팩트끼리 충돌하지 않게).
fn part_path(dest: &Path) -> PathBuf {
    let mut name: OsString = dest.as_os_str().to_owned();
    name.push(".part");
    PathBuf::from(name)
}

/// `url`을 `dest`로 견고하게 내려받는다. 성공 시 본문의 sha256(소문자 hex)을 반환한다.
///
/// 무결성(expected sha) 검증은 호출자(`stage_artifact`)가 반환값으로 수행한다 — 이 함수는
/// "끝까지 받아 디스크에 안전하게 떨군다"까지 책임진다.
///
/// `progress(received, total)`는 스트리밍 중 누적 수신 바이트와(알면) 전체 크기를 보고한다.
/// UI 진행률 배선용이며, 헤드리스 경로는 no-op 클로저를 넘기면 된다.
pub fn download_to_file(
    url: &str,
    dest: &Path,
    config: &DownloadConfig,
    progress: &dyn Fn(u64, Option<u64>),
) -> Result<String> {
    let part = part_path(dest);
    let max_stall = config.max_stall_retries;
    let max_segments = config.max_segments.max(1);
    let mut stall_streak: u32 = 0;
    let mut segment: u32 = 0;

    loop {
        segment += 1;
        if segment > max_segments {
            bail!("Download `{url}` exceeded the maximum number of segments ({max_segments}).");
        }

        // 이전 구간이 남긴 .part 크기 = resume 오프셋.
        let resume_from = fs::metadata(&part).map(|meta| meta.len()).unwrap_or(0);

        let client = Client::builder()
            .connect_timeout(config.connect_timeout)
            .timeout(config.segment_timeout)
            .build()
            .context("Failed to build download HTTP client.")?;

        let mut request = client.get(url).header(USER_AGENT, &config.user_agent);
        if resume_from > 0 {
            request = request.header(RANGE, format!("bytes={resume_from}-"));
        }

        let response = match request.send() {
            Ok(response) => response,
            Err(err) => {
                if is_retryable_transport_error(&err) && stall_streak < max_stall {
                    stall_streak += 1;
                    backoff_sleep(config, stall_streak, None);
                    continue;
                }
                return Err(err)
                    .with_context(|| format!("Failed to connect while downloading `{url}`."));
            }
        };

        let status = response.status();

        // 서버측 일시 실패: 5xx / 429 / 408 → 백오프 후 재시도(Retry-After 존중).
        if is_retryable_status(status) {
            if stall_streak < max_stall {
                let retry_after = parse_retry_after(&response);
                stall_streak += 1;
                backoff_sleep(config, stall_streak, retry_after);
                continue;
            }
            bail!("Download `{url}` failed with status {status} after repeated attempts.");
        }

        // 그 외 비-2xx(404/403/401 등)는 영구 실패.
        if !status.is_success() {
            bail!("Download `{url}` failed with status {status}.");
        }

        // Range를 요청했는데 서버가 206이 아니라 200을 줬다 = resume 미지원 → 처음부터.
        let resuming = resume_from > 0 && status == StatusCode::PARTIAL_CONTENT;
        if resume_from > 0 && !resuming {
            fs::remove_file(&part).ok();
        }
        let before = if resuming { resume_from } else { 0 };
        let total = total_size(&response, resuming);

        let stream_result = stream_to_part(response, &part, resuming, before, total, progress);
        let now = fs::metadata(&part).map(|meta| meta.len()).unwrap_or(before);

        match stream_result {
            Ok(()) => {
                // 정상 EOF. total을 알고 아직 모자라면 조기 종료로 보고 이어받는다.
                if let Some(expected_total) = total {
                    if now < expected_total {
                        if now > before {
                            stall_streak = 0;
                        } else {
                            stall_streak += 1;
                        }
                        if stall_streak >= max_stall {
                            bail!(
                                "Download `{url}` ended early ({now}/{expected_total} bytes) after repeated attempts."
                            );
                        }
                        backoff_sleep(config, stall_streak, None);
                        continue;
                    }
                }
                // 완료(또는 total 미상) → 아래에서 finalize.
            }
            Err(err) => {
                // 분절 timeout / 끊김. 진척이 있으면 streak 리셋 후 resume, 없으면 streak 누적.
                if now > before {
                    stall_streak = 0;
                } else {
                    stall_streak += 1;
                    if stall_streak >= max_stall {
                        return Err(err).with_context(|| {
                            format!("Stalled while downloading `{url}` ({now} bytes received).")
                        });
                    }
                }
                backoff_sleep(config, stall_streak, None);
                continue;
            }
        }

        // 완료: .part 전체를 한 번 스캔해 sha 계산 후 dest로 원자적 이동.
        let sha = sha256_file(&part)?;
        if dest.exists() {
            fs::remove_file(dest).ok();
        }
        fs::rename(&part, dest)
            .with_context(|| format!("Failed to finalize download `{}`.", dest.display()))?;
        return Ok(sha);
    }
}

/// 응답 본문을 `.part`로 스트리밍한다. `append`면 기존 바이트 뒤에 이어 쓰고(206 resume),
/// 아니면 truncate 후 처음부터. `base`는 시작 누적 바이트(resume 오프셋), `total`은 알면 전체
/// 크기. 진행률은 ~512KB마다 throttle 해 `progress`로 보고한다.
fn stream_to_part(
    mut response: Response,
    part: &Path,
    append: bool,
    base: u64,
    total: Option<u64>,
    progress: &dyn Fn(u64, Option<u64>),
) -> Result<()> {
    if let Some(parent) = part.parent() {
        fs::create_dir_all(parent).with_context(|| {
            format!("Failed to create download directory `{}`.", parent.display())
        })?;
    }
    let mut file = OpenOptions::new()
        .create(true)
        .write(true)
        .append(append)
        .truncate(!append)
        .open(part)
        .with_context(|| format!("Failed to open part file `{}`.", part.display()))?;

    const EMIT_EVERY: u64 = 512 * 1024;
    let mut received = base;
    let mut last_emit = base;
    progress(received, total);

    let mut buffer = [0u8; 64 * 1024];
    loop {
        let read = response
            .read(&mut buffer)
            .context("Read error during download (connection stalled or dropped).")?;
        if read == 0 {
            break;
        }
        file.write_all(&buffer[..read]).with_context(|| {
            format!("Failed to write downloaded bytes to `{}`.", part.display())
        })?;
        received += read as u64;
        if received - last_emit >= EMIT_EVERY {
            progress(received, total);
            last_emit = received;
        }
    }
    file.flush()
        .with_context(|| format!("Failed to flush part file `{}`.", part.display()))?;
    progress(received, total);
    Ok(())
}

/// 파일 전체를 읽어 sha256 소문자 hex를 만든다.
fn sha256_file(path: &Path) -> Result<String> {
    let mut file = File::open(path)
        .with_context(|| format!("Failed to open `{}` for hashing.", path.display()))?;
    let mut hasher = Sha256::new();
    let mut buffer = [0u8; 64 * 1024];
    loop {
        let read = file
            .read(&mut buffer)
            .with_context(|| format!("Failed to read `{}` for hashing.", path.display()))?;
        if read == 0 {
            break;
        }
        hasher.update(&buffer[..read]);
    }
    Ok(format!("{:x}", hasher.finalize()))
}

/// 응답에서 기대 전체 크기를 추정한다. 206이면 `Content-Range: …/total`의 total,
/// 200이면 `Content-Length`. 알 수 없으면 `None`(그 경우 sha가 유일한 완결 판정 기준).
fn total_size(response: &Response, resuming: bool) -> Option<u64> {
    if resuming {
        response
            .headers()
            .get(CONTENT_RANGE)
            .and_then(|value| value.to_str().ok())
            .and_then(|text| text.rsplit('/').next())
            .and_then(|total| total.trim().parse::<u64>().ok())
    } else {
        response.content_length()
    }
}

/// 연결/전송 단계의 일시적 오류만 재시도 대상.
fn is_retryable_transport_error(err: &reqwest::Error) -> bool {
    err.is_timeout() || err.is_connect() || err.is_request()
}

/// 재시도해볼 만한 HTTP 상태(서버 일시 장애 / rate limit).
fn is_retryable_status(status: StatusCode) -> bool {
    status.is_server_error()
        || status == StatusCode::TOO_MANY_REQUESTS
        || status == StatusCode::REQUEST_TIMEOUT
}

/// `Retry-After`(초 단위 정수)를 파싱한다. HTTP-date 형식은 지원하지 않고 백오프로 폴백.
fn parse_retry_after(response: &Response) -> Option<Duration> {
    response
        .headers()
        .get(RETRY_AFTER)
        .and_then(|value| value.to_str().ok())
        .and_then(|text| text.trim().parse::<u64>().ok())
        .map(Duration::from_secs)
}

/// 백오프 대기. `streak == 0`(직전 구간이 진척을 냄)이면 즉시 다음 구간으로(대기 0).
/// `retry_after`가 있으면 그 값(상한 적용)을, 없으면 지수 백오프를 쓴다.
fn backoff_sleep(config: &DownloadConfig, streak: u32, retry_after: Option<Duration>) {
    let delay = match retry_after {
        Some(value) => value.min(config.max_backoff),
        None => {
            if streak == 0 {
                Duration::ZERO
            } else {
                let factor = 2u32.saturating_pow(streak - 1);
                config
                    .initial_backoff
                    .saturating_mul(factor)
                    .min(config.max_backoff)
            }
        }
    };
    if !delay.is_zero() {
        thread::sleep(delay);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::{BufRead, BufReader};
    use std::net::{TcpListener, TcpStream};
    use std::sync::Arc;
    use std::sync::atomic::{AtomicUsize, Ordering};
    use tempfile::tempdir;

    fn fast_config() -> DownloadConfig {
        DownloadConfig {
            connect_timeout: Duration::from_secs(2),
            segment_timeout: Duration::from_millis(400),
            max_stall_retries: 4,
            max_segments: 64,
            initial_backoff: Duration::from_millis(5),
            max_backoff: Duration::from_millis(20),
            user_agent: "codaro-launcher-test".into(),
        }
    }

    /// 요청 헤더 전체를 읽어 줄 벡터로 반환(빈 줄까지). Range 등 헤더 검사를 위해.
    fn read_request_headers(stream: &mut TcpStream) -> Vec<String> {
        let mut reader = BufReader::new(stream.try_clone().unwrap());
        let mut lines = Vec::new();
        loop {
            let mut line = String::new();
            if reader.read_line(&mut line).unwrap_or(0) == 0 {
                break;
            }
            let trimmed = line.trim_end().to_string();
            if trimmed.is_empty() {
                break;
            }
            lines.push(trimmed);
        }
        lines
    }

    fn range_start(headers: &[String]) -> Option<u64> {
        headers.iter().find_map(|line| {
            let lower = line.to_ascii_lowercase();
            let rest = lower.strip_prefix("range:")?;
            let spec = rest.trim().strip_prefix("bytes=")?;
            spec.split('-').next()?.trim().parse::<u64>().ok()
        })
    }

    fn sha_of(bytes: &[u8]) -> String {
        format!("{:x}", Sha256::digest(bytes))
    }

    #[test]
    fn downloads_full_body_and_returns_sha() {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let addr = listener.local_addr().unwrap();
        let body = b"codaro-artifact-payload-0123456789".to_vec();
        let expected = sha_of(&body);

        let server_body = body.clone();
        let handle = thread::spawn(move || {
            let (mut stream, _) = listener.accept().unwrap();
            let _ = read_request_headers(&mut stream);
            let header = format!(
                "HTTP/1.1 200 OK\r\nContent-Length: {}\r\nAccept-Ranges: bytes\r\n\r\n",
                server_body.len()
            );
            stream.write_all(header.as_bytes()).unwrap();
            stream.write_all(&server_body).unwrap();
            stream.flush().unwrap();
        });

        let dir = tempdir().unwrap();
        let dest = dir.path().join("artifact.bin");
        let sha =
            download_to_file(&format!("http://{addr}/artifact.bin"), &dest, &fast_config(), &|_, _| {})
                .unwrap();

        handle.join().unwrap();
        assert_eq!(sha, expected);
        assert_eq!(fs::read(&dest).unwrap(), body);
        assert!(!part_path(&dest).exists(), ".part는 finalize 후 사라져야 한다");
    }

    #[test]
    fn retries_after_503_then_succeeds() {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let addr = listener.local_addr().unwrap();
        let body = b"recovered-after-transient-503".to_vec();
        let expected = sha_of(&body);
        let hits = Arc::new(AtomicUsize::new(0));

        let server_hits = hits.clone();
        let server_body = body.clone();
        let handle = thread::spawn(move || {
            for _ in 0..2 {
                let (mut stream, _) = listener.accept().unwrap();
                let _ = read_request_headers(&mut stream);
                let n = server_hits.fetch_add(1, Ordering::SeqCst);
                if n == 0 {
                    let resp = "HTTP/1.1 503 Service Unavailable\r\nContent-Length: 0\r\nRetry-After: 0\r\n\r\n";
                    stream.write_all(resp.as_bytes()).unwrap();
                } else {
                    let header =
                        format!("HTTP/1.1 200 OK\r\nContent-Length: {}\r\n\r\n", server_body.len());
                    stream.write_all(header.as_bytes()).unwrap();
                    stream.write_all(&server_body).unwrap();
                }
                stream.flush().unwrap();
            }
        });

        let dir = tempdir().unwrap();
        let dest = dir.path().join("artifact.bin");
        let sha =
            download_to_file(&format!("http://{addr}/a"), &dest, &fast_config(), &|_, _| {}).unwrap();

        handle.join().unwrap();
        assert_eq!(sha, expected);
        assert_eq!(
            hits.load(Ordering::SeqCst),
            2,
            "503 한 번 후 재시도해 2회 요청해야 한다"
        );
    }

    #[test]
    fn resumes_with_range_after_drop() {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let addr = listener.local_addr().unwrap();
        let body = b"0123456789ABCDEFGHIJ0123456789ABCDEFGHIJ".to_vec(); // 40 bytes
        let expected = sha_of(&body);
        let split = 17usize;

        let server_body = body.clone();
        let handle = thread::spawn(move || {
            // 1st 연결: 200 + 처음 split 바이트만 보내고 끊는다(Content-Length는 전체).
            {
                let (mut stream, _) = listener.accept().unwrap();
                let _ = read_request_headers(&mut stream);
                let header = format!(
                    "HTTP/1.1 200 OK\r\nContent-Length: {}\r\nAccept-Ranges: bytes\r\n\r\n",
                    server_body.len()
                );
                stream.write_all(header.as_bytes()).unwrap();
                stream.write_all(&server_body[..split]).unwrap();
                stream.flush().unwrap();
                // 소켓 drop → 클라이언트 read가 조기 EOF/끊김으로 실패.
            }
            // 2nd 연결: Range 요청을 받아 206 + 나머지.
            {
                let (mut stream, _) = listener.accept().unwrap();
                let headers = read_request_headers(&mut stream);
                let start =
                    range_start(&headers).expect("두 번째 요청은 Range를 보내야 한다") as usize;
                let header = format!(
                    "HTTP/1.1 206 Partial Content\r\nContent-Length: {}\r\nContent-Range: bytes {}-{}/{}\r\n\r\n",
                    server_body.len() - start,
                    start,
                    server_body.len() - 1,
                    server_body.len()
                );
                stream.write_all(header.as_bytes()).unwrap();
                stream.write_all(&server_body[start..]).unwrap();
                stream.flush().unwrap();
            }
        });

        let dir = tempdir().unwrap();
        let dest = dir.path().join("artifact.bin");
        let mut config = fast_config();
        config.segment_timeout = Duration::from_secs(2);
        let sha = download_to_file(&format!("http://{addr}/a"), &dest, &config, &|_, _| {}).unwrap();

        handle.join().unwrap();
        assert_eq!(sha, expected);
        assert_eq!(
            fs::read(&dest).unwrap(),
            body,
            "resume로 이어붙인 본문이 원본과 같아야 한다"
        );
    }

    #[test]
    fn stalled_body_errors_within_bound_no_infinite_hang() {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let addr = listener.local_addr().unwrap();

        let handle = thread::spawn(move || {
            let (mut stream, _) = listener.accept().unwrap();
            let _ = read_request_headers(&mut stream);
            // 헤더 + 일부만 보내고 멈춘다(소켓은 열어둠) → segment timeout이 끊어야 한다.
            let header = "HTTP/1.1 200 OK\r\nContent-Length: 100000\r\n\r\n";
            stream.write_all(header.as_bytes()).unwrap();
            stream.write_all(b"partial-then-stall").unwrap();
            stream.flush().unwrap();
            thread::sleep(Duration::from_millis(1500)); // 소켓 유지로 stall 유발
        });

        let dir = tempdir().unwrap();
        let dest = dir.path().join("artifact.bin");
        let mut config = fast_config();
        config.segment_timeout = Duration::from_millis(250);
        config.max_stall_retries = 2;
        let result = download_to_file(&format!("http://{addr}/a"), &dest, &config, &|_, _| {});

        handle.join().unwrap();
        assert!(
            result.is_err(),
            "본문 stall은 무한 hang이 아니라 Err로 끝나야 한다"
        );
    }

    #[test]
    fn permanent_404_is_not_retried() {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let addr = listener.local_addr().unwrap();
        let hits = Arc::new(AtomicUsize::new(0));

        let server_hits = hits.clone();
        let handle = thread::spawn(move || {
            let (mut stream, _) = listener.accept().unwrap();
            let _ = read_request_headers(&mut stream);
            server_hits.fetch_add(1, Ordering::SeqCst);
            let resp = "HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\n\r\n";
            stream.write_all(resp.as_bytes()).unwrap();
            stream.flush().unwrap();
        });

        let dir = tempdir().unwrap();
        let dest = dir.path().join("artifact.bin");
        let result =
            download_to_file(&format!("http://{addr}/missing"), &dest, &fast_config(), &|_, _| {});

        handle.join().unwrap();
        assert!(result.is_err());
        assert_eq!(
            hits.load(Ordering::SeqCst),
            1,
            "404는 재시도하지 않고 즉시 실패해야 한다"
        );
    }

    #[test]
    fn backoff_is_capped_at_max() {
        let config = DownloadConfig {
            initial_backoff: Duration::from_millis(100),
            max_backoff: Duration::from_secs(10),
            ..fast_config()
        };
        // 큰 streak에서도 max_backoff를 넘지 않아야 한다(오버플로 없이 캡).
        let factor = 2u32.saturating_pow(50);
        let capped = config
            .initial_backoff
            .saturating_mul(factor)
            .min(config.max_backoff);
        assert_eq!(
            capped, config.max_backoff,
            "큰 streak는 max_backoff로 캡되어야 한다"
        );
    }
}
