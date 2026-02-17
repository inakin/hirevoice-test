import fs from 'fs'
import { Processor, Recording } from '../types.js'
import { memoryStore } from '../storage/memory.store.js'
import { getOpenAIClient } from './openai.client.js'

export const transcriptionProcessor: Processor = {
  name: 'TranscriptionProcessor',

  async process(recording: Recording): Promise<void> {
    const openai = getOpenAIClient()
    const file = fs.createReadStream(recording.filePath)

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
    })

    memoryStore.updateStatus(recording.id, 'processing', {
      transcription: transcription.text,
    })

    recording.transcription = transcription.text
  },
}
