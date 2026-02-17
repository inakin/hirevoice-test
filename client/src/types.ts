export type InterviewState = 'welcome' | 'interview' | 'completed'

export interface Question {
  index: number
  text: string
}
