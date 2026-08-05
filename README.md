# Melodia

AI-powered music creation tool. Transform text descriptions into unique music with DeepSeek AI and Tone.js synthesis.

## Features

- **Text-to-Music** — describe a scene or mood, AI composes the music
- **Lyrics-to-Song** — paste lyrics, AI generates melody and chords
- **7 Style Presets** — Electronic, Classical, Jazz, Pop, Rock, Lo-Fi, Ambient
- **Real-time Playback** — browser-based synthesis via Tone.js (play, pause, stop)
- **WAV/MIDI Export** — download your creations as audio or MIDI files
- **Music Visualization** — chord progression display and note density view
- **Dark/Light Theme** — follow system, manual switch, or extract colors from images
- **Bilingual** — Chinese and English UI
- **Desktop App** — Electron wrapper for Windows and macOS

## Quick Start

### Web

```bash
npm install
npm run dev      # http://localhost:5173
```

### Desktop

```bash
npm run electron:dev       # Dev mode with hot reload
npm run electron:build:win # Build Windows installer
npm run electron:build:mac # Build macOS DMG
```

## Configuration

1. Open **Settings**
2. Enter your **DeepSeek API Key** (or OpenAI / custom endpoint)
3. Select model and language preferences
4. Start creating on the **Create** page

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Audio | Tone.js |
| Sheet Music | VexFlow |
| i18n | react-i18next |
| Desktop | Electron |

## Architecture

Pure frontend — no backend server. Data stored in browser localStorage (config) and IndexedDB (history). AI API calls go directly from the browser to DeepSeek/OpenAI endpoints.

See [docs/architecture.md](docs/architecture.md) for detailed module contracts and data flow.

## Project Structure

```
src/
├── components/ui/    # Reusable UI components (Button, Modal, etc.)
├── modules/          # Business modules
│   ├── input/        # Music generation input panel
│   ├── result/       # Playback + visualization
│   ├── history/      # Generation history
│   ├── settings/     # API key, model, preferences
│   └── theme/        # Custom theme from image
├── services/         # Core logic layer
│   ├── ai/           # DeepSeek API client
│   ├── audio/        # Tone.js synthesis engine
│   ├── config/       # User settings
│   ├── export/       # WAV/MIDI export
│   ├── history/      # IndexedDB storage
│   ├── orchestrator/ # Generation pipeline
│   ├── prompt/       # AI prompt builder
│   ├── storage/      # LocalStorage + IndexedDB
│   └── theme/        # Theme management
└── types/            # Shared TypeScript types
```

## License

MIT
