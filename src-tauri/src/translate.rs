use tauri::api::process::Command;
use tauri::Manager;

#[tauri::command(rename_all = "snake_case")]
pub async fn run_llama(app_handle: tauri::AppHandle, lines: Vec<String>, use_model_str: String) {
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

    tauri::async_runtime::spawn(async move {
        for line in lines {
            let mut new_args = args.clone();
            new_args.push(line);
            let output = Command::new_sidecar("llama")
                .expect("Failed to create `llama` command")
                .args(new_args)
                .output()
                .expect("Failed to run `llama`");
            if output.status.success() {
                app_handle
                    .emit_all("data_stream", output.stdout)
                    .expect("Failed to emit event");
            }
        }
    });
}
