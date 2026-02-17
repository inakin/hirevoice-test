import { useState, useRef, useCallback } from 'react'

interface UseMediaRecorderReturn {
  stream: MediaStream | null
  isRecording: boolean
  recordedBlob: Blob | null
  error: string | null
  requestPermissions: () => Promise<boolean>
  startRecording: () => void
  stopRecording: () => void
  releaseStream: () => void
  clearRecording: () => void
}

export function useMediaRecorder(): UseMediaRecorderReturn {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      setStream(mediaStream)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to access camera/microphone'
      setError(message)
      return false
    }
  }, [])

  const startRecording = useCallback(() => {
    if (!stream) {
      setError('No stream available')
      return
    }

    chunksRef.current = []
    setRecordedBlob(null)

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
      ? 'video/webm;codecs=vp8,opus'
      : 'video/webm'

    const mediaRecorder = new MediaRecorder(stream, { mimeType })

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType })
      setRecordedBlob(blob)
      setIsRecording(false)
    }

    mediaRecorder.onerror = () => {
      setError('Recording error occurred')
      setIsRecording(false)
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start(1000) // Collect data every second
    setIsRecording(true)
  }, [stream])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const releaseStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    mediaRecorderRef.current = null
    setIsRecording(false)
  }, [stream])

  const clearRecording = useCallback(() => {
    setRecordedBlob(null)
    chunksRef.current = []
  }, [])

  return {
    stream,
    isRecording,
    recordedBlob,
    error,
    requestPermissions,
    startRecording,
    stopRecording,
    releaseStream,
    clearRecording,
  }
}
