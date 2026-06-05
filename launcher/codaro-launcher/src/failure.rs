//! 프로비전/다운로드 실패를 사용자에게 보여줄 **분류**로 번역한다.
//!
//! 원칙: raw 에러 문자열(`reqwest`/`anyhow` 체인)은 로그에만 남기고, UI에는 분류된 한국어
//! 카드(원인 추정 + 다음 행동)를 띄운다. 사용자가 `Failed to read response bytes ...
//! operation timed out` 같은 날것의 메시지를 보는 일을 없앤다.

use serde::Serialize;

/// 실패의 큰 갈래. 같은 갈래는 같은 사용자 카피를 쓴다.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum FailureKind {
    /// 연결 끊김 / 타임아웃 / DNS / 본문 stall.
    Network,
    /// GitHub/CDN 서버측 오류(5xx, rate limit, 404 asset 등).
    Server,
    /// sha256 불일치 / 잘린 zip / 조기 종료 — 받은 파일이 손상.
    Integrity,
    /// 디스크 공간 부족 / 쓰기 권한.
    Disk,
    /// 다운로드는 됐으나 압축 해제 / pip 설치 / 백엔드 기동에서 실패.
    Runtime,
    /// 미분류(raw는 로그로).
    Unknown,
}

/// 사용자에게 보여줄 분류된 실패 카드. JSON으로 직렬화해 webview의 `setFailure`로 넘긴다.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FailureCard {
    pub kind: FailureKind,
    pub code: String,
    pub title: String,
    pub cause: String,
    pub actions: Vec<String>,
    pub recoverable: bool,
}

/// anyhow 에러 체인을 walk 하며 가장 구체적인 분류를 고른다.
pub fn classify(err: &anyhow::Error) -> FailureKind {
    for cause in err.chain() {
        if let Some(request_error) = cause.downcast_ref::<reqwest::Error>() {
            if request_error.status().is_some() {
                return FailureKind::Server;
            }
            if request_error.is_timeout()
                || request_error.is_connect()
                || request_error.is_request()
                || request_error.is_body()
            {
                return FailureKind::Network;
            }
        }
        if let Some(io_error) = cause.downcast_ref::<std::io::Error>() {
            if let Some(kind) = disk_signal(io_error) {
                return kind;
            }
        }
    }
    keyword_fallback(err)
}

/// io 에러가 "명백한 디스크 문제"일 때만 `Some(Disk)`. 그 외(NotFound 등)는 `None`으로
/// 두어 키워드 폴백이 더 정확히 분류하게 한다.
fn disk_signal(io_error: &std::io::Error) -> Option<FailureKind> {
    use std::io::ErrorKind;
    if io_error.kind() == ErrorKind::PermissionDenied {
        return Some(FailureKind::Disk);
    }
    // ENOSPC(28, POSIX) / ERROR_DISK_FULL(112, Windows) / ERROR_HANDLE_DISK_FULL(39).
    if let Some(code) = io_error.raw_os_error() {
        if code == 28 || code == 112 || code == 39 {
            return Some(FailureKind::Disk);
        }
    }
    None
}

/// 우리가 직접 `bail!`한 문자열을 키워드로 분류하는 폴백. URL에 흔한 `.zip` 같은 부분
/// 문자열이 오분류를 일으키지 않도록, 키워드는 메시지 본문에만 등장하는 구체 구절을 쓴다.
fn keyword_fallback(err: &anyhow::Error) -> FailureKind {
    let message = format!("{err:#}").to_ascii_lowercase();
    // sha 불일치 = 바이트는 도착했으나 내용이 손상 → 무결성.
    if message.contains("sha256 mismatch") {
        return FailureKind::Integrity;
    }
    // 서버가 비-2xx 상태를 줌(우리가 status 문자열로 bail).
    if message.contains("failed with status") || message.contains("request failed") {
        return FailureKind::Server;
    }
    // 연결/본문이 끝까지 못 옴(끊김·멈춤·조기종료) → 네트워크.
    if message.contains("timed out")
        || message.contains("stalled")
        || message.contains("ended early")
        || message.contains("connect")
        || message.contains("dns")
        || message.contains("incomplete")
    {
        return FailureKind::Network;
    }
    // 다운로드 이후 단계(압축 해제 / pip / 백엔드 기동) 실패 → 런타임.
    if message.contains("wheel installation")
        || message.contains("ensurepip")
        || message.contains("extract")
        || message.contains("zip archive")
        || message.contains("become healthy")
        || message.contains("python executable")
    {
        return FailureKind::Runtime;
    }
    FailureKind::Unknown
}

