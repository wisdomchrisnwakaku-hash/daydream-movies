import React, { useState, useRef, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import ReusableHeader from '@/components/ReusableHeader'
import ReusableFooter from '@/components/ReusableFooter'
import AIParameters from '@/components/AIParameters'
import StreamControls from '@/components/StreamControls'
import AlertSystem from '@/components/AlertSystem'
import AudioFeaturesDisplay from '@/components/AudioFeaturesDisplay'
import { useStreamAPI } from '@/hooks/useStreamAPI'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Camera
} from 'lucide-react'

const Studio: React.FC = () => {
  const { theme } = useTheme()
  
  // Use the stream API hook
  const {
    streamData,
    localStream,
    isStreaming,
    alerts,
    localVideoRef,
    outputPlayerRef,
    createStream,
    startCamera,
    startWebRTCStream,
    stopStream,
    updateParameters,
    removeAlert
  } = useStreamAPI()
  
  // AI Parameters
  const [prompt, setPrompt] = useState("")
  const [inferenceSteps, setInferenceSteps] = useState(50)
  const [seed, setSeed] = useState(42)
  
  // ControlNet parameters
  const [poseEnabled, setPoseEnabled] = useState(true)
  const [poseScale, setPoseScale] = useState(0)
  const [hedEnabled, setHedEnabled] = useState(true)
  const [hedScale, setHedScale] = useState(0)
  const [cannyEnabled, setCannyEnabled] = useState(true)
  const [cannyScale, setCannyScale] = useState(0)
  const [depthEnabled, setDepthEnabled] = useState(true)
  const [depthScale, setDepthScale] = useState(0)
  const [colorEnabled, setColorEnabled] = useState(true)
  const [colorScale, setColorScale] = useState(0)

  // Stream control states
  const [isLoading, setIsLoading] = useState(false)
  
  // Speech-to-text states
  const [isListening, setIsListening] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  
  // Video recording states
  const [isRecording, setIsRecording] = useState(false)
  const [recordingStatus, setRecordingStatus] = useState('Ready to record')
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null)
  const [showRecordingGuide, setShowRecordingGuide] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingStartTimeRef = useRef<number | null>(null)
  const recordingDurationRef = useRef<number>(0)
  
  // Audio features state
  const [audioFeatures, setAudioFeatures] = useState({
    volume: 0,
    pitch: 0,
    emotion: 'neutral',
    confidence: 0,
    visualStyle: '',
    wpm: 0,
    transcript: ''
  })

  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 999999)
    setSeed(randomSeed)
  }

  // Debug logging function
  const addDebugLog = (message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    console.log(logMessage, data || '')
  }

  // Initialize WebSocket connection for speech-to-text
  useEffect(() => {
    addDebugLog('Initializing socket connection to http://localhost:3001')
    
    // First check if server is running
    const checkServerHealth = async () => {
      try {
        addDebugLog('Checking server health...')
        const response = await fetch('http://localhost:3001/api/health')
        if (response.ok) {
          const data = await response.json()
          addDebugLog('Server health check passed', data)
        } else {
          addDebugLog('Server health check failed', { status: response.status, statusText: response.statusText })
        }
      } catch (error) {
        addDebugLog('Server health check error - server may not be running', error)
      }
    }
    
    checkServerHealth()
    
    const socketInstance = io('http://localhost:3001')
    
    socketInstance.on('connect', () => {
      addDebugLog('Socket connected successfully', { socketId: socketInstance.id })
      setIsConnected(true)
    })

    socketInstance.on('disconnect', (reason) => {
      addDebugLog('Socket disconnected', { reason })
      setIsConnected(false)
    })

    socketInstance.on('connect_error', (error) => {
      addDebugLog('Socket connection error', error)
    })
    
    socketInstance.on('transcription-ready', (data) => {
      addDebugLog('Transcription ready event received', data)
    })
    
    socketInstance.on('transcription-result', (data) => {
      addDebugLog('Transcription result received', data)
      
      // Only update prompt on final transcripts (pause detected)
      if (data.message_type === 'final_transcript' && data.text && data.text.trim()) {
        setPrompt(data.text)
        addDebugLog('Final transcription updated', { newText: data.text })
        if (data.wpm) {
          addDebugLog('🗣️ Speech Rate:', data.wpm.toFixed(1) + ' WPM')
          console.log('🗣️ Speech Rate:', data.wpm.toFixed(1) + ' WPM')
          
          // Update WPM in audio features state
          setAudioFeatures(prev => ({
            ...prev,
            wpm: data.wpm,
            transcript: data.text
          }))
        }
      } else if (data.message_type === 'partial_transcript') {
        // Just log partial transcripts for debugging, don't update prompt
        addDebugLog('Partial transcription received', { partialText: data.text })
      } else {
        addDebugLog('Empty or unknown transcription result received', data)
      }
    })
    
    socketInstance.on('transcription-error', (error) => {
      addDebugLog('Transcription error received', error)
      // Don't stop listening on audio processing errors, just log them
      if (error.error && error.error.includes('Failed to process audio data')) {
        addDebugLog('Audio processing error - continuing...')
        return
      }
      setIsListening(false)
    })
    
    socketInstance.on('transcription-stopped', (data) => {
      addDebugLog('Transcription stopped event received', data)
      setIsListening(false)
    })

    socketInstance.on('transcription-closed', () => {
      addDebugLog('Transcription closed event received')
      setIsListening(false)
    })
    
    // Audio volume events
    socketInstance.on('audio-volume', (data) => {
      addDebugLog('🔊 Audio Volume:', data.volume.toFixed(2))
      console.log('🔊 Audio Volume:', data.volume.toFixed(2))
      if (data.pitch) {
        addDebugLog('🎵 Audio Pitch:', data.pitch.toFixed(1) + ' Hz')
        console.log('🎵 Audio Pitch:', data.pitch.toFixed(1) + ' Hz')
      }
      
      // Update audio features state with real-time emotion data
      setAudioFeatures(prev => ({
        ...prev,
        volume: data.volume,
        pitch: data.pitch || prev.pitch,
        // Update emotion data if available (real-time detection)
        ...(data.emotion && {
          emotion: data.emotion,
          confidence: data.confidence || prev.confidence,
          visualStyle: data.visualStyle || prev.visualStyle
        })
      }))
    })
    
    // Audio tone/emotion events (DIY emotion detection)
    socketInstance.on('audio-tone', (data) => {
      addDebugLog('😊 Emotion:', data.emotion + ' (' + data.confidence.toFixed(2) + ')')
      console.log('😊 Emotion:', data.emotion + ' (' + data.confidence.toFixed(2) + ')')
      console.log('🎨 Visual Style:', data.visualStyle)
      console.log('📊 Features:', {
        volume: data.features.volume.toFixed(2),
        pitch: data.features.pitch.toFixed(1) + ' Hz',
        wpm: data.features.wpm.toFixed(1)
      })
      if (data.transcript) {
        console.log('🎯 For transcript:', data.transcript)
      }
      
      // Update audio features state with transcript-specific data
      setAudioFeatures(prev => ({
        ...prev,
        emotion: data.emotion,
        confidence: data.confidence,
        visualStyle: data.visualStyle,
        volume: data.features.volume,
        pitch: data.features.pitch,
        wpm: data.features.wpm,
        transcript: data.transcript || prev.transcript
      }))
    })
    
    // Audio sentiment from AssemblyAI API (fallback)
    socketInstance.on('audio-sentiment-api', (data) => {
      addDebugLog('😊 Sentiment (API):', data.sentiment)
      console.log('😊 Sentiment (API):', data.sentiment)
    })
    
    // Audio stats from AssemblyAI
    socketInstance.on('audio-stats', (data) => {
      addDebugLog('📊 Audio Stats Volume:', data.volume)
      console.log('📊 Audio Stats Volume:', data.volume)
    })
    
    setSocket(socketInstance)
    addDebugLog('Socket instance created and event listeners attached')
    
    return () => {
      addDebugLog('Cleaning up socket connection')
      socketInstance.close()
    }
  }, [])

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (isRecording && mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
      }
      if (recordedVideoUrl) {
        URL.revokeObjectURL(recordedVideoUrl)
      }
    }
  }, [isRecording, recordedVideoUrl])

  const startSpeechRecognition = async () => {
    if (!socket || isListening) return
    
    addDebugLog('Starting speech recognition process...')
    
    try {
      addDebugLog('Requesting microphone access...')
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })

      addDebugLog('Microphone access granted', { 
        trackCount: stream.getTracks().length,
        audioTracks: stream.getAudioTracks().map(track => ({
          label: track.label,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState
        }))
      })
      
      setAudioStream(stream)
      
      // Create audio context at 16kHz
      addDebugLog('Creating audio context...')
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      })

      addDebugLog('Audio context created', { 
        sampleRate: audioCtx.sampleRate,
        state: audioCtx.state 
      })

      const source = audioCtx.createMediaStreamSource(stream)
      const processor = audioCtx.createScriptProcessor(4096, 1, 1)

      addDebugLog('Audio processor created', { 
        bufferSize: processor.bufferSize,
        numberOfInputs: processor.numberOfInputs,
        numberOfOutputs: processor.numberOfOutputs
      })

      source.connect(processor)
      processor.connect(audioCtx.destination)

      let audioDataCount = 0
      processor.onaudioprocess = (event) => {
        audioDataCount++
        if (audioDataCount % 10 === 0) { // Log every 10th audio chunk to avoid spam
          addDebugLog(`Processing audio chunk #${audioDataCount}`, {
            inputLength: event.inputBuffer.length,
            sampleRate: event.inputBuffer.sampleRate
          })
        }

        const input = event.inputBuffer.getChannelData(0) // Float32 [-1, 1]
        const pcm16 = new Int16Array(input.length)

        for (let i = 0; i < input.length; i++) {
          const s = Math.max(-1, Math.min(1, input[i])) // clamp
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
        }

        if (socket) {
          // Convert Int16Array to base64 using browser-compatible method
          const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)))
          socket.emit("audio-data", base64Data)
          
          if (audioDataCount % 50 === 0) { // Log every 50th emission
            addDebugLog(`Sent audio data #${audioDataCount}`, { 
              dataSize: base64Data.length,
              socketConnected: socket.connected 
            })
          }
        } else {
          addDebugLog('Socket not available for audio data emission', { audioDataCount })
        }
      }

      // Store references for cleanup
      audioContextRef.current = audioCtx
      processorRef.current = processor
      
      setIsListening(true)
      addDebugLog('Listening state set to true')

      // Start transcription session
      if (socket) {
        addDebugLog('Emitting start-transcription event')
        socket.emit("start-transcription")
      } else {
        addDebugLog('ERROR: Socket not available for start-transcription')
      }

      addDebugLog('Speech recognition started successfully')
    } catch (error) {
      addDebugLog('Error starting speech recognition', error)
      console.error("Error starting speech recognition:", error)
    }
  }

  const stopSpeechRecognition = () => {
    addDebugLog('Stopping speech recognition...')
    
    // Clean up audio context and processor
    if (processorRef.current) {
      addDebugLog('Disconnecting audio processor')
      processorRef.current.disconnect()
      processorRef.current = null
    }
    
    if (audioContextRef.current) {
      addDebugLog('Closing audio context')
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    
    if (audioStream) {
      addDebugLog('Stopping audio tracks', { 
        trackCount: audioStream.getTracks().length 
      })
      audioStream.getTracks().forEach(track => {
        addDebugLog('Stopping track', { 
          label: track.label,
          readyState: track.readyState 
        })
        track.stop()
      })
      setAudioStream(null)
      addDebugLog('Audio stream cleared')
    } else {
      addDebugLog('No audio stream to stop')
    }
    
    if (socket) {
      addDebugLog('Emitting stop-transcription event')
      socket.emit("stop-transcription")
    } else {
      addDebugLog('ERROR: Socket not available for stop-transcription')
    }
    
    setIsListening(false)
    addDebugLog('Listening state set to false')
  }

  // Video recording functions
  const startIframeRecording = async () => {
    if (!streamData?.output_playback_id || isRecording) {
      console.log('Cannot start recording: no stream or already recording')
      return
    }

    try {
      addDebugLog('Starting iframe recording...')
      
      // Get the iframe element and its position
      const iframe = outputPlayerRef.current
      if (!iframe) {
        throw new Error('Output player iframe not found')
      }

      const rect = iframe.getBoundingClientRect()
      
      // Show recording guide and highlight iframe
      setShowRecordingGuide(true)
      setRecordingStatus('Please select the AI video area to record...')
      highlightIframeArea()
      
      // Request screen capture - user will select the area
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: rect.width },
          height: { ideal: rect.height },
          frameRate: { ideal: 30 }
        },
        audio: false
      })

      // Hide guide once recording starts
      setShowRecordingGuide(false)
      
      addDebugLog('Screen capture stream obtained', { 
        width: rect.width, 
        height: rect.height,
        trackCount: stream.getTracks().length 
      })
      
      // Create MediaRecorder with the screen capture stream
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      })

      const chunks: Blob[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
          addDebugLog('Recording chunk received', { size: event.data.size })
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setRecordedVideoUrl(url)
        setRecordingStatus(`Recording completed: ${(blob.size / 1024 / 1024).toFixed(2)} MB`)
        addDebugLog('Recording completed', { size: blob.size, url })
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        setRecordingStatus('Recording error occurred')
        stream.getTracks().forEach(track => track.stop())
        setShowRecordingGuide(false)
      }

      // Start recording
      mediaRecorder.start(1000) // Collect data every second
      mediaRecorderRef.current = mediaRecorder
      recordingStartTimeRef.current = Date.now()
      
      setIsRecording(true)
      setRecordingStatus('Recording AI video area...')
      setRecordedVideoUrl(null)
      
      addDebugLog('Iframe recording started successfully')
      
    } catch (error) {
      console.error('Error starting iframe recording:', error)
      setShowRecordingGuide(false)
      
      if (error instanceof Error && error.name === 'NotAllowedError') {
        setRecordingStatus('Screen capture permission denied. Please allow screen sharing to record.')
      } else {
        setRecordingStatus(`Failed to start recording: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }


  const stopVideoRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) {
      console.log('No active recording to stop')
      return
    }

    try {
      addDebugLog('Stopping video recording...')
      
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
      
      if (recordingStartTimeRef.current) {
        recordingDurationRef.current = Date.now() - recordingStartTimeRef.current
        recordingStartTimeRef.current = null
      }
      
      setIsRecording(false)
      setRecordingStatus('Processing recording...')
      
      addDebugLog('Video recording stopped successfully')
      
    } catch (error) {
      console.error('Error stopping video recording:', error)
      setRecordingStatus(`Failed to stop recording: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }


  const downloadRecordedVideo = () => {
    if (!recordedVideoUrl) {
      console.log('No recorded video to download')
      return
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `daydream-recording-${timestamp}.webm`
      
      const a = document.createElement('a')
      a.href = recordedVideoUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      addDebugLog('Video download initiated', { filename })
      
    } catch (error) {
      console.error('Error downloading video:', error)
    }
  }

  const clearRecordedVideo = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl)
    }
    setRecordedVideoUrl(null)
    setRecordingStatus('Ready to record')
    addDebugLog('Recorded video cleared')
  }

  // Function to highlight the iframe area
  const highlightIframeArea = () => {
    const iframe = outputPlayerRef.current
    if (!iframe) return

    // Add a temporary highlight effect
    iframe.style.border = '3px solid #ef4444'
    iframe.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.5)'
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      iframe.style.border = ''
      iframe.style.boxShadow = ''
    }, 3000)
  }


  const handleStartWebRTC = async () => {
    await startWebRTCStream()
  }

  // Unified Start handler
  const handleUnifiedStart = async () => {
    setIsLoading(true)
    try {
      await startCamera()
      await startWebRTCStream()
      await startSpeechRecognition() // Start speech-to-text
      setIsConnected(true)
    } catch (error) {
      console.error('Failed to start recording/streaming:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Unified Stop handler
  const handleUnifiedStop = async () => {
    setIsLoading(true)
    try {
      await stopStream()
      stopSpeechRecognition() // Stop speech-to-text
      if (isRecording) {
        stopVideoRecording() // Stop video recording if active
      }
    } catch (error) {
      console.error('Failed to stop recording/streaming:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-update parameters when prompt changes
  useEffect(() => {
    if (prompt.trim()) {
      const timeoutId = setTimeout(() => {
        handleUpdateParameters()
      }, 1000) // Debounce for 1 second
      
      return () => clearTimeout(timeoutId)
    }
  }, [prompt]) // only re-run when prompt changes

  const handleUpdateParameters = async () => {
    const params = {
      model_id: "streamdiffusion",
      pipeline: "live-video-to-video",
      params: {
        model_id: "stabilityai/sd-turbo",
        prompt: prompt,
        prompt_interpolation_method: "slerp",
        normalize_prompt_weights: true,
        normalize_seed_weights: true,
        negative_prompt: 'Low quality, blurry, distorted',
        num_inference_steps: inferenceSteps,
        seed: seed,
        t_index_list: [0, 8, 17],
        controlnets: [
          {
            conditioning_scale: poseScale,
            control_guidance_end: 1,
            control_guidance_start: 0,
            enabled: poseEnabled,
            model_id: "thibaud/controlnet-sd21-openpose-diffusers",
            preprocessor: "pose_tensorrt",
            preprocessor_params: {}
          },
          {
            conditioning_scale: hedScale,
            control_guidance_end: 1,
            control_guidance_start: 0,
            enabled: hedEnabled,
            model_id: "thibaud/controlnet-sd21-hed-diffusers",
            preprocessor: "soft_edge",
            preprocessor_params: {}
          },
          {
            conditioning_scale: cannyScale,
            control_guidance_end: 1,
            control_guidance_start: 0,
            enabled: cannyEnabled,
            model_id: "thibaud/controlnet-sd21-canny-diffusers",
            preprocessor: "canny",
            preprocessor_params: {
              high_threshold: 200,
              low_threshold: 100
            }
          },
          {
            conditioning_scale: depthScale,
            control_guidance_end: 1,
            control_guidance_start: 0,
            enabled: depthEnabled,
            model_id: "thibaud/controlnet-sd21-depth-diffusers",
            preprocessor: "depth_tensorrt",
            preprocessor_params: {}
          },
          {
            conditioning_scale: colorScale,
            control_guidance_end: 1,
            control_guidance_start: 0,
            enabled: colorEnabled,
            model_id: "thibaud/controlnet-sd21-color-diffusers",
            preprocessor: "passthrough",
            preprocessor_params: {}
          }
        ]
      }
    }
    
    // Log the parameters being sent
    console.log('🎨 Sending parameters to Vox API:');
    console.log('📝 Prompt:', prompt);
    
    await updateParameters(params)
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'} min-h-screen`}>
      <ReusableHeader />
      
      {/* Top Navigation Bar - Inspired by video editing interface */}
      <div className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b py-3`}>
        <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              <Button 
                onClick={generateRandomSeed} 
                variant="ghost" 
                size="sm"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                🎲
            </Button>
                 Seed:</span>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value))}
                min="0"
                max="999999"
                className="w-20 text-center font-mono text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              
            </div>
          </div>
          
          <div className="flex items-center gap-2">
          <div className="flex items-center gap-4">
              {/* Stream Status Indicators */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                streamData ? 'bg-green-500' : 'bg-gray-400'
              }`}>
                {streamData && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isStreaming ? 'bg-blue-500' : 'bg-gray-400'
              }`}>
                {isStreaming && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isRecording ? 'bg-red-500' : 'bg-gray-400'
              }`}>
                {isRecording && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isListening ? 'bg-purple-500' : 'bg-gray-400'
              }`}>
                {isListening && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            
            {recordedVideoUrl && (
              <>
                <Button 
                  onClick={() => {
                    downloadRecordedVideo();
                    clearRecordedVideo();
                  }}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
                >
                  📥 Download
                </Button>
                
              </>
            )}
            
            <Button 
              onClick={createStream}
              disabled={!!streamData}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                streamData 
                  ? 'bg-green-600 text-white cursor-not-allowed' 
                  : 'bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white'
              }`}
            >
              {streamData ? 'Started' : 'Start'}
            </Button>
          </div>
        </div>
        </div>
      </div>

        {/* Main Studio Layout */}
        <div className={`${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-100'} flex h-[calc(100vh-140px)]`}>
          <div className="max-w-7xl mx-auto flex w-full">
        {/* Left Sidebar - Camera Feed */}
        <div className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border-r w-80 flex flex-col`}>
          <div className="flex-1 p-4 space-y-4">
            {/* Camera Feed Card */}
            <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardContent className="p-0">
                <div className="relative">
                  <video 
                    ref={localVideoRef}
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {!localStream && (
                    <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center rounded-t-lg`}>
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        <Camera className="w-8 h-8 mx-auto mb-2" />
                        <div className="text-sm font-medium">Camera feed</div>
                        <div className="text-xs mt-1">Start camera to begin</div>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {localStream ? "LIVE" : "OFFLINE"}
                  </div>
                </div>
                
              </CardContent>
            </Card>

            
            {/* Recording Status */}
            {recordingStatus !== 'Ready to record' && (
              <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {recordingStatus}
                    </span>
                  </div>
                  {recordingDurationRef.current > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Duration: {(recordingDurationRef.current / 1000).toFixed(1)}s
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Stream Controls */}
            <StreamControls
              isConnected={isConnected}
              isStreaming={isStreaming}
              isLoading={isLoading}
              onUnifiedStart={handleUnifiedStart}
              onStartWebRTC={handleStartWebRTC}
              onUnifiedStop={handleUnifiedStop}
              isStreamCreated={!!streamData}
              isRecording={isRecording}
              onStartRecording={startIframeRecording}
              onStopRecording={stopVideoRecording}
              hasStreamData={!!streamData?.output_playback_id}
            />
          </div>
        </div>

        {/* Center - Main Video Preview */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6">
            <Card className={`h-full ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardContent className="p-0 h-full">
                <div className="relative h-full">
                  {streamData?.output_playback_id ? (
                    <iframe 
                      ref={outputPlayerRef}
                      src={`https://lvpr.tv/?v=${streamData.output_playback_id}&lowLatency=force&autoplay=true`}
                      frameBorder="0" 
                      allowFullScreen 
                      sandbox="allow-scripts allow-same-origin allow-presentation"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full rounded-lg"
                    />
                  ) : (
                    <div className={`w-full h-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center rounded-lg`}>
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        <div className="text-4xl mb-4">✨</div>
                        <div className="text-lg font-medium">AI Output Preview</div>
                        <div className="text-sm mt-2">Start streaming to see results</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Recording Guide Overlay */}
                  {showRecordingGuide && (
                    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 text-center">
                        <div className="text-4xl mb-4">🎯</div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Select AI Video Area
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          When the browser asks what to share, select <strong>"Entire screen"</strong> or <strong>"Window"</strong>, then choose the area containing the AI video output.
                        </p>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            💡 <strong>Tip:</strong> Look for the video area with the AI transformation - it should be the main content area in the center.
                          </p>
                        </div>
                        <Button 
                          onClick={() => setShowRecordingGuide(false)}
                          variant="outline"
                          className="text-sm"
                        >
                          Got it!
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* AI Prompt Overlay */}
                
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] flex justify-center pointer-events-none">
                    <div className="bg-black bg-opacity-70 rounded-md px-6 py-2 text-white text-lg font-medium shadow-lg max-w-2xl w-full text-center truncate">
                      {audioFeatures.transcript
                        ? audioFeatures.transcript
                        : <span className="opacity-60">This is a subtitle bar</span>
                      }
                     </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar - AI Parameters and Controls */}
        <div className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border-l w-80 flex flex-col`}>
          
          <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
            {/* Audio Features Display */}
            <AudioFeaturesDisplay
              volume={audioFeatures.volume}
              pitch={audioFeatures.pitch}
              emotion={audioFeatures.emotion}
              confidence={audioFeatures.confidence}
              visualStyle={audioFeatures.visualStyle}
              wpm={audioFeatures.wpm}
              transcript={audioFeatures.transcript}
              isListening={isListening}
              theme={theme}
            />
            
            <AIParameters
              inferenceSteps={inferenceSteps}
              setInferenceSteps={setInferenceSteps}
              poseEnabled={poseEnabled}
              setPoseEnabled={setPoseEnabled}
              poseScale={poseScale}
              setPoseScale={setPoseScale}
              hedEnabled={hedEnabled}
              setHedEnabled={setHedEnabled}
              hedScale={hedScale}
              setHedScale={setHedScale}
              cannyEnabled={cannyEnabled}
              setCannyEnabled={setCannyEnabled}
              cannyScale={cannyScale}
              setCannyScale={setCannyScale}
              depthEnabled={depthEnabled}
              setDepthEnabled={setDepthEnabled}
              depthScale={depthScale}
              setDepthScale={setDepthScale}
              colorEnabled={colorEnabled}
              setColorEnabled={setColorEnabled}
              colorScale={colorScale}
              setColorScale={setColorScale}
            />
          </div>
        </div>
          </div>
        </div>

      <ReusableFooter />
      <AlertSystem alerts={alerts} onRemoveAlert={removeAlert} />
    </div>
  )
}

export default Studio
