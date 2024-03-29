// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod db;
use tauri::Window;

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn new_greet(name: &str) -> String {
    format!("Hello friend, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn stream_greet(window: Window, name: &str) {
    let new_name = name.to_string();
    std::thread::spawn(move || {
        for i in 0..10 {
            let _ = window.emit(
                "greet",
                Payload {
                    message: format!("Hello, {}! You've been greeted from Rust! {}", new_name, i),
                },
            );
            std::thread::sleep(std::time::Duration::from_secs(1));
        }

        let _ = window.emit(
            "greet",
            Payload {
                message: "stop".to_string(),
            },
        );
    });
}

fn main() {
    db::init_db().unwrap();
    // let entry = db::DataEntry {
    //     name: "Jack".to_string(),
    //     age: 23,
    // };
    // db::insert_data(&entry).unwrap();
    //
    // let new_entry = db::DataEntry {
    //     name: "Lily".to_string(),
    //     age: 25,
    // };
    // db::update_data(&new_entry, 1).unwrap();
    // db::delete_data(2).unwrap();

    let all_data = db::get_all_data().unwrap();
    for data in &all_data {
        println!("{:?}", data);
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, new_greet, stream_greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
