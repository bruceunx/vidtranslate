use crate::VideoState;
// use serde::Serialize;
use std::sync::Arc;
use tauri::api::process::Command;
use tauri::State;
use tokio::sync::{mpsc, Mutex};

// #[derive(Serialize, Clone)]
// struct DataPayload {
//     time_start: u32,
//     time_end: u32,
//     text_str: String,
// }

#[allow(dead_code)]
#[tauri::command(rename_all = "snake_case")]
pub async fn run_llama(
    state: State<'_, Mutex<VideoState>>,
    lines: Vec<String>,
    use_model_str: String,
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
        llama_sender.send("start".to_string()).await.expect("error");
        for line in lines {
            let mut new_args = args.clone();
            new_args.push(line);
            let output = Command::new_sidecar("llama")
                .expect("Failed to create `llama` command")
                .args(new_args)
                .output()
                .expect("Failed to run `llama`");
            if output.status.success() {
                if llama_sender.send(output.stdout).await.is_err() {
                    break;
                }
            }
        }
        llama_sender.send("end".to_string()).await.expect("error");
    });
    Ok(())
}

#[tauri::command]
pub async fn get_llama_txt(state: State<'_, Mutex<VideoState>>) -> Result<String, String> {
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
