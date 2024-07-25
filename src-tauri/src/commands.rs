use crate::VideoState;

use std::path::Path;
use tauri::State;
use tokio::sync::{mpsc, Mutex};

use std::sync::Arc;
use tauri::api::path::cache_dir;
use tauri::api::process::{Command, CommandEvent};

#[tauri::command(rename_all = "snake_case")]
pub async fn run_ffprobe(file_path: String) -> Result<String, String> {
    let (mut rx, _) = Command::new_sidecar("ffprobe")
        .expect("failed to create `ffprobe` binary command")
        .args([
            "-i",
            &file_path,
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
        ])
        .spawn()
        .expect("Failed to spawn sidecar");

    let handle = tauri::async_runtime::spawn(async move {
        let mut output = String::new();
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(line) = event {
                output.push_str(&line);
            }
        }
        Ok(format!("{}", output.trim()))
    });
    match handle.await {
        Ok(result) => result,
        Err(err) => Err(format!("Error running ffprobe: {}", err)),
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn run_ffmpeg(file_path: String) -> Result<String, String> {
    let cache_dir = cache_dir().ok_or("failed")?;

    let folder_path = cache_dir.join("llama-rust-desktop").join("wav-cache");

    if !folder_path.exists() {
        std::fs::create_dir_all(&folder_path).map_err(|e| format!("{}", e))?;
    }

    let wav_file_path = folder_path
        .join("temp.wav")
        .to_str()
        .ok_or("failed")?
        .to_string();

    let command = Command::new_sidecar("ffmpeg")
        .expect("failed to create `ffmpeg` binary command")
        .args([
            "-y",
            "-i",
            &file_path,
            "-ar",
            "16000",
            "-ac",
            "1",
            "-c:a",
            "pcm_s16le",
            &wav_file_path,
        ]);

    match command.output() {
        Ok(output) => {
            if output.status.success() {
                Ok("ok".to_string())
            } else {
                Err("error".to_string())
            }
        }
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn run_whisper(
    state: State<'_, Mutex<VideoState>>,
    model_path: String,
    lang: String,
) -> Result<(), String> {
    let cache_dir = cache_dir().ok_or("failed")?;

    let wav_file_path = cache_dir
        .join("llama-rust-desktop")
        .join("wav-cache")
        .join("temp.wav");

    if !wav_file_path.exists() {
        return Err("no wav file found".to_string());
    }

    let wav_file_str = wav_file_path.to_str().ok_or("failed")?.to_string();

    let use_model = Path::new(&model_path);
    if !use_model.exists() {
        return Err("model not found".to_string());
    }

    // let use_model_str = use_model.to_str().ok_or("failed")?.to_string();
    let mut args: Vec<String> = vec![
        String::from("-m"),
        model_path.clone(),
        String::from("-f"),
        wav_file_str.clone(),
        String::from("-np"),
    ];

    args.push(String::from("-l"));
    args.push(lang.clone());
    // if lang != String::from("auto") {
    //     args.push(String::from("-l"));
    //     args.push(lang.clone());
    // }

    let (mut rx, _) = Command::new_sidecar("whisper")
        .expect("failed to create `whisper` binary command")
        .args(args)
        .spawn()
        .expect("failed to spawn sidecar");

    let (ttx, trx) = mpsc::channel(1);
    let tx_clone = ttx.clone();
    {
        let mut state = state.lock().await;
        state.tsender = Arc::new(Mutex::new(ttx));
        state.trecv = Arc::new(Mutex::new(trx));
    }
    tauri::async_runtime::spawn(async move {
        tx_clone.send("start".to_string()).await.expect("error");
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(line) = event {
                if tx_clone.send(line).await.is_err() {
                    break;
                }
            } else {
                break;
            }
        }
        tx_clone.send("end".to_string()).await.expect("error");
    });

    Ok(())
}

#[tauri::command]
pub async fn stop_whisper(state: State<'_, Mutex<VideoState>>) -> Result<(), String> {
    let (ttx, trx) = mpsc::channel(1);
    {
        let mut state = state.lock().await;
        state.tsender = Arc::new(Mutex::new(ttx));
        state.trecv = Arc::new(Mutex::new(trx));
    }
    Ok(())
}

#[tauri::command]
pub async fn get_whisper_txt(state: State<'_, Mutex<VideoState>>) -> Result<String, String> {
    let rx_clone = {
        let state = state.lock().await;
        state.trecv.clone()
    };

    let var = rx_clone.lock().await.recv().await;
    match var {
        Some(chunk) => Ok(chunk),
        None => Err("No more data".into()),
    }
}
