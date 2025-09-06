import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { StreamData } from '@/types'
import { io, Socket } from 'socket.io-client'

interface TranscriptionResult {
  text: string;
  confidence: number;
  speaker?: string;
  timestamp: string;
}

interface AlertState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  id: number;
}

interface AIParametersProps {
  streamData: StreamData | null
  prompt: string
  setPrompt: (value: string) => void
  negativePrompt: string
  setNegativePrompt: (value: string) => void
  inferenceSteps: number
  setInferenceSteps: (value: number) => void
  seed: number
  setSeed: (value: number) => void
  poseEnabled: boolean
  setPoseEnabled: (value: boolean) => void
  poseScale: number
  setPoseScale: (value: number) => void
  hedEnabled: boolean
  setHedEnabled: (value: boolean) => void
  hedScale: number
  setHedScale: (value: number) => void
  cannyEnabled: boolean
  setCannyEnabled: (value: boolean) => void
  cannyScale: number
  setCannyScale: (value: number) => void
  depthEnabled: boolean
  setDepthEnabled: (value: boolean) => void
  depthScale: number
  setDepthScale: (value: number) => void
  colorEnabled: boolean
  setColorEnabled: (value: boolean) => void
  colorScale: number
  setColorScale: (value: number) => void
  onUpdateParameters: () => void
  onGenerateRandomSeed: () => void
  onStart: () => void
  onStop: () => void
  onStartWebRTC: () => void
  isStreaming: boolean
}

