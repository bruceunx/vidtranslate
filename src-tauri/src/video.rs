use crate::VideoState;

use tauri::State;
use tokio::sync::{mpsc, Mutex};

use std::path::{Path, PathBuf};
use std::sync::Arc;
use tokio::fs::File;
use tokio::io::{AsyncReadExt, AsyncSeekExt, SeekFrom};

#[tauri::command(rename_all = "snake_case")]
pub async fn start_video_stream(
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

    let (tx, rx) = mpsc::channel(1);
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
pub async fn get_video_chunk(state: State<'_, Mutex<VideoState>>) -> Result<Vec<u8>, String> {
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

#[tauri::command]
pub fn get_video_file_path(file_path: &str) -> String {
    let sanitized_path = Path::new(file_path)
        .canonicalize()
        .unwrap_or_else(|_| PathBuf::from(""))
        .to_str()
        .unwrap_or("")
        .to_string();

    sanitized_path
}
