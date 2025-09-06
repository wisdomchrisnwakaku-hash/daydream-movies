import React, { RefObject } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StreamData } from '@/types'

interface VideoCaptureProps {
  streamData: StreamData | null
  localStream: MediaStream | null
  localVideoRef: RefObject<HTMLVideoElement>
  outputPlayerRef: RefObject<HTMLIFrameElement>
}

const VideoCapture: React.FC<VideoCaptureProps> = ({
  streamData,
  localStream,
  localVideoRef,
  outputPlayerRef
}) => {
  if (!streamData) return null

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
          <span className="text-2xl">📹</span>
          Video & AI Output
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Video */}
          <div className="space-y-3">
            <div className="relative">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Camera Input
              </h3>
              <div className="video-container relative overflow-hidden rounded-xl shadow-lg border-2 border-gray-200">
                <video 
                  ref={localVideoRef}
                  autoPlay 
                  muted 
                  playsInline 
                  className="w-full bg-gray-100 h-64 object-cover"
                />
                {!localStream && (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-3xl mb-2">📷</div>
                      <div className="text-sm font-medium">Camera feed will appear here</div>
                      <div className="text-xs mt-1">Start camera to begin</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* AI Output */}
          <div className="space-y-3">
            <div className="relative">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                AI Generated Output
              </h3>
              <div className="video-container relative overflow-hidden rounded-xl shadow-lg border-2 border-gray-200">
                {streamData?.output_playback_id ? (
                  <iframe 
                    ref={outputPlayerRef}
                    src={`https://lvpr.tv/?v=${streamData.output_playback_id}&lowLatency=force&autoplay=true`}
                    frameBorder="0" 
                    allowFullScreen 
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full bg-gray-100 h-64"
                  />
                ) : (
                  <div className="w-full bg-gradient-to-br from-gray-100 to-gray-200 h-64 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-3xl mb-2">✨</div>
                      <div className="text-sm font-medium">AI Output will appear here</div>
                      <div className="text-xs mt-1">Start streaming to see results</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default VideoCapture
