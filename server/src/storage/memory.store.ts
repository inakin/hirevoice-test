import { Recording } from '../types.js'

class MemoryStore {
  private recordings = new Map<string, Recording>()

  save(recording: Recording): void {
    this.recordings.set(recording.id, recording)
  }

  getById(id: string): Recording | undefined {
    return this.recordings.get(id)
  }

  getAll(): Recording[] {
    return Array.from(this.recordings.values())
  }

  updateStatus(
    id: string,
    status: Recording['status'],
    data?: Partial<Pick<Recording, 'transcription' | 'evaluation'>>
  ): void {
    const recording = this.recordings.get(id)
    if (recording) {
      recording.status = status
      if (data?.transcription !== undefined) {
        recording.transcription = data.transcription
      }
      if (data?.evaluation !== undefined) {
        recording.evaluation = data.evaluation
      }
    }
  }
}

export const memoryStore = new MemoryStore()
