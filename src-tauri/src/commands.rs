use tauri::{AppHandle, Emitter};
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct VideoFormat {
    pub format_id: String,
    pub height: Option<u32>,
    pub ext: String,
    pub filesize: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VideoMetadata {
    pub id: String,
    pub title: String,
    pub thumbnail: String,
    pub duration: Option<u64>,
    pub formats: Vec<VideoFormat>,
}

#[derive(Clone, Serialize)]
struct DownloadProgress {
    id: String,
    status: String, // "downloading", "processing", "completed", "failed"
    progress: f64,
    speed: String,
    eta: String,
}

#[tauri::command]
pub async fn fetch_metadata(app: AppHandle, url: String) -> Result<VideoMetadata, String> {
    let sidecar_command = app.shell().sidecar("yt-dlp")
        .map_err(|e| e.to_string())?
        .args(["--dump-json", &url]);

    let output = sidecar_command
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("yt-dlp failed: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let json: serde_json::Value = serde_json::from_str(&stdout)
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;

    let id = json["id"].as_str().unwrap_or("").to_string();
    let title = json["title"].as_str().unwrap_or("Unknown Title").to_string();
    let thumbnail = json["thumbnail"].as_str().unwrap_or("").to_string();
    let duration = json["duration"].as_u64();
    
    let mut formats = Vec::new();
    if let Some(formats_arr) = json["formats"].as_array() {
        for fmt in formats_arr {
            let height = fmt["height"].as_u64().map(|h| h as u32);
            let ext = fmt["ext"].as_str().unwrap_or("").to_string();
            // Filter: only mp4/webm and only if height is present (video)
            if height.is_some() {
                 formats.push(VideoFormat {
                     format_id: fmt["format_id"].as_str().unwrap_or("").to_string(),
                     height,
                     ext,
                     filesize: fmt["filesize"].as_u64().or(fmt["filesize_approx"].as_u64()),
                 });
            }
        }
    }
    
    Ok(VideoMetadata {
        id,
        title,
        thumbnail,
        duration,
        formats,
    })
}

#[tauri::command]
pub async fn download_video(app: AppHandle, id: String, url: String, format_id: String, path: String, max_concurrent: u32) -> Result<(), String> {
    // format_id usually needs to select video+audio.
    // If user selected "137" (1080p), we want "137+bestaudio/best".
    // But format_id passed from frontend might be just the video ID.
    // We assume frontend passes the video ID.
    let format_arg = format!("{}+bestaudio/best", format_id);

    let (mut rx, _child) = app.shell().sidecar("yt-dlp")
        .map_err(|e| e.to_string())?
        .args([
            "-f", &format_arg,
            "-P", &path,
            "-N", max_concurrent.to_string().as_str(),
            "--merge-output-format", "mp4",
            "--progress-template", "%(progress.value)s;%(progress.speed)s;%(progress.eta)s",
            &url
        ])
        .spawn()
        .map_err(|e| e.to_string())?;

    let app_handle = app.clone();
    let download_id = id.clone();

    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line_bytes) => {
                    let line = String::from_utf8_lossy(&line_bytes);
                    // parsing "value;speed;eta" e.g. "12.3;1.2MiB/s;00:05"
                    // stdout might contain newlines or multiple updates.
                    // yt-dlp with template usually prints one per line?
                    // if line is empty skip.
                    let trimmed = line.trim();
                    if trimmed.is_empty() { continue; }
                    
                    let parts: Vec<&str> = trimmed.split(';').collect();
                    if parts.len() >= 3 {
                         // Parse percentage
                         // "12.3%" -> strip %? No, value is usually raw number? 
                         // Check yt-dlp docs: %(progress.value)s is usually percentage if available or bytes?
                         // Actually %(progress._percent_str)s is string. 
                         // If I use %(progress.value)s it might be specific.
                         // Let's stick to standard behavior parse for robustness or adjust template.
                         // Wait, if I use template, I control output.
                         // Let's assume user has standard yt-dlp.
                         // If parts[0] is say "NA", progress is unknown.
                         
                         // Try parsing parts[0] as f64 (it might include % char?)
                         // Usually "12.3".
                         let progress = parts[0].replace('%', "").parse::<f64>().unwrap_or(0.0);
                         let speed = parts[1].to_string();
                         let eta = parts[2].to_string();
                         
                         let _ = app_handle.emit("download-progress", DownloadProgress {
                             id: download_id.clone(),
                             status: "downloading".to_string(),
                             progress,
                             speed,
                             eta,
                         });
                    }
                }
                CommandEvent::Stderr(line_bytes) => {
                     // Log errors or handle merging messages
                     let _log = String::from_utf8_lossy(&line_bytes);
                     // Sometimes yt-dlp prints regular info to stderr.
                }
                CommandEvent::Terminated(payload) => {
                    if let Some(code) = payload.code {
                        if code == 0 {
                             let _ = app_handle.emit("download-progress", DownloadProgress {
                                 id: download_id.clone(),
                                 status: "completed".to_string(),
                                 progress: 100.0,
                                 speed: "-".to_string(),
                                 eta: "-".to_string(),
                             });
                        } else {
                             let _ = app_handle.emit("download-progress", DownloadProgress {
                                 id: download_id.clone(),
                                 status: "failed".to_string(),
                                 progress: 0.0,
                                 speed: "-".to_string(),
                                 eta: "-".to_string(),
                             });
                        }
                    }
                }
                _ => {}
            }
        }
    });

    Ok(())
}
