import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StreamCreationProps {
  onCreateStream: () => void
}

const StreamCreation: React.FC<StreamCreationProps> = ({ onCreateStream }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🚀 Create Stream
          <Button onClick={onCreateStream} className="ml-auto">
            Create Stream
          </Button>
        </CardTitle>
      </CardHeader>
    </Card>
  )
}

export default StreamCreation
