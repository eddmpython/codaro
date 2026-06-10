//! Windows 단일 인스턴스 가드. 이미 상주 중인 런처가 있으면 named event로 "창을 띄워라"
//! 신호만 보내고 새 프로세스는 조용히 종료한다(상주 백엔드·트레이 중복 방지).
//! 비-Windows 빌드에서는 항상 Primary로 동작한다(가드는 no-op).

/// 단일 인스턴스 점유 결과.
#[derive(Debug)]
pub enum Acquisition {
    /// 우리가 첫(상주) 인스턴스다. 가드를 살려 두는 동안 점유가 유지된다.
    Primary(InstanceGuard),
    /// 이미 다른 인스턴스가 상주 중이며, 그쪽에 표시 신호를 보냈다.
    AlreadyRunning,
}

#[cfg(windows)]
pub use imp::{InstanceGuard, acquire_or_signal_existing};

#[cfg(not(windows))]
pub use stub::{InstanceGuard, acquire_or_signal_existing};

#[cfg(windows)]
mod imp {
    use super::Acquisition;
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;
    use windows_sys::Win32::Foundation::{
        CloseHandle, ERROR_ALREADY_EXISTS, GetLastError, HANDLE, WAIT_OBJECT_0,
    };
    use windows_sys::Win32::System::Threading::{
        CreateEventW, CreateMutexW, EVENT_MODIFY_STATE, INFINITE, OpenEventW, SetEvent,
        WaitForSingleObject,
    };

    const SINGLETON_MUTEX: &str = r"Local\CodaroLauncherSingleton";
    const SHOW_EVENT: &str = r"Local\CodaroLauncherShow";

    fn wide(value: &str) -> Vec<u16> {
        OsStr::new(value)
            .encode_wide()
            .chain(std::iter::once(0))
            .collect()
    }

    /// 커널 핸들을 워커 스레드로 넘기기 위한 Send 래퍼. 커널 핸들은 프로세스 전역이라
    /// 스레드 간 사용이 안전하다.
    struct SendHandle(HANDLE);
    unsafe impl Send for SendHandle {}

    /// 첫 인스턴스가 보유하는 가드. 살아 있는 동안 named mutex·event 핸들을 점유한다.
    #[derive(Debug)]
    pub struct InstanceGuard {
        mutex: HANDLE,
        show_event: HANDLE,
    }

    impl Drop for InstanceGuard {
        fn drop(&mut self) {
            unsafe {
                if !self.show_event.is_null() {
                    CloseHandle(self.show_event);
                }
                if !self.mutex.is_null() {
                    CloseHandle(self.mutex);
                }
            }
        }
    }

    impl InstanceGuard {
        /// 두 번째 인스턴스가 보내는 표시 신호를 백그라운드에서 감시하고, 신호마다 `on_show`를
        /// 호출한다(메인 이벤트 루프로 ShowWindow를 전달하는 용도). 가드는 프로세스 수명
        /// 동안 살아 있으므로 워커가 빌려 쓰는 핸들도 유효하다.
        pub fn watch_show_requests<F>(&self, on_show: F)
        where
            F: Fn() + Send + 'static,
        {
            let handle = SendHandle(self.show_event);
            std::thread::spawn(move || {
                let handle = handle;
                if handle.0.is_null() {
                    return;
                }
                loop {
                    let result = unsafe { WaitForSingleObject(handle.0, INFINITE) };
                    if result != WAIT_OBJECT_0 {
                        break;
                    }
                    on_show();
                }
            });
        }
    }

    pub fn acquire_or_signal_existing() -> Acquisition {
        let mutex_name = wide(SINGLETON_MUTEX);
        let mutex = unsafe { CreateMutexW(std::ptr::null(), 0, mutex_name.as_ptr()) };
        // CreateMutexW 직후 즉시 last-error를 읽어야 한다(중간 Win32 호출 금지).
        let already_running = unsafe { GetLastError() } == ERROR_ALREADY_EXISTS;

        if already_running {
            // 두 번째 인스턴스: 기존 인스턴스에 표시 신호만 보내고 종료한다.
            if !mutex.is_null() {
                unsafe { CloseHandle(mutex) };
            }
            let event_name = wide(SHOW_EVENT);
            let event = unsafe { OpenEventW(EVENT_MODIFY_STATE, 0, event_name.as_ptr()) };
            if !event.is_null() {
                unsafe {
                    SetEvent(event);
                    CloseHandle(event);
                }
            }
            return Acquisition::AlreadyRunning;
        }

        // 첫 인스턴스: 표시 신호용 auto-reset 이벤트(수동리셋=false, 초기상태=false)를 만든다.
        let event_name = wide(SHOW_EVENT);
        let show_event = unsafe { CreateEventW(std::ptr::null(), 0, 0, event_name.as_ptr()) };
        Acquisition::Primary(InstanceGuard { mutex, show_event })
    }

    #[cfg(test)]
    mod tests {
        use super::super::Acquisition;
        use super::acquire_or_signal_existing;

        #[test]
        fn second_acquisition_detects_running_instance() {
            let first = acquire_or_signal_existing();
            assert!(matches!(first, Acquisition::Primary(_)));
            // 같은 프로세스라도 이름 충돌 mutex는 ERROR_ALREADY_EXISTS를 돌려준다.
            let second = acquire_or_signal_existing();
            assert!(matches!(second, Acquisition::AlreadyRunning));
            drop(first);
        }
    }
}

#[cfg(not(windows))]
mod stub {
    use super::Acquisition;

    #[derive(Debug)]
    pub struct InstanceGuard;

    impl InstanceGuard {
        pub fn watch_show_requests<F>(&self, _on_show: F)
        where
            F: Fn() + Send + 'static,
        {
        }
    }

    pub fn acquire_or_signal_existing() -> Acquisition {
        Acquisition::Primary(InstanceGuard)
    }
}
