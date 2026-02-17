interface CompletionScreenProps {
  answeredCount: number
  totalQuestions: number
}

export function CompletionScreen({ answeredCount, totalQuestions }: CompletionScreenProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Interview Complete
        </h1>

        <p className="text-gray-500 mb-6">
          Thank you for completing your video interview
        </p>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700">
            You answered <span className="font-semibold">{answeredCount}</span> of{' '}
            <span className="font-semibold">{totalQuestions}</span> questions
          </p>
        </div>
      </div>
    </div>
  )
}
