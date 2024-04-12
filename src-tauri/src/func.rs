#![allow(dead_code)]

#[tauri::command]
pub fn func1() -> String {
    return "func1->return".to_string();
}

#[tauri::command]
pub fn func2() -> String {
    return "func2->return".to_string();
}
