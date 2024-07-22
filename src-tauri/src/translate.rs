use crate::VideoState;
use serde::Serialize;
use std::sync::atomic::Ordering;
use tauri::api::process::Command;
use tauri::{Manager, State};
use tokio::sync::Mutex;

#[derive(Serialize, Clone)]
struct DataPayload {
    index: usize,
    output: String,
}

#[allow(dead_code)]
#[tauri::command(rename_all = "snake_case")]
pub async fn _run_llama(
    app_handle: tauri::AppHandle,
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

    app_handle
        .emit_all("data_stream", "start")
        .expect("Failed to emit event");

    let stop_llama = state.lock().await.stop_llama.clone();
    stop_llama.store(false, Ordering::Release);

    tauri::async_runtime::spawn(async move {
        for (index, line) in lines.iter().enumerate() {
            if stop_llama.load(Ordering::Acquire) {
                app_handle
                    .emit_all("data_stream", "stopped")
                    .expect("Failed to emit event");
                break;
            }
            let mut new_args = args.clone();
            new_args.push(line.to_string());
            let output = Command::new_sidecar("llama")
                .expect("Failed to create `llama` command")
                .args(new_args)
                .output()
                .expect("Failed to run `llama`");
            let payload = DataPayload {
                index,
                output: output.stdout,
            };
            if output.status.success() {
                app_handle
                    .emit_all("data_stream", payload)
                    .expect("Failed to emit event");
            }
        }
    });
    Ok(())
}

#[tauri::command]
pub async fn stop_llama(state: State<'_, Mutex<VideoState>>) -> Result<(), String> {
    let stop_llama = state.lock().await.stop_llama.clone();
    stop_llama.store(true, Ordering::Release);
    Ok(())
}
