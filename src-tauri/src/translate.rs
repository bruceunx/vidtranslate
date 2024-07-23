use crate::VideoState;
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::sync::Arc;
use tauri::api::process::Command;
use tauri::State;
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
    model_fold: String,
    target_lang: String,
) -> Result<(), String> {
    let _fold = Path::new(&model_fold);
    let use_model = _fold
        .join("resources")
        .join("models")
        .join("llama-model.gguf");

    if !use_model.exists() {
        return Err("model not found".to_string());
    }

    let use_model_str = use_model.to_str().ok_or("failed")?.to_string();

    let args: Vec<String> = vec![
        String::from("-m"),
        use_model_str.clone(),
        String::from("-s"),
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
