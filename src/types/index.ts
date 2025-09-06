export interface StreamData {
  id: string
  whip_url: string
  output_playback_id?: string
}

export interface AlertState {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  id: number
}
