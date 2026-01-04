import { invoke } from '@tauri-apps/api/core';

export interface VideoFormat {
  format_id: string;
  height: number | null;
  ext: string;
  filesize: number | null;
}

export interface VideoMetadata {
  id: string;
  title: string;
  thumbnail: string;
  duration: number | null;
  formats: VideoFormat[];
}

export async function fetchMetadata(url: string): Promise<VideoMetadata> {
  return invoke('fetch_metadata', { url });
}

export async function downloadVideo(id: string, url: string, formatId: string, path: string): Promise<void> {
  return invoke('download_video', { id, url, formatId, path });
}
