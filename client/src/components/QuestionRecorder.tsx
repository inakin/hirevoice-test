import { useEffect, useRef, useState } from 'react'
import { Question } from '../types'
import { useTimer } from '../hooks/useTimer'
import { uploadRecording } from '../lib/api'

interface QuestionRecorderProps {
  question: Question
  totalQuestions: number
  candidateName: string
  stream: MediaStream
  onNext: () => void
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

const RECORDING_TIME = 60
const WARNING_THRESHOLD = 10

export function QuestionRecorder({
  question,
  totalQuestions,
  candidateName,
  stream,
  onNext,
}: QuestionRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const [isRecording, setIsRecording] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  const { timeRemaining, start: startTimer, stop: stopTimer, reset: resetTimer } = useTimer({
    initialSeconds: RECORDING_TIME,
    onComplete: () => {
      handleStopRecording()
    },
  })

  const isWarning = timeRemaining <= WARNING_THRESHOLD && timeRemaining > 0

  // Set up video preview
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  // Fade in on mount
  useEffect(() => {
    setIsVisible(true)
  }, [question.index])

  const handleStartRecording = () => {
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
      handleUpload(blob)
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start(1000)
    setIsRecording(true)
    startTimer()
  }

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    stopTimer()
  }

  const handleUpload = async (blob: Blob) => {
    setUploadStatus('uploading')
    try {
      await uploadRecording(blob, question.index, candidateName)
      setUploadStatus('success')
      // Fade out before transitioning
      setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => {
          setUploadStatus('idle')
          setRecordedBlob(null)
          resetTimer()
          onNext()
        }, 300)
      }, 700)
    } catch (err) {
      console.error('Upload failed:', err)
      setUploadStatus('error')
    }
  }

  const handleRetry = () => {
    if (recordedBlob) {
      handleUpload(recordedBlob)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((RECORDING_TIME - timeRemaining) / RECORDING_TIME) * 100

  return (
    <div
      className={`space-y-6 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Question header */}
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-1">
          Question {question.index + 1} of {totalQuestions}
        </p>
        <h2 className="text-xl font-semibold text-gray-900">
          {question.text}
        </h2>
      </div>

      {/* Video preview */}
      <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-inner">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover scale-x-[-1]"
        />

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            REC
          </div>
        )}

        {/* Timer overlay */}
        {isRecording && (
          <div
            className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-lg font-mono font-semibold shadow-lg transition-colors duration-300 ${
              isWarning
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-black/60 text-white'
            }`}
          >
            {formatTime(timeRemaining)}
          </div>
        )}

        {/* Upload overlay */}
        {uploadStatus === 'uploading' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-lg px-6 py-4 flex items-center gap-3 shadow-xl">
              <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-gray-700 font-medium">Uploading your response...</span>
            </div>
          </div>
        )}

        {/* Success overlay */}
        {uploadStatus === 'success' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-lg px-6 py-4 flex items-center gap-3 shadow-xl">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700 font-medium">Response saved!</span>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar during recording */}
      {isRecording && (
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              isWarning ? 'bg-red-500' : 'bg-blue-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center min-h-[52px]">
        {uploadStatus === 'idle' && !isRecording && (
          <button
            onClick={handleStartRecording}
            className="flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-full font-medium hover:bg-red-700 active:scale-95 transition-all shadow-lg hover:shadow-xl"
          >
            <span className="w-3 h-3 bg-white rounded-full" />
            Start Recording
          </button>
        )}

        {isRecording && (
          <button
            onClick={handleStopRecording}
            className="flex items-center gap-2 bg-gray-800 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-900 active:scale-95 transition-all shadow-lg"
          >
            <span className="w-3 h-3 bg-white rounded-sm" />
            Stop Recording
          </button>
        )}

        {uploadStatus === 'error' && (
          <div className="flex flex-col items-center gap-3 bg-red-50 px-6 py-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 text-red-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Upload failed</span>
            </div>
            <button
              onClick={handleRetry}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