const AIParameters: React.FC<AIParametersProps> = ({
  streamData,
  prompt,
  setPrompt,
  negativePrompt,
  setNegativePrompt,
  inferenceSteps,
  setInferenceSteps,
  seed,
  setSeed,
  poseEnabled,
  setPoseEnabled,
  poseScale,
  setPoseScale,
  hedEnabled,
  setHedEnabled,
  hedScale,
  setHedScale,
  cannyEnabled,
  setCannyEnabled,
  cannyScale,
  setCannyScale,
  depthEnabled,
  setDepthEnabled,
  depthScale,
  setDepthScale,
  colorEnabled,
  setColorEnabled,
  colorScale,
  setColorScale,
  onUpdateParameters,
  onGenerateRandomSeed,
  onStart,
  onStop,
  onStartWebRTC,
  isStreaming
}) => {
  // Speech-to-text states
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [alerts, setAlerts] = useState<AlertState[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Debug logging function
  const addDebugLog = (message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage, data || '');
  };

  // Alert system
  const showAlert = (message: string, type: AlertState['type'] = 'info', duration = 3000) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { message, type, id }]);
    
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, duration);
  };

  // Remove alert manually
  const removeAlert = (id: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Initialize socket connection
  useEffect(() => {
    addDebugLog('Initializing socket connection to http://localhost:3001');
    
    // First check if server is running
    const checkServerHealth = async () => {
      try {
        addDebugLog('Checking server health...');
        const response = await fetch('http://localhost:3001/api/health');
        if (response.ok) {
          const data = await response.json();
          addDebugLog('Server health check passed', data);
        } else {
          addDebugLog('Server health check failed', { status: response.status, statusText: response.statusText });
        }
      } catch (error) {
        addDebugLog('Server health check error - server may not be running', error);
      }
    };
    
    checkServerHealth();
    
    const newSocket = io('http://localhost:3001');
    
    newSocket.on('connect', () => {
      addDebugLog('Socket connected successfully', { socketId: newSocket.id });
      setIsConnected(true);
      showAlert('Connected to speech-to-text server', 'success');
    });

    newSocket.on('disconnect', (reason) => {
      addDebugLog('Socket disconnected', { reason });
      setIsConnected(false);
      showAlert('Disconnected from speech-to-text server', 'warning');
    });

    newSocket.on('connect_error', (error) => {
      addDebugLog('Socket connection error', error);
      showAlert(`Connection error: ${error.message}`, 'error');
    });

    newSocket.on('transcription-ready', (data) => {
      addDebugLog('Transcription ready event received', data);
      showAlert(data.message, 'success');
    });

    newSocket.on('transcription-result', (result: TranscriptionResult) => {
      addDebugLog('Transcription result received', result);
      if (result.text && result.text.trim()) {
        const newTranscription = transcription + (transcription ? ' ' : '') + result.text;
        setTranscription(newTranscription);
        // Update the prompt with the new transcription
        setPrompt(prompt + (prompt ? ' ' : '') + result.text);
        addDebugLog('Transcription updated', { newText: result.text, totalLength: newTranscription.length });
      } else {
        addDebugLog('Empty transcription result received', result);
      }
    });

    newSocket.on('transcription-error', (error) => {
      addDebugLog('Transcription error received', error);
      showAlert(`Transcription error: ${error.error}`, 'error');
      setIsRecording(false);
    });

    newSocket.on('transcription-stopped', (data) => {
      addDebugLog('Transcription stopped event received', data);
      showAlert(data.message, 'info');
      setIsRecording(false);
    });

    newSocket.on('transcription-closed', () => {
      addDebugLog('Transcription closed event received');
      showAlert('Transcription session closed', 'warning');
      setIsRecording(false);
    });

    setSocket(newSocket);
    addDebugLog('Socket instance created and event listeners attached');

    return () => {
      addDebugLog('Cleaning up socket connection');
      newSocket.close();
    };
  }, []);

  // Automatically update parameters whenever prompt changes
  useEffect(() => {
    if (prompt.trim() && streamData) {
      onUpdateParameters();
    }
  }, [prompt, streamData, onUpdateParameters]);

  // Start recording
  const startRecording = async () => {
    addDebugLog('Starting recording process...');
    
    try {
      addDebugLog('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      addDebugLog('Microphone access granted', { 
        trackCount: stream.getTracks().length,
        audioTracks: stream.getAudioTracks().map(track => ({
          label: track.label,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState
        }))
      });

      setAudioStream(stream);

      // Create audio context at 16kHz
      addDebugLog('Creating audio context...');
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      });

      addDebugLog('Audio context created', { 
        sampleRate: audioCtx.sampleRate,
        state: audioCtx.state 
      });

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);

      addDebugLog('Audio processor created', { 
        bufferSize: processor.bufferSize,
        numberOfInputs: processor.numberOfInputs,
        numberOfOutputs: processor.numberOfOutputs
      });

      source.connect(processor);
      processor.connect(audioCtx.destination);

      let audioDataCount = 0;
      processor.onaudioprocess = (event) => {
        audioDataCount++;
        if (audioDataCount % 10 === 0) { // Log every 10th audio chunk to avoid spam
          addDebugLog(`Processing audio chunk #${audioDataCount}`, {
            inputLength: event.inputBuffer.length,
            sampleRate: event.inputBuffer.sampleRate
          });
        }

        const input = event.inputBuffer.getChannelData(0); // Float32 [-1, 1]
        const pcm16 = new Int16Array(input.length);

        for (let i = 0; i < input.length; i++) {
          const s = Math.max(-1, Math.min(1, input[i])); // clamp
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        if (socket) {
          // Convert Int16Array to base64 using browser-compatible method
          const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
          socket.emit("audio-data", base64Data);
          
          if (audioDataCount % 50 === 0) { // Log every 50th emission
            addDebugLog(`Sent audio data #${audioDataCount}`, { 
              dataSize: base64Data.length,
              socketConnected: socket.connected 
            });
          }
        } else {
          addDebugLog('Socket not available for audio data emission', { audioDataCount });
        }
      };

      setIsRecording(true);
      addDebugLog('Recording state set to true');

      // Start transcription session
      if (socket) {
        addDebugLog('Emitting start-transcription event');
        socket.emit("start-transcription");
      } else {
        addDebugLog('ERROR: Socket not available for start-transcription');
      }

      showAlert("Recording started", "success");
      addDebugLog('Recording started successfully');
    } catch (error) {
      addDebugLog('Error starting recording', error);
      console.error("Error starting recording:", error);
      showAlert("Failed to start recording. Please check microphone permissions.", "error");
    }
  };

  // Stop recording
  const stopRecording = () => {
    addDebugLog('Stopping recording...');
    
    if (audioStream) {
      addDebugLog('Stopping audio tracks', { 
        trackCount: audioStream.getTracks().length 
      });
      audioStream.getTracks().forEach(track => {
        addDebugLog('Stopping track', { 
          label: track.label,
          readyState: track.readyState 
        });
        track.stop();
      });
      setAudioStream(null);
      addDebugLog('Audio stream cleared');
    } else {
      addDebugLog('No audio stream to stop');
    }

    if (socket) {
      addDebugLog('Emitting stop-transcription event');
      socket.emit("stop-transcription");
    } else {
      addDebugLog('ERROR: Socket not available for stop-transcription');
    }

    setIsRecording(false);
    addDebugLog('Recording state set to false');
    showAlert("Recording stopped", "info");
  };

  // Unified Start handler
  const handleUnifiedStart = async () => {
    setIsLoading(true);
    try {
      // Start recording first
      await startRecording();
      // Then start streaming
      await onStart();
      showAlert("Recording and streaming started", "success");
    } catch (error) {
      showAlert("Failed to start recording/streaming", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Unified Stop handler
  const handleUnifiedStop = async () => {
    setIsLoading(true);
    try {
      // Stop recording first
      stopRecording();
      // Then stop streaming
      await onStop();
      showAlert("Recording and streaming stopped", "info");
    } catch (error) {
      showAlert("Failed to stop recording/streaming", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!streamData) return null

  return (
    <div className="space-y-4">
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎛️ AI Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
        {/* Control Buttons Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">🎮 Stream Controls</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button 
              onClick={handleUnifiedStart}
              disabled={!isConnected || isRecording || isStreaming || isLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Starting...
                </>
              ) : (
                <>
                  {isRecording && isStreaming ? '🔴 Recording & Streaming' : '🎤 Start Recording & Stream'}
                </>
              )}
            </Button>
            <Button 
              onClick={onStartWebRTC}
              disabled={isStreaming || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              📡 Start WebRTC Stream
            </Button>
            <Button 
              onClick={handleUnifiedStop}
              disabled={!isRecording && !isStreaming || isLoading}
              variant="destructive"
              className="px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Stopping...
                </>
              ) : (
                '⏹️ Stop'
              )}
            </Button>
            {!isConnected && (
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-orange-200 text-orange-700 hover:bg-orange-50 px-6 py-2 rounded-lg font-medium transition-all duration-200"
              >
                🔄 Retry Connection
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-4">
          {/* Left Side - Text and Number Inputs */}
          <div className="space-y-6">
            
            {/* Prompt Section */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label htmlFor="prompt" className="flex items-center gap-2 text-base font-semibold text-blue-800 mb-3">
                🎨 AI Prompt
                <span className="relative group cursor-help">
                  <span className="text-blue-500 text-sm">ℹ️</span>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    Text that guides what the AI should transform your video into
                  </div>
                </span>
              </Label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the transformation you want... (e.g., 'Transform me into a cyberpunk character', 'Make me look like a cartoon character')"
                className="flex min-h-[100px] w-full rounded-lg border border-blue-300 bg-white px-4 py-3 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                rows={4}
              />
            </div>
            
            <div className="space-y-2 hidden">
              <Label htmlFor="negativePrompt" className="flex items-center gap-2">
                🚫 Negative Prompt:
                <span className="relative group cursor-help">
                  <span className="text-blue-500">ℹ️</span>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    Text describing what you DON'T want in the output
                  </div>
                </span>
              </Label>
              <textarea
                id="negativePrompt"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="What to avoid..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={3}
              />
            </div>
            
            {/* Seed Section */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Label htmlFor="seed" className="flex items-center gap-2 text-base font-semibold text-purple-800 mb-3">
                🎲 Random Seed
                <span className="relative group cursor-help">
                  <span className="text-purple-500 text-sm">ℹ️</span>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    Controls randomness - fixed numbers give reproducible results
                  </div>
                </span>
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="seed"
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(parseInt(e.target.value))}
                  min="0"
                  max="999999"
                  className="w-24 text-center font-mono text-lg border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                />
                <Button 
                  onClick={onGenerateRandomSeed} 
                  variant="outline" 
                  className="border-purple-300 text-purple-700 hover:bg-purple-100 hover:border-purple-400 transition-all duration-200"
                >
                  🎲 Generate Random
                </Button>
              </div>
            </div>
          </div>
          
          {/* Right Side - Slider Inputs */}
          <div className="space-y-6">
            {/* Inference Steps Section */}
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <Label htmlFor="inferenceSteps" className="flex items-center gap-2 text-base font-semibold text-orange-800 mb-3">
                ⚡ Inference Steps
                <span className="relative group cursor-help">
                  <span className="text-orange-500 text-sm">ℹ️</span>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    Higher = better quality but slower, lower = faster but lower quality
                  </div>
                </span>
              </Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="inferenceSteps"
                  min={10}
                  max={100}
                  value={[inferenceSteps]}
                  onValueChange={(value) => setInferenceSteps(value[0])}
                  className="flex-1"
                />
                <span className="text-lg font-bold text-orange-700 min-w-[3rem] text-center bg-white px-3 py-1 rounded-lg border border-orange-300">{inferenceSteps}</span>
              </div>
            </div>
            
            {/* ControlNet Section */}
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">🎛️ ControlNet Settings</h3>
              <div className="grid grid-cols-1 gap-4">
                
                {/* Pose ControlNet */}
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Checkbox
                      id="poseEnabled"
                      checked={poseEnabled}
                      onCheckedChange={(checked) => setPoseEnabled(checked as boolean)}
                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <Label htmlFor="poseEnabled" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      🤸 Pose Control
                      <span className="relative group cursor-help">
                        <span className="text-blue-500">ℹ️</span>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                          Preserves body poses and movements
                        </div>
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Slider
                      id="poseScale"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[poseScale]}
                      onValueChange={(value) => setPoseScale(value[0])}
                      className="flex-1"
                      disabled={!poseEnabled}
                    />
                    <span className="text-sm font-bold text-gray-700 min-w-[3rem] text-center bg-gray-100 px-2 py-1 rounded border">{poseScale.toFixed(2)}</span>
                  </div>
                </div>

                {/* HED ControlNet */}
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Checkbox
                      id="hedEnabled"
                      checked={hedEnabled}
                      onCheckedChange={(checked) => setHedEnabled(checked as boolean)}
                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <Label htmlFor="hedEnabled" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      🎨 HED Edges
                      <span className="relative group cursor-help">
                        <span className="text-blue-500">ℹ️</span>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                          Preserves soft edges and contours
                        </div>
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Slider
                      id="hedScale"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[hedScale]}
                      onValueChange={(value) => setHedScale(value[0])}
                      className="flex-1"
                      disabled={!hedEnabled}
                    />
                    <span className="text-sm font-bold text-gray-700 min-w-[3rem] text-center bg-gray-100 px-2 py-1 rounded border">{hedScale.toFixed(2)}</span>
                  </div>
                </div>

                {/* Canny ControlNet */}
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Checkbox
                      id="cannyEnabled"
                      checked={cannyEnabled}
                      onCheckedChange={(checked) => setCannyEnabled(checked as boolean)}
                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <Label htmlFor="cannyEnabled" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      ✂️ Canny Edges
                      <span className="relative group cursor-help">
                        <span className="text-blue-500">ℹ️</span>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                          Preserves sharp edges and outlines
                        </div>
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Slider
                      id="cannyScale"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[cannyScale]}
                      onValueChange={(value) => setCannyScale(value[0])}
                      className="flex-1"
                      disabled={!cannyEnabled}
                    />
                    <span className="text-sm font-bold text-gray-700 min-w-[3rem] text-center bg-gray-100 px-2 py-1 rounded border">{cannyScale.toFixed(2)}</span>
                  </div>
                </div>

                {/* Depth ControlNet */}
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Checkbox
                      id="depthEnabled"
                      checked={depthEnabled}
                      onCheckedChange={(checked) => setDepthEnabled(checked as boolean)}
                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <Label htmlFor="depthEnabled" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      🏔️ Depth Control
                      <span className="relative group cursor-help">
                        <span className="text-blue-500">ℹ️</span>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                          Preserves 3D depth and spatial relationships
                        </div>
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Slider
                      id="depthScale"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[depthScale]}
                      onValueChange={(value) => setDepthScale(value[0])}
                      className="flex-1"
                      disabled={!depthEnabled}
                    />
                    <span className="text-sm font-bold text-gray-700 min-w-[3rem] text-center bg-gray-100 px-2 py-1 rounded border">{depthScale.toFixed(2)}</span>
                  </div>
                </div>

                {/* Color ControlNet */}
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Checkbox
                      id="colorEnabled"
                      checked={colorEnabled}
                      onCheckedChange={(checked) => setColorEnabled(checked as boolean)}
                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <Label htmlFor="colorEnabled" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      🎨 Color Control
                      <span className="relative group cursor-help">
                        <span className="text-blue-500">ℹ️</span>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                          Preserves original colors and lighting
                        </div>
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Slider
                      id="colorScale"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[colorScale]}
                      onValueChange={(value) => setColorScale(value[0])}
                      className="flex-1"
                      disabled={!colorEnabled}
                    />
                    <span className="text-sm font-bold text-gray-700 min-w-[3rem] text-center bg-gray-100 px-2 py-1 rounded border">{colorScale.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </CardContent>
      </Card>

      {/* Alert Container */}
      <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
        {alerts.map((alert) => (
          <Alert key={alert.id} className={`animate-in slide-in-from-right-full duration-300 ${
            alert.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' :
            alert.type === 'error' ? 'border-red-200 bg-red-50 text-red-800' :
            alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50 text-yellow-800' :
            'border-blue-200 bg-blue-50 text-blue-800'
          }`}>
            <div className="flex items-center justify-between">
              <AlertDescription className="flex-1 pr-2">{alert.message}</AlertDescription>
              <button
                onClick={() => removeAlert(alert.id)}
                className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close alert"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </Alert>
        ))}
      </div>
    </div>
  )
}

export default AIParameters
