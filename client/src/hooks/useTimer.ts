import { useState, useRef, useCallback, useEffect } from 'react'

interface UseTimerOptions {
  initialSeconds?: number
  onComplete?: () => void
}

interface UseTimerReturn {
  timeRemaining: number
  isRunning: boolean
  start: () => void
  stop: () => void
  reset: () => void
}

export function useTimer({
  initialSeconds = 60,
  onComplete,
}: UseTimerOptions = {}): UseTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)

  const intervalRef = useRef<number | null>(null)
  const onCompleteRef = useRef(onComplete)

  // Keep callback ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    clearTimer()
    setIsRunning(true)

    intervalRef.current = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearTimer()
          setIsRunning(false)
          onCompleteRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [clearTimer])

  const stop = useCallback(() => {
    clearTimer()
    setIsRunning(false)
  }, [clearTimer])

  const reset = useCallback(() => {
    clearTimer()
    setIsRunning(false)
    setTimeRemaining(initialSeconds)
  }, [clearTimer, initialSeconds])

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  return {
    timeRemaining,
    isRunning,
    start,
    stop,
    reset,
  }
}
