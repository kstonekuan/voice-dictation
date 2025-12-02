use tauri::{AppHandle, Manager};

#[tauri::command]
pub async fn resize_overlay(app: AppHandle, width: f64, height: f64) -> Result<(), String> {
    // Enforce minimum dimensions to prevent invisible window
    let min_size = 48.0;
    let width = width.max(min_size);
    let height = height.max(min_size);

    if let Some(window) = app.get_webview_window("overlay") {
        window
            .set_size(tauri::Size::Logical(tauri::LogicalSize { width, height }))
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
