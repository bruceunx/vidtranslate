# VidTranslate

## AI-Powered Desktop App for Text Extraction and Translation

    A desktop application for macOS and Windows that utilizes local AI models like whisper.cpp for speech-to-text extraction and llama.cpp for text translation. The app can process both audio and video files, converting speech to text and translating the extracted text into multiple languages without requiring cloud services.

## Key Features

- Audio/Video to Text: Extracts text from audio and video files using whisper.cpp, a local implementation of OpenAI's Whisper for speech-to-text.
- Text Translation: Translates the extracted text into various languages using llama.cpp and a local translation model.
- Completely Offline: All processing is done locally, so there's no need for an internet connection.
- Cross-Platform: Runs on both macOS and Windows.

![](./docs/image2.png)
![](./docs/image3.png)
![](./docs/image1.png)

## Whisper Models for stt

- `https://ggml.ggerganov.com/ggml-model-whisper-large-q5_0.bin`
- `https://ggml.ggerganov.com/ggml-model-whisper-medium-q5_0.bin`

## Llama models for translating

- `https://huggingface.co/notjjustnumbers/madlad400-3b-mt-Q4_K_M-GGUF/resolve/main/madlad400-3b-mt-q4_k_m.gguf?download=true`

## TODO

- [x] transript screen auto scroll
- [x] file list
- [x] mp3 format
- [x] save transripts to tmp files with time tag
- [x] save file to srt or vvt
- [x] translate with gpt2 or llama
- [x] setting modal
- [x] adjust llama.cpp to handle file as input
- [x] move translate to app.tsx
- [x] refactoring app.tsx
- [x] add stop button to transcripts and translates
- [x] add license
- [ ] finish setting download models etc
