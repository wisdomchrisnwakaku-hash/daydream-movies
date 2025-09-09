# Vox - Voice to Scene Generator Setup

## Quick Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `env.example` to `.env`
   - Replace `REPLACE_WITH_YOUR_API_KEY` with your actual Vox API key

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory with:

```
VITE_DAYDREAM_API_KEY=your_actual_api_key_here
VITE_PIPELINE_ID=pip_qpUgXycjWF6YMeSL
```

## Features

- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Environment-based config**: API keys stored securely in `.env` file
- **Simplified explanations**: One-sentence descriptions for all AI parameters
- **Responsive design**: Works on desktop and mobile devices

## Usage

1. Set your API key in the `.env` file
2. Click "Test API Key" to verify your setup
3. Click "Create Stream" to start
4. Use "Start Camera" to begin video capture
5. Adjust AI parameters as needed
6. Click "Start Streaming" to begin AI transformation
