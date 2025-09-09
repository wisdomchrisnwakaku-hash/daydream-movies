# Vox - Voice to Scene Generator

A fun and user-friendly web application that lets you stream video from your webcam through the Vox StreamDiffusion AI pipeline and view the transformed output in real-time.

## Features

- 🎬 Create AI-powered video streams using the Vox API
- 📹 Capture video from your webcam using WebRTC
- 🎥 View AI-transformed output using the Livepeer player
- 🎛️ Real-time parameter adjustment for StreamDiffusion
- 🎮 ControlNet settings for fine-tuning AI behavior
- 🎨 Beautiful, responsive UI with gradient backgrounds

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Get Your API Key

1. Visit the [Key Generator Tool](https://app.daydream.live/beta/api-key)
2. Use the passcode provided in Discord
3. Copy your API key

### 3. Start the Development Server

```bash
npm run dev
```

### 4. Important: Use Local Server to Avoid CORS Issues

Since the Livepeer player iframe requires proper CORS handling, you need to serve the app from a local server. 

**Option 1: Using Vite (Recommended)**
```bash
npm run dev
```
Then open the URL shown in the terminal (usually `http://localhost:5173`)

**Option 2: Using Python's built-in server**
```bash
# In the project directory
python3 -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

**Option 3: Using Node.js http-server**
```bash
npx http-server -p 8000
```

**Note**: If you see "lvpr.tv refused to connect" errors, the app will automatically show a direct link to open the player in a new tab as a workaround.

## How to Use

1. **Create Stream**: Enter your API key and click "Create Stream"
2. **Start Camera**: Click "Start Camera" to access your webcam
3. **Start Streaming**: Click "Start Streaming" to send video to the AI pipeline
4. **View Output**: Watch the transformed video in the output player
5. **Adjust Parameters**: Use the controls to modify AI behavior in real-time

## Parameter Controls

### Basic Parameters
- **Prompt**: Describe what you want the AI to create
- **Negative Prompt**: What to avoid in the output
- **Inference Steps**: Quality vs speed tradeoff (10-100)
- **Seed**: For reproducible results

### ControlNets
- **Pose Estimation**: Maintains human poses
- **Edge Detection (HED)**: Preserves smooth edges
- **Canny Edge**: Maintains sharp edges
- **Depth Estimation**: Preserves 3D structure
- **Color Preservation**: Maintains color palette

## Technical Details

- Built with ViteJS for fast development
- Uses WebRTC for real-time video streaming
- Integrates with Vox API for AI processing
- Embeds Livepeer player for output display
- Responsive design works on desktop and mobile

## Troubleshooting

- **CORS Errors**: Make sure you're serving from a local server (not file://)
- **Camera Access**: Ensure you grant camera permissions when prompted
- **API Errors**: Verify your API key is correct and has proper permissions
- **Stream Issues**: Check your internet connection and try refreshing

## API Reference

The app uses the Vox API endpoints:
- `POST /v1/streams` - Create a new stream
- `POST /beta/streams/{id}/prompts` - Update stream parameters

For full API documentation, visit: https://docs.daydream.live/api-reference/reference
