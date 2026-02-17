export interface Evaluation {
  relevance: number
  clarity: number
  depth: number
  communication: number
  overall_score: number
  justification: string
}

export interface Recording {
  id: string
  questionIndex: number
  candidateName: string
  filePath: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  transcription?: string
  evaluation?: Evaluation
  createdAt: Date
}

export interface Processor {
  name: string
  process(recording: Recording): Promise<void>
}

export const QUESTIONS = [
  "Tell us about yourself",
  "What's your greatest achievement?",
  "Where do you see yourself in 5 years?",
  "Why do you want to work with us?",
  "How do you handle working under pressure?"
]
