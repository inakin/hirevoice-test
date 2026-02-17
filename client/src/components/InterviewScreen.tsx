import { useState, useEffect, useCallback } from 'react'
import { questions } from '../data/questions'
import { PermissionGate } from './PermissionGate'
import { QuestionRecorder } from './QuestionRecorder'

interface InterviewScreenProps {
  candidateName: string
  onComplete: (answeredCount: number) => void
}

export function InterviewScreen({ candidateName, onComplete }: InterviewScreenProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex) / questions.length) * 100

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  const handlePermissionGranted = useCallback((mediaStream: MediaStream) => {
    setStream(mediaStream)
  }, [])

  const handleNext = useCallback(() => {
    setAnsweredCount((prev) => prev + 1)

    if (currentQuestionIndex < questions.length - 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1)
        setIsTransitioning(false)
      }, 100)
    } else {
      // Interview complete - release stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      onComplete(answeredCount + 1)
    }
  }, [currentQuestionIndex, stream, answeredCount, onComplete])

  const handleSkip = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1)
        setIsTransitioning(false)
      }, 100)
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      onComplete(answeredCount)
    }
  }, [currentQuestionIndex, stream, answeredCount, onComplete])

  return (
    <PermissionGate onPermissionGranted={handlePermissionGranted}>
      <div className="min-h-screen bg-gray-50 py-6 px-4 lg:py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-lg font-semibold text-gray-900">Video Interview</h1>
              <span className="text-sm text-gray-500">
                {candidateName}
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progress</span>
                <span>{currentQuestionIndex + 1} of {questions.length}</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Main card */}
          <div
            className={`bg-white rounded-2xl shadow-xl p-5 lg:p-8 transition-opacity duration-200 ${
              isTransitioning ? 'opacity-50' : 'opacity-100'
            }`}
          >
            {stream && (
              <QuestionRecorder
                key={currentQuestionIndex}
                question={currentQuestion}
                totalQuestions={questions.length}
                candidateName={candidateName}
                stream={stream}
                onNext={handleNext}
              />
            )}
          </div>

          {/* Skip button */}
          <div className="mt-4 text-center">
            <button
              onClick={handleSkip}
              disabled={isTransitioning}
              className="text-gray-400 hover:text-gray-600 text-sm transition-colors disabled:opacity-50"
            >
              Skip this question
            </button>
          </div>

          {/* Question indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx < currentQuestionIndex
                    ? 'bg-green-500'
                    : idx === currentQuestionIndex
                    ? 'bg-blue-600 scale-125'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </PermissionGate>
  )
}
