import { useEffect, useState, ReactNode } from 'react'

interface PermissionGateProps {
  onPermissionGranted: (stream: MediaStream) => void
  children: ReactNode
}

type PermissionStatus = 'requesting' | 'granted' | 'denied'

export function PermissionGate({ onPermissionGranted, children }: PermissionGateProps) {
  const [status, setStatus] = useState<PermissionStatus>('requesting')
  const [error, setError] = useState<string | null>(null)

  const requestPermissions = async () => {
    setStatus('requesting')
    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      setStatus('granted')
      onPermissionGranted(stream)
    } catch (err) {
      setStatus('denied')
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera and microphone access was denied. Please allow access to continue.')
        } else if (err.name === 'NotFoundError') {
          setError('No camera or microphone found. Please connect a device and try again.')
        } else {
          setError(err.message)
        }
      } else {
        setError('Failed to access camera and microphone')
      }
    }
  }

  useEffect(() => {
    requestPermissions()
  }, [])

  if (status === 'requesting') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Requesting Access
          </h2>
          <p className="text-gray-500">
            Please allow access to your camera and microphone to continue
          </p>
        </div>
      </div>
    )
  }

  if (status === 'denied') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Permission Required
          </h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={requestPermissions}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
