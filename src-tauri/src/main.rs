// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod db;
use async_std::task;
use tauri::Window;
// use time::macros::date;

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
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
    // println!("{}", &name);
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
    let db = task::block_on(db::connect()).unwrap();
    // let name = "Jack";
    // let date = date!(2024 - 10 - 10);
    // let result = task::block_on(db::insert_employee(&db, name.to_string(), &date));
    // match result {
    //     Ok(_) => println!("insert ok"),
    //     Err(e) => eprintln!("insert failed, {}", e),
    // }

    let employee = task::block_on(db::query_all_employee(&db));

    for e in employee {
        println!("Employee: {:?}", e);
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, new_greet, stream_greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
