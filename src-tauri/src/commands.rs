use tauri::api::path::cache_dir;
use tauri::api::process::{Command, CommandEvent};
// use tauri::Window;

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
