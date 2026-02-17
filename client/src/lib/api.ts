export async function uploadRecording(
  videoBlob: Blob,
  questionIndex: number,
  candidateName: string
): Promise<{ id: string; status: string }> {
  const formData = new FormData()
  formData.append('video', videoBlob, 'recording.webm')
  formData.append('questionIndex', questionIndex.toString())
  formData.append('candidateName', candidateName)

  const response = await fetch('/api/recordings', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Failed to upload recording')
  }

  return response.json()
}
