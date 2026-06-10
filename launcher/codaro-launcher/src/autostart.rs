//! 부팅 시 Codaro 런처를 백그라운드(트레이) 모드로 자동 기동하도록 HKCU\...\Run에
//! 등록/해제/조회한다. Windows 전용 동작이며, 비-Windows 빌드에서는 no-op 스텁이다.

use anyhow::Result;
use std::path::Path;

/// HKCU Run 값 이름. 사용자 레지스트리에 단일 항목으로 보존된다.
pub const AUTOSTART_VALUE_NAME: &str = "Codaro";

#[cfg(windows)]
const RUN_SUBKEY: &str = r"Software\Microsoft\Windows\CurrentVersion\Run";

/// 부팅 자동시작을 등록한다(이미 있으면 값을 갱신).
pub fn enable(exe: &Path) -> Result<()> {
    #[cfg(windows)]
    {
        imp::enable_in(RUN_SUBKEY, exe)
    }
    #[cfg(not(windows))]
    {
        let _ = exe;
        Ok(())
    }
}

/// 부팅 자동시작 등록을 해제한다(없으면 무동작).
pub fn disable() -> Result<()> {
    #[cfg(windows)]
    {
        imp::disable_in(RUN_SUBKEY)
    }
    #[cfg(not(windows))]
    {
        Ok(())
    }
}

/// 현재 exe 경로로 자동시작이 등록돼 있는지 조회한다.
pub fn is_enabled(exe: &Path) -> bool {
    #[cfg(windows)]
    {
        imp::is_enabled_in(RUN_SUBKEY, exe)
    }
    #[cfg(not(windows))]
    {
        let _ = exe;
        false
    }
}

/// HKCU Run에 기록할 커맨드라인. 경로 공백을 따옴표로 방어하고 `--background`로
/// 트레이 상주 모드를 지정한다.
fn autostart_command(exe: &Path) -> String {
    format!("\"{}\" --background", exe.display())
}

#[cfg(windows)]
mod imp {
    use super::{AUTOSTART_VALUE_NAME, autostart_command};
    use anyhow::{Context, Result};
    use std::io::ErrorKind;
    use std::path::Path;
    use winreg::RegKey;
    use winreg::enums::{HKEY_CURRENT_USER, KEY_QUERY_VALUE, KEY_SET_VALUE};

    pub(super) fn enable_in(subkey: &str, exe: &Path) -> Result<()> {
        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        let (run, _) = hkcu
            .create_subkey(subkey)
            .with_context(|| format!("Failed to open registry subkey `{subkey}`."))?;
        run.set_value(AUTOSTART_VALUE_NAME, &autostart_command(exe))
            .context("Failed to write Codaro autostart value.")?;
        Ok(())
    }

    pub(super) fn disable_in(subkey: &str) -> Result<()> {
        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        let run = match hkcu.open_subkey_with_flags(subkey, KEY_SET_VALUE | KEY_QUERY_VALUE) {
            Ok(key) => key,
            Err(error) if error.kind() == ErrorKind::NotFound => return Ok(()),
            Err(error) => {
                return Err(error)
                    .with_context(|| format!("Failed to open registry subkey `{subkey}`."));
            }
        };
        match run.delete_value(AUTOSTART_VALUE_NAME) {
            Ok(()) => Ok(()),
            Err(error) if error.kind() == ErrorKind::NotFound => Ok(()),
            Err(error) => Err(error).context("Failed to delete Codaro autostart value."),
        }
    }

    pub(super) fn is_enabled_in(subkey: &str, exe: &Path) -> bool {
        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        let Ok(run) = hkcu.open_subkey_with_flags(subkey, KEY_QUERY_VALUE) else {
            return false;
        };
        match run.get_value::<String, _>(AUTOSTART_VALUE_NAME) {
            Ok(value) => value == autostart_command(exe),
            Err(_) => false,
        }
    }

    #[cfg(test)]
    mod tests {
        use super::{disable_in, enable_in, is_enabled_in};
        use std::path::PathBuf;
        use winreg::RegKey;
        use winreg::enums::HKEY_CURRENT_USER;

        // 실제 Run 키를 건드리지 않도록 격리된 테스트 전용 서브키를 쓴다.
        const TEST_SUBKEY: &str = r"Software\Codaro\autostartRoundTripTest";

        #[test]
        fn enable_is_enabled_disable_round_trip() {
            let exe = PathBuf::from(r"C:\Program Files\Codaro\codaro.exe");
            let hkcu = RegKey::predef(HKEY_CURRENT_USER);
            let _ = hkcu.delete_subkey_all(TEST_SUBKEY);

            assert!(!is_enabled_in(TEST_SUBKEY, &exe));
            enable_in(TEST_SUBKEY, &exe).unwrap();
            assert!(is_enabled_in(TEST_SUBKEY, &exe));
            // 다른 exe 경로면 매칭되지 않는다.
            assert!(!is_enabled_in(
                TEST_SUBKEY,
                &PathBuf::from(r"C:\Other\codaro.exe")
            ));
            disable_in(TEST_SUBKEY).unwrap();
            assert!(!is_enabled_in(TEST_SUBKEY, &exe));

            let _ = hkcu.delete_subkey_all(TEST_SUBKEY);
        }
    }
}
