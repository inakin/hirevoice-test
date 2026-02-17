import { Processor, Recording } from '../types.js'
import { memoryStore } from '../storage/memory.store.js'
import { transcriptionProcessor } from './transcription.service.js'
import { evaluationProcessor } from './evaluation.service.js'

class ProcessingPipeline {
  private processors: Processor[] = []

  register(processor: Processor): this {
    this.processors.push(processor)
    return this
  }

  async execute(recording: Recording): Promise<void> {
    memoryStore.updateStatus(recording.id, 'processing')

    for (const processor of this.processors) {
      try {
        console.log(`[Pipeline] Running ${processor.name} for recording ${recording.id}`)
        await processor.process(recording)
        console.log(`[Pipeline] ${processor.name} completed for recording ${recording.id}`)
      } catch (error) {
        console.error(`[Pipeline] ${processor.name} failed for recording ${recording.id}:`, error)
        memoryStore.updateStatus(recording.id, 'failed')
        return
      }
    }
  }
}

export const processingPipeline = new ProcessingPipeline()
  .register(transcriptionProcessor)
  .register(evaluationProcessor)
