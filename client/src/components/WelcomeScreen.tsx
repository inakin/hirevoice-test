import { useState } from 'react'

interface WelcomeScreenProps {
  onStart: (name: string) => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [name, setName] = useState('')

  const handleStart = () => {
    onStart(name.trim() || 'Anonymous')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-semibold text-gray-900 text-center mb-2">
          Video Interview
        </h1>
        <p className="text-gray-500 text-center mb-8">
          Answer 5 questions to complete your interview
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your name (optional)
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          <button
            onClick={handleStart}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Start Interview
          </button>
        </div>
      </div>
    </div>
  )
}