/// 분류에 해당하는 사용자 카드(한국어)를 만든다.
pub fn card_for(kind: FailureKind) -> FailureCard {
    match kind {
        FailureKind::Network => FailureCard {
            kind,
            code: "NET_DOWNLOAD".into(),
            title: "인터넷 연결이 불안정해요".into(),
            cause: "다운로드 중 연결이 끊기거나 응답이 너무 느려요. 와이파이·회사망·VPN 상태를 확인해 주세요. 연결이 돌아오면 다시 시도하면 이어받습니다.".into(),
            actions: vec!["다시 시도".into(), "네트워크 확인".into()],
            recoverable: true,
        },
        FailureKind::Server => FailureCard {
            kind,
            code: "SRV_RELEASE".into(),
            title: "배포 서버에서 파일을 받지 못했어요".into(),
            cause: "GitHub 배포 서버가 일시적으로 응답하지 않거나 요청이 제한됐어요. 보통 잠시 후 풀립니다.".into(),
            actions: vec!["잠시 후 다시 시도".into(), "GitHub 상태 확인".into()],
            recoverable: true,
        },
        FailureKind::Integrity => FailureCard {
            kind,
            code: "INTEGRITY".into(),
            title: "받은 파일이 손상됐어요".into(),
            cause: "파일이 전송 중 깨졌어요(체크섬 불일치). 다시 받으면 대부분 해결됩니다.".into(),
            actions: vec!["다시 받기".into()],
            recoverable: true,
        },
        FailureKind::Disk => FailureCard {
            kind,
            code: "DISK".into(),
            title: "저장 공간이나 권한이 부족해요".into(),
            cause: "디스크 여유 공간이 부족하거나 설치 폴더에 쓸 권한이 없어요. 공간을 확보하거나 권한을 확인해 주세요.".into(),
            actions: vec!["공간 확인".into(), "다시 시도".into()],
            recoverable: false,
        },
        FailureKind::Runtime => FailureCard {
            kind,
            code: "RUNTIME_SETUP".into(),
            title: "설치 마무리에 실패했어요".into(),
            cause: "내려받기는 됐지만 압축 해제나 구성요소 설치에서 멈췄어요. 다시 시도하거나 진단 로그를 확인해 주세요.".into(),
            actions: vec!["다시 시도".into(), "진단 로그 열기".into()],
            recoverable: true,
        },
        FailureKind::Unknown => FailureCard {
            kind,
            code: "UNKNOWN".into(),
            title: "예상치 못한 문제가 발생했어요".into(),
            cause: "알 수 없는 오류예요. 진단 로그를 확인하거나, 문제가 계속되면 로그를 보내 주세요.".into(),
            actions: vec!["다시 시도".into(), "진단 로그 열기".into()],
            recoverable: true,
        },
    }
}

/// 에러를 분류해 사용자 카드로 변환한다.
pub fn to_card(err: &anyhow::Error) -> FailureCard {
    card_for(classify(err))
}

#[cfg(test)]
mod tests {
    use super::*;
    use anyhow::anyhow;

    #[test]
    fn sha_mismatch_is_integrity() {
        let err = anyhow!(
            "Failed to download `https://x/a.whl`: Artifact sha256 mismatch for `x`. expected `aa`, got `bb`."
        );
        assert_eq!(classify(&err), FailureKind::Integrity);
    }

    #[test]
    fn timeout_text_is_network() {
        let err = anyhow!("Stalled while downloading `https://x/a.zip` (12 bytes received).");
        assert_eq!(classify(&err), FailureKind::Network);
    }

    #[test]
    fn status_failure_is_server() {
        let err = anyhow!("Download `https://x/a.zip` failed with status 503 Service Unavailable.");
        assert_eq!(classify(&err), FailureKind::Server);
    }

    #[test]
    fn health_failure_is_runtime() {
        let err = anyhow!("Backend health check failed: backend failed to become healthy.");
        assert_eq!(classify(&err), FailureKind::Runtime);
    }

    #[test]
    fn unknown_falls_back() {
        let err = anyhow!("something entirely unexpected");
        assert_eq!(classify(&err), FailureKind::Unknown);
    }

    #[test]
    fn every_kind_has_nonempty_card() {
        for kind in [
            FailureKind::Network,
            FailureKind::Server,
            FailureKind::Integrity,
            FailureKind::Disk,
            FailureKind::Runtime,
            FailureKind::Unknown,
        ] {
            let card = card_for(kind);
            assert!(!card.title.is_empty());
            assert!(!card.cause.is_empty());
            assert!(!card.actions.is_empty());
            assert!(!card.code.is_empty());
        }
    }
}
