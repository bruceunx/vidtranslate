// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod commands;
mod db;
mod video;
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex};

trait New {
    fn new() -> Self;
}

struct VideoState {
    sender: Arc<Mutex<mpsc::Sender<Vec<u8>>>>,
    recv: Arc<Mutex<mpsc::Receiver<Vec<u8>>>>,
    tsender: Arc<Mutex<mpsc::Sender<String>>>,
    trecv: Arc<Mutex<mpsc::Receiver<String>>>,
}

impl New for VideoState {
    fn new() -> VideoState {
        let (tx, rx) = mpsc::channel(1);
        let (ttx, trx) = mpsc::channel(1);
        let video_state = VideoState {
            sender: Arc::new(Mutex::new(tx)),
            recv: Arc::new(Mutex::new(rx)),
            tsender: Arc::new(Mutex::new(ttx)),
            trecv: Arc::new(Mutex::new(trx)),
        };
        return video_state;
    }
}

fn main() {
    tauri::Builder::default()
        .manage(Mutex::new(VideoState::new()))
        .invoke_handler(tauri::generate_handler![
            video::get_video_file_path,
            video::start_video_stream,
            video::get_video_chunk,
            commands::run_ffprobe,
            commands::run_ffmpeg,
            commands::run_whisper,
            commands::get_whisper_txt,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
