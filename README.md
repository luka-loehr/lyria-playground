# 🎵 Lyria Playground

A beautiful terminal-based playground for Google's Lyria RealTime music generation model. Create, steer, and perform instrumental music in real-time using natural language prompts.

![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- 🎹 **Real-time music generation** - Generate music instantly from text prompts
- 🎛️ **Live steering** - Change the music style in real-time by updating prompts
- 🎨 **Beautiful CLI interface** - Clean, minimal terminal UI built with React
- 🔊 **Direct audio playback** - Stream audio directly to your speakers
- ⚡ **Low latency** - Powered by WebSocket for real-time streaming

## 🚀 Quick Start

### Prerequisites

- Node.js v18 or higher
- A Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))
- macOS, Linux, or Windows with audio support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lyria-playground.git
   cd lyria-playground
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure your API key**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the playground**
   ```bash
   npm start
   ```

## 🎮 Usage

Once the app is running:

1. **Start generating music**: Type a prompt describing the music you want (e.g., "Minimal techno", "Jazz piano", "Ambient soundscape")
2. **Press Enter** to start generating
3. **Steer the music**: While music is playing, type a new prompt and press Enter to smoothly transition the music
4. **Quit**: Press `Ctrl+C` to exit

### Example Prompts

- **Genres**: "Minimal techno", "Jazz fusion", "Lo-fi hip hop", "Ambient drone"
- **Instruments**: "Piano ballad", "Acoustic guitar", "Synthesizer arpeggios"
- **Moods**: "Chill and relaxed", "Energetic and upbeat", "Dark and mysterious"
- **Combinations**: "Brazilian phonk with deep bass", "Chill waiting room jazz", "Fast hardcore techno"

## 🎯 How It Works

Lyria Playground uses Google's [Lyria RealTime](https://deepmind.google/technologies/lyria/realtime/) model, which generates music in real-time through a WebSocket connection. The app:

1. Connects to the Lyria RealTime API
2. Sends your text prompts to the model
3. Receives audio chunks as PCM16 audio at 48kHz
4. Streams the audio directly to your speakers

## 🛠️ Technical Details

- **Framework**: React with [Ink](https://github.com/vadimdemedes/ink) for terminal UI
- **Audio**: [speaker](https://github.com/TooTallNate/node-speaker) for direct audio playback
- **API**: Google Gemini API v1alpha with Lyria RealTime model
- **Build**: Babel for ES6+ transpilation

## 📋 Requirements

- **Node.js**: v18+
- **API Access**: Google Gemini API key with access to experimental models
- **Audio**: Audio output device (speakers or headphones)

## 🐛 Troubleshooting

### No audio playing
- Ensure your audio device is working
- Check that your API key is valid and has access to Lyria RealTime
- Try restarting the application

### Session closes immediately
- Verify your API key is correct in `.env`
- Check your internet connection
- Ensure you have access to experimental Gemini API features

### Audio buffer warnings
- These warnings are normal and don't affect playback
- They're automatically suppressed in the UI

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google DeepMind](https://deepmind.google/) for the Lyria RealTime model
- [Ink](https://github.com/vadimdemedes/ink) for the beautiful terminal UI framework

## 🔗 Links

- [Lyria RealTime Documentation](https://ai.google.dev/gemini-api/docs/music-generation)
- [Get Gemini API Key](https://aistudio.google.com/app/apikey)
- [Try Lyria on AI Studio](https://aistudio.google.com/apps/bundled/promptdj)

---

Made with ❤️ for music lovers and developers
