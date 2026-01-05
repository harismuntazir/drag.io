# Drag.io 🐉
**Your Offline Media Store**

Drag.io is a powerful, minimalist, and offline-first media downloader for macOS. It allows you to drag and drop links (or use the browser integration) to download high-quality videos and audio from thousands of websites, powered by the legendary `yt-dlp` engine.

## Features 🚀

-   **Drag & Drop**: Simply drag a URL from your browser into the app to start processing.
-   **Browser Integration**: Includes a Tampermonkey userscript to add a "Drag It!" button to your browser for one-click downloads.
-   **High Quality**: Downloads the best available video quality (up to 4K/8K) with merged audio.
-   **Format Selection**: Choose between Video (MP4/MKV) or Audio Only (MP3/M4A).
-   **Queue System**: Batch download multiple videos simultaneously with a configurable concurrency limit.
-   **Smart Deduplication**: Prevents adding the same video twice.
-   **Offline First**: All dependencies (`yt-dlp`, `ffmpeg`) are bundled. No external installs required.
-   **Native Performance**: Built with Tauri (Rust) and Next.js for a blazing fast, lightweight experience on Apple Silicon.

## Installation 📦

1.  Download the latest `.dmg` from the [Releases](https://github.com/harismuntazir/drag.io/releases) page.
2.  Open the `.dmg` file.
3.  Drag **Drag.io** into your **Applications** folder.
4.  Launch the app!

## Usage 🛠️

### Method 1: The "Drag It!" Button (Recommended)
1.  Go to **Settings** > **Browser Integration**.
2.  Copy the userscript code.
3.  Install the **Tampermonkey** extension in your browser.
4.  Create a new script in Tampermonkey and paste the code.
5.  Now, on any video page, click the floating **"Drag It! 🐉"** button in the bottom-right corner.

### Method 2: Manual Add
1.  Copy a video URL.
2.  Paste it into the input box in the Drag.io app.
3.  Click **Download**.

## Build from Source (Developers Only) �️

If you want to modify the code or build it yourself, you'll need the following. **Normal users do NOT need these.**

### Prerequisites
-   Node.js (v18+)
-   Rust (latest stable)
-   pnpm

### Setup
```bash
# Clone the repository
git clone https://github.com/harismuntazir/drag.io.git
cd drag.io

# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev
```

### Building
```bash
# Build for production (macOS Apple Silicon)
pnpm tauri build --target aarch64-apple-darwin
```

### How to Release 🚀

Automated builds for macOS, Windows, and Linux are handled by GitHub Actions.

1.  **Update Version**: Bump version in `package.json` and `src-tauri/tauri.conf.json`.
2.  **Tag & Push**:
    ```bash
    git commit -am "chore: release v1.0.0"
    git tag v1.0.0
    git push origin v1.0.0
    ```
3.  **Check Actions**: Go to the GitHub "Actions" tab to see the build progress and download artifacts.

### Cross-Platform Support 🌍

Drag.io works on Windows and Linux too! To build for other platforms:

1.  **Download Binaries**: Get the execution binaries for `yt-dlp` and `ffmpeg` for your target OS.
2.  **Rename & Place**:
    -   Put them in `src-tauri/bin/`.
    -   Append the target triple to the filename (e.g., `yt-dlp-x86_64-pc-windows-msvc.exe` for Windows).
3.  **Build**: Run `pnpm tauri build` on the target machine (or use GitHub Actions).


## Credits 👨‍💻

**Developer**: Haris Muntazir
**GitHub**: [harismuntazir](https://github.com/harismuntazir/)
**Source Code**: [drag.io](https://github.com/harismuntazir/drag.io)

Powered by [Tauri](https://tauri.app/), [Next.js](https://nextjs.org/), and [yt-dlp](https://github.com/yt-dlp/yt-dlp).

## License 📄

[MIT License](LICENSE)
