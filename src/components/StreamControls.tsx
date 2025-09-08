import React from 'react'
import { Button } from '@/components/ui/button'

interface StreamControlsProps {
  isConnected: boolean
  isRecording: boolean
  isStreaming: boolean
  isLoading: boolean
  onUnifiedStart: () => void
  onStartWebRTC: () => void
  onUnifiedStop: () => void
  isStreamCreated: boolean
}

const StreamControls: React.FC<StreamControlsProps> = ({
  isConnected,
  isRecording,
  isStreaming,
  isLoading,
  onUnifiedStart,
  onStartWebRTC,
  onUnifiedStop,
  isStreamCreated
}) => {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 text-center">🎮 Stream Controls</h3>
      <div className="space-y-2">
        <Button 
          onClick={onUnifiedStart}
          disabled={!isStreamCreated || isRecording || isStreaming || isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
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
          disabled={!isStreamCreated || isStreaming || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200"
        >
          📡 Start WebRTC Stream
        </Button>
        <Button 
          onClick={onUnifiedStop}
          disabled={!isStreamCreated || (!isRecording && !isStreaming) || isLoading}
          variant="destructive"
          className="w-full px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
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
            className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20 px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200"
          >
            🔄 Retry Connection
          </Button>
        )}
      </div>
    </div>
  )
}

export default StreamControls
