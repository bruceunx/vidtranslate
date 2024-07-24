use crate::VideoState;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::api::path::cache_dir;
use tauri::api::process::{Command, CommandEvent};
use tauri::State;
use tokio::fs::File;
use tokio::io::{self, AsyncWriteExt, BufWriter};
use tokio::sync::{mpsc, Mutex};

#[derive(Serialize, Clone, Deserialize)]
pub struct DataPayload {
    time_start: u32,
    time_end: u32,
    text_str: String,
}

#[allow(dead_code)]
#[tauri::command(rename_all = "snake_case")]
pub async fn run_llama(
    state: State<'_, Mutex<VideoState>>,
    lines: Vec<DataPayload>,
    use_model_str: String,
    target_lang: String,
) -> Result<(), String> {
    let args: Vec<String> = vec![
        String::from("-m"),
        use_model_str.clone(),
        String::from("--seed"),
        String::from("2024"),
        String::from("-p"),
    ];

    let (ttx, trx) = mpsc::channel(1);
    let llama_sender = ttx.clone();
    {
        let mut state = state.lock().await;
        state.llama_sender = Arc::new(Mutex::new(ttx));
        state.llama_recv = Arc::new(Mutex::new(trx));
    }

    tauri::async_runtime::spawn(async move {
        let start = DataPayload {
            time_start: 0,
            time_end: 0,
            text_str: "start".to_string(),
        };
        llama_sender.send(start).await.expect("error");
        for line in lines {
            let mut new_args = args.clone();
            let new_text = format!("<2{}> {}", target_lang, line.text_str);
            new_args.push(new_text);
            let output = Command::new_sidecar("llama")
                .expect("Failed to create `llama` command")
                .args(new_args)
                .output()
                .expect("Failed to run `llama`");

            let result = DataPayload {
                time_start: line.time_start,
                time_end: line.time_end,
                text_str: output.stdout,
            };
            if output.status.success() {
                if llama_sender.send(result).await.is_err() {
                    break;
                }
            }
        }
        let end = DataPayload {
            time_start: 0,
            time_end: 0,
            text_str: "end".to_string(),
        };
        llama_sender.send(end).await.expect("error");
    });
    Ok(())
}

#[tauri::command]
pub async fn get_llama_txt(state: State<'_, Mutex<VideoState>>) -> Result<DataPayload, String> {
    let rx_clone = {
        let state = state.lock().await;
        state.llama_recv.clone()
    };

    let var = rx_clone.lock().await.recv().await;
    match var {
        Some(chunk) => Ok(chunk),
        None => Err("No more data".into()),
    }
}

// #[tauri::command]
// pub async fn stop_llama(state: State<'_, Mutex<VideoState>>) -> Result<(), String> {
//     let stop_llama = state.lock().await.stop_llama.clone();
//     stop_llama.store(true, Ordering::Release);
//     Ok(())
// }
//
#[tauri::command]
pub async fn stop_llama(state: State<'_, Mutex<VideoState>>) -> Result<(), String> {
    let (ttx, trx) = mpsc::channel(1);
    {
        let mut state = state.lock().await;
        state.llama_sender = Arc::new(Mutex::new(ttx));
        state.llama_recv = Arc::new(Mutex::new(trx));
    }
    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub async fn run_llama_stream(
    state: State<'_, Mutex<VideoState>>,
    lines: Vec<DataPayload>,
    use_model_str: String,
    target_lang: String,
) -> Result<(), String> {
    let cache_dir = cache_dir().ok_or("failed")?;

    let folder_path = cache_dir.join("llama-rust-desktop").join("txt-cache");

    if !folder_path.exists() {
        std::fs::create_dir_all(&folder_path).map_err(|e| format!("{}", e))?;
    }

    let txt_file_path = folder_path
        .join("temp.txt")
        .to_str()
        .ok_or("failed")?
        .to_string();

    let text_vec: Vec<String> = lines
        .clone()
        .into_iter()
        .map(|line| format!("<2{}> {}", target_lang, line.text_str))
        .collect();

    let _ = write_vector_to_file(&txt_file_path, text_vec).await;

    let args: Vec<String> = vec![
        String::from("-m"),
        use_model_str.clone(),
        String::from("-s"),
        String::from("2024"),
        String::from("-f"),
        txt_file_path.clone(),
        String::from("--log-disable"),
    ];

    let (ttx, trx) = mpsc::channel(1);
    let llama_sender = ttx.clone();
    {
        let mut state = state.lock().await;
        state.llama_sender = Arc::new(Mutex::new(ttx));
        state.llama_recv = Arc::new(Mutex::new(trx));
    }

    let (mut rx, _) = Command::new_sidecar("llama")
        .expect("failed to create `llama` binary command")
        .args(args)
        .spawn()
        .expect("failed to spawn sidecar");

    tauri::async_runtime::spawn(async move {
        let start = DataPayload {
            time_start: 0,
            time_end: 0,
            text_str: "start".to_string(),
        };
        llama_sender.send(start).await.expect("error");
        let mut idx = 0;
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(stdout) = event {
                let result = DataPayload {
                    time_start: lines[idx].time_start,
                    time_end: lines[idx].time_end,
                    text_str: stdout,
                };
                if llama_sender.send(result).await.is_err() {
                    break;
                }
            }
            idx += 1;
        }
        let end = DataPayload {
            time_start: 0,
            time_end: 0,
            text_str: "end".to_string(),
        };
        llama_sender.send(end).await.expect("error");
    });
    Ok(())
}

async fn write_vector_to_file(filename: &str, lines: Vec<String>) -> io::Result<()> {
    let file = File::create(filename).await?;
    let mut writer = BufWriter::new(file);

    for line in lines {
        writer.write_all(line.as_bytes()).await?;
        writer.write_all(b"\n").await?;
    }

    writer.flush().await?;
    Ok(())
}
