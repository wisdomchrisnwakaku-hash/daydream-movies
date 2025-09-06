import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { AssemblyAI } from 'assemblyai';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin:  ["http://localhost:3000", "http://localhost:5173"], // allow both
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist')); // Serve built frontend

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// AssemblyAI client
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || "ae9025de09ce45cbb323225c6c96a9b5"
});

// Store active transcription sessions
const activeSessions = new Map();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Speech-to-text server is running' });
});

// File upload transcription endpoint
app.post('/api/transcribe-file', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioUrl = `http://localhost:3001/${req.file.path}`;
    
    const transcript = await client.transcripts.transcribe({
      audio: audioUrl,
      language_detection: true,
      speaker_labels: true
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      text: transcript.text,
      confidence: transcript.confidence,
      words: transcript.words,
      speakers: transcript.utterances
    });

  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: 'Transcription failed', details: error.message });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('start-transcription', async (data) => {
    try {
      const sessionId = socket.id;
      
      // Create streaming transcriber using v3 API
      const transcriber = client.streaming.transcriber({
        sampleRate: 16000,
        formatTurns: true
      });

      transcriber.on("open", ({ id }) => {
        console.log(`Session opened with ID: ${id}`);
        socket.emit('transcription-ready', { message: 'Ready to receive audio', sessionId: id });
      });

      transcriber.on("error", (error) => {
        console.error("Transcription error:", error);
        socket.emit('transcription-error', { error: error.message || error.toString() });
      });

      transcriber.on("close", (code, reason) => {
        console.log("Session closed:", code, reason);
        socket.emit('transcription-stopped', { message: 'Transcription session closed', code, reason });
        activeSessions.delete(sessionId);
      });

      transcriber.on("turn", (turn) => {
        if (turn.transcript) {
          socket.emit('transcription-result', {
            text: turn.transcript,
            confidence: turn.confidence,
            timestamp: new Date().toISOString()
          });
        }
      });

      await transcriber.connect();
      activeSessions.set(sessionId, transcriber);

    } catch (error) {
      console.error('Error starting transcription:', error);
      socket.emit('transcription-error', { error: error.message });
    }
  });

  socket.on('audio-data', async (audioData) => {
    const sessionId = socket.id;
    const transcriber = activeSessions.get(sessionId);
    
    if (transcriber) {
      try {
        // Convert base64 audio data to buffer and send to transcriber
        const audioBuffer = Buffer.from(audioData, "base64");
        await transcriber.sendAudio(audioBuffer); // ✅ correct AssemblyAI call
      } catch (error) {
        console.error('Error processing audio data:', error);
        socket.emit('transcription-error', { error: 'Failed to process audio data' });
      }
    } else {
      console.warn('No active transcriber found for session:', sessionId);
    }
  });

  socket.on('stop-transcription', async () => {
    const sessionId = socket.id;
    const transcriber = activeSessions.get(sessionId);
    
    if (transcriber) {
      try {
        await transcriber.close();
        activeSessions.delete(sessionId);
        socket.emit('transcription-stopped', { message: 'Transcription stopped' });
      } catch (error) {
        console.error('Error stopping transcription:', error);
        socket.emit('transcription-error', { error: error.message });
      }
    }
  });

  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);
    const sessionId = socket.id;
    const transcriber = activeSessions.get(sessionId);
    
    if (transcriber) {
      try {
        await transcriber.close();
        activeSessions.delete(sessionId);
      } catch (error) {
        console.error('Error closing transcription on disconnect:', error);
      }
    }
  });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Speech-to-text server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for real-time transcription`);
  console.log(`🌐 Frontend will be served from http://localhost:${PORT}`);
});

