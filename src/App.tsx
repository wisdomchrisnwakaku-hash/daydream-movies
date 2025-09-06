import { useState } from 'react'
import Header from '@/components/Header'
import StreamCreation from '@/components/StreamCreation'
import VideoCapture from '@/components/VideoCapture'
import AIParameters from '@/components/AIParameters'
import AlertSystem from '@/components/AlertSystem'
import { useStreamAPI } from '@/hooks/useStreamAPI'

function App() {
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
  const [negativePrompt, setNegativePrompt] = useState("blurry, low quality, flat, 2d")
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

  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 999999)
    setSeed(randomSeed)
  }

  const handleStart = async () => {
    await startCamera()
    await startWebRTCStream()
  }

  const handleStartWebRTC = async () => {
    await startWebRTCStream()
  }

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
        negative_prompt: negativePrompt,
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
    
    await updateParameters(params)
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          <StreamCreation onCreateStream={createStream} />
          
          <VideoCapture
            streamData={streamData}
            localStream={localStream}
            localVideoRef={localVideoRef}
            outputPlayerRef={outputPlayerRef}
          />
          
          <AIParameters
            streamData={streamData}
            prompt={prompt}
            setPrompt={setPrompt}
            negativePrompt={negativePrompt}
            setNegativePrompt={setNegativePrompt}
            inferenceSteps={inferenceSteps}
            setInferenceSteps={setInferenceSteps}
            seed={seed}
            setSeed={setSeed}
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
            onUpdateParameters={handleUpdateParameters}
            onGenerateRandomSeed={generateRandomSeed}
            onStart={handleStart}
            onStop={stopStream}
            onStartWebRTC={handleStartWebRTC}
            isStreaming={isStreaming}
          />
        </div>
      </div>

      <AlertSystem alerts={alerts} onRemoveAlert={removeAlert} />
    </div>
  )
}

export default App
