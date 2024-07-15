// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod db;
mod func;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tauri::api::file::read_binary;
use tauri::{State, Window};
use tokio::fs::File;
use tokio::io::{AsyncReadExt, AsyncSeekExt, SeekFrom};
use tokio::sync::{mpsc, Mutex};

trait New {
    fn new() -> Self;
}

struct VideoState {
    sender: Arc<Mutex<mpsc::Sender<Vec<u8>>>>,
    recv: Arc<Mutex<mpsc::Receiver<Vec<u8>>>>,
}

impl New for VideoState {
    fn new() -> VideoState {
        let (tx, rx) = mpsc::channel(10);
        let video_state = VideoState {
            sender: Arc::new(Mutex::new(tx)),
            recv: Arc::new(Mutex::new(rx)),
        };
        return video_state;
    }
}

#[tauri::command(rename_all = "snake_case")]
async fn start_video_stream(
    state: State<'_, Mutex<VideoState>>,
    offset: u64,
    file_path: &str,
) -> Result<(), String> {
    let mut file = File::open(file_path)
        .await
        .map_err(|e| format!("Failed to open video file: {}", e))?;
    file.seek(SeekFrom::Start(offset))
        .await
        .map_err(|e| format!("Failed to seek video file: {}", e))?;

    let (tx, rx) = mpsc::channel(10);
    let tx_clone = tx.clone();
    {
        let mut state = state.lock().await;
        state.sender = Arc::new(Mutex::new(tx));
        state.recv = Arc::new(Mutex::new(rx));
    }

    tauri::async_runtime::spawn(async move {
        let mut buffer = vec![0; 1024 * 1024 * 10];
        loop {
            match file.read(&mut buffer).await {
                Ok(0) => break, // End of file
                Ok(n) => {
                    if tx_clone.send(buffer[..n].to_vec()).await.is_err() {
                        break;
                    }
                }
                Err(_) => break,
            }
        }
    });

    Ok(())
}

#[tauri::command]
async fn get_video_chunk(state: State<'_, Mutex<VideoState>>) -> Result<Vec<u8>, String> {
    let rx_clone = {
        let state = state.lock().await;
        state.recv.clone()
    };

    let var = rx_clone.lock().await.recv().await;
    match var {
        Some(chunk) => Ok(chunk),
        None => Err("No more data".into()),
    }
}

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}

#[tauri::command]
fn get_video_file_path(file_path: &str) -> String {
    let sanitized_path = Path::new(file_path)
        .canonicalize() // Get the absolute, normalized path
        .unwrap_or_else(|_| PathBuf::from("")) // Handle errors safely
        .to_str()
        .unwrap_or("")
        .to_string();

    sanitized_path
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn new_greet(name: &str) -> String {
    format!("Hello friend, {}! You've been greeted from Rust!", name)
}

#[tauri::command(rename_all = "snake_case")]
fn stream_greet(window: Window, name_str: String) {
    std::thread::spawn(move || {
        for i in 0..10 {
            let _ = window.emit(
                "greet",
                Payload {
                    message: format!("Hello, {}! You've been greeted from Rust! {}", name_str, i),
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

#[tauri::command(rename_all = "snake_case")]
async fn async_stream(window: Window, name_str: String) {
    for i in 0..10 {
        let _ = window.emit(
            "greet",
            Payload {
                message: format!("Hello, {}! You've been greeted from Rust! {}", name_str, i),
            },
        );
        std::thread::sleep(std::time::Duration::from_secs(1));
    }
}

#[tauri::command]
async fn read_file(file_path: String) -> Result<Vec<u8>, String> {
    let path = PathBuf::from(file_path);
    match read_binary(path) {
        Ok(file_content) => Ok(file_content),
        Err(e) => Err(e.to_string()),
    }
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
        .manage(Mutex::new(VideoState::new()))
        .invoke_handler(tauri::generate_handler![
            greet,
            new_greet,
            stream_greet,
            read_file,
            async_stream,
            func::func1,
            func::func2,
            get_video_file_path,
            start_video_stream,
            get_video_chunk,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
