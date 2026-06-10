//! 트레이 아이콘 + 메뉴. 창을 닫아도 백엔드가 살아 있고, 트레이에서 다시 열거나
//! 자동시작을 토글하거나 완전히 종료할 수 있다. 메뉴 클릭 id는 main의 이벤트 루프로
//! 전달돼 액션으로 매핑된다.

use anyhow::{Context, Result};
use tray_icon::menu::{CheckMenuItem, Menu, MenuId, MenuItem, PredefinedMenuItem};
use tray_icon::{Icon, TrayIcon, TrayIconBuilder};

/// 트레이 메뉴가 발행하는 사용자 액션.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TrayAction {
    Open,
    ToggleAutostart,
    Quit,
}

struct TrayMenuIds {
    open: MenuId,
    autostart: MenuId,
    quit: MenuId,
}

/// 트레이 아이콘 핸들. 트레이가 보이는 동안 `_tray`가 살아 있어야 한다.
pub struct TrayHandle {
    _tray: TrayIcon,
    autostart_item: CheckMenuItem,
    ids: TrayMenuIds,
}

/// 메뉴 이벤트 id 문자열을 트레이 액션으로 매핑한다(순수 함수, 테스트 가능).
fn resolve_action(id: &str, ids: &TrayMenuIds) -> Option<TrayAction> {
    if id == ids.open.0 {
        Some(TrayAction::Open)
    } else if id == ids.autostart.0 {
        Some(TrayAction::ToggleAutostart)
    } else if id == ids.quit.0 {
        Some(TrayAction::Quit)
    } else {
        None
    }
}

impl TrayHandle {
    /// 메뉴 이벤트 id로 액션을 찾는다.
    pub fn action_for(&self, id: &str) -> Option<TrayAction> {
        resolve_action(id, &self.ids)
    }

    /// 자동시작 체크 항목 상태를 레지스트리 진실에 맞춰 보정한다.
    pub fn set_autostart_checked(&self, checked: bool) {
        self.autostart_item.set_checked(checked);
    }
}

/// 트레이 아이콘과 메뉴를 만든다. `autostart_enabled`는 자동시작 체크박스 초기 상태다.
/// 이벤트 루프가 도는 GUI 스레드에서 호출해야 한다(트레이 메시지 펌프 의존).
pub fn build_tray(autostart_enabled: bool) -> Result<TrayHandle> {
    let open = MenuItem::new("Codaro 열기", true, None);
    let autostart = CheckMenuItem::new("시작 시 자동 실행", true, autostart_enabled, None);
    let quit = MenuItem::new("종료", true, None);

    let menu = Menu::new();
    menu.append_items(&[
        &open,
        &PredefinedMenuItem::separator(),
        &autostart,
        &PredefinedMenuItem::separator(),
        &quit,
    ])
    .context("Failed to assemble tray menu.")?;

    let ids = TrayMenuIds {
        open: open.id().clone(),
        autostart: autostart.id().clone(),
        quit: quit.id().clone(),
    };

    let mut builder = TrayIconBuilder::new()
        .with_menu(Box::new(menu))
        .with_tooltip("Codaro")
        .with_menu_on_left_click(false);
    if let Some(icon) = load_tray_icon() {
        builder = builder.with_icon(icon);
    }
    let tray = builder.build().context("Failed to create tray icon.")?;

    Ok(TrayHandle {
        _tray: tray,
        autostart_item: autostart,
        ids,
    })
}

fn load_tray_icon() -> Option<Icon> {
    let decoder = png::Decoder::new(crate::ICON_PNG);
    let mut reader = decoder.read_info().ok()?;
    if reader.info().color_type != png::ColorType::Rgba
        || reader.info().bit_depth != png::BitDepth::Eight
    {
        return None;
    }
    let mut buffer = vec![0u8; reader.output_buffer_size()];
    let frame = reader.next_frame(&mut buffer).ok()?;
    buffer.truncate(frame.buffer_size());
    Icon::from_rgba(buffer, frame.width, frame.height).ok()
}

#[cfg(test)]
mod tests {
    use super::{TrayAction, TrayMenuIds, resolve_action};
    use tray_icon::menu::MenuId;

    #[test]
    fn resolve_action_maps_each_menu_id() {
        let ids = TrayMenuIds {
            open: MenuId::new("open"),
            autostart: MenuId::new("autostart"),
            quit: MenuId::new("quit"),
        };

        assert_eq!(resolve_action("open", &ids), Some(TrayAction::Open));
        assert_eq!(
            resolve_action("autostart", &ids),
            Some(TrayAction::ToggleAutostart)
        );
        assert_eq!(resolve_action("quit", &ids), Some(TrayAction::Quit));
        assert_eq!(resolve_action("nope", &ids), None);
    }
}
