use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "payload")]
pub enum IpcMessage {
    #[serde(rename = "ready")]
    Ready,
    #[serde(rename = "setProgress")]
    SetProgress(ProgressPayload),
    #[serde(rename = "setError")]
    SetError(ErrorPayload),
    #[serde(rename = "setStatus")]
    SetStatus(StatusPayload),
    #[serde(rename = "navigate")]
    Navigate(NavigatePayload),
    #[serde(rename = "requestClose")]
    RequestClose,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProgressPayload {
    pub stage: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub percent: Option<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorPayload {
    pub code: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub detail: Option<String>,
    #[serde(default)]
    pub recoverable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StatusPayload {
    pub status: LaunchStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavigatePayload {
    pub url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum LaunchStatus {
    Initializing,
    Provisioning,
    Starting,
    Healthy,
    Failed,
    Updating,
}

pub fn encode_ipc(msg: &IpcMessage) -> String {
    serde_json::to_string(msg).unwrap_or_default()
}

pub fn decode_ipc(raw: &str) -> Option<IpcMessage> {
    serde_json::from_str(raw).ok()
}

pub fn build_init_script(initial_status: &str) -> String {
    format!(
        r#"
        window.__CODARO_LAUNCHER__ = {{
            status: "{}",
            version: "{}",
            sendMessage: function(msg) {{
                window.ipc.postMessage(JSON.stringify(msg));
            }}
        }};
        "#,
        initial_status,
        env!("CARGO_PKG_VERSION"),
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encode_ready() {
        let msg = IpcMessage::Ready;
        let json = encode_ipc(&msg);
        assert!(json.contains("\"type\":\"ready\""));
    }

    #[test]
    fn test_encode_progress() {
        let msg = IpcMessage::SetProgress(ProgressPayload {
            stage: "download".into(),
            message: "Downloading runtime...".into(),
            percent: Some(42.5),
        });
        let json = encode_ipc(&msg);
        assert!(json.contains("\"stage\":\"download\""));
        assert!(json.contains("42.5"));
    }

    #[test]
    fn test_roundtrip_error() {
        let msg = IpcMessage::SetError(ErrorPayload {
            code: "PROVISION_FAILED".into(),
            message: "Download failed".into(),
            detail: Some("HTTP 404".into()),
            recoverable: true,
        });
        let json = encode_ipc(&msg);
        let decoded = decode_ipc(&json).unwrap();
        match decoded {
            IpcMessage::SetError(payload) => {
                assert_eq!(payload.code, "PROVISION_FAILED");
                assert!(payload.recoverable);
            }
            _ => panic!("expected SetError"),
        }
    }

    #[test]
    fn test_roundtrip_status() {
        let msg = IpcMessage::SetStatus(StatusPayload {
            status: LaunchStatus::Healthy,
            url: Some("http://127.0.0.1:8765".into()),
        });
        let json = encode_ipc(&msg);
        let decoded = decode_ipc(&json).unwrap();
        match decoded {
            IpcMessage::SetStatus(payload) => {
                assert_eq!(payload.status, LaunchStatus::Healthy);
                assert_eq!(payload.url.unwrap(), "http://127.0.0.1:8765");
            }
            _ => panic!("expected SetStatus"),
        }
    }

    #[test]
    fn test_decode_invalid() {
        assert!(decode_ipc("not json").is_none());
        assert!(decode_ipc("{}").is_none());
    }

    #[test]
    fn test_init_script() {
        let script = build_init_script("initializing");
        assert!(script.contains("initializing"));
        assert!(script.contains("sendMessage"));
    }
}
