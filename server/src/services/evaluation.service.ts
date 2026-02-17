import { Evaluation, Processor, QUESTIONS, Recording } from '../types.js'
import { memoryStore } from '../storage/memory.store.js'
import { getOpenAIClient } from './openai.client.js'

export const evaluationProcessor: Processor = {
  name: 'EvaluationProcessor',

  async process(recording: Recording): Promise<void> {
    const openai = getOpenAIClient()
    const question = QUESTIONS[recording.questionIndex] || 'Unknown question'
    const transcription = recording.transcription || ''

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert interview evaluator. Analyze the candidate's response to an interview question and provide a JSON evaluation with the following scores (1-5 scale):
- relevance: How relevant is the answer to the question?
- clarity: How clear and well-structured is the response?
- depth: How much depth and detail does the answer provide?
- communication: How well does the candidate communicate?
- overall_score: Overall score considering all factors
- justification: A brief explanation of the scores

Respond ONLY with valid JSON in this exact format:
{
  "relevance": <number>,
  "clarity": <number>,
  "depth": <number>,
  "communication": <number>,
  "overall_score": <number>,
  "justification": "<string>"
}`,
        },
        {
          role: 'user',
          content: `Question: "${question}"\n\nCandidate's Response: "${transcription}"`,
        },
      ],
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content || '{}'
    const evaluation: Evaluation = JSON.parse(content)

    memoryStore.updateStatus(recording.id, 'completed', { evaluation })
    recording.evaluation = evaluation

    console.log(`
═══════════════════════════════════════════════════════════
📋 EVALUATION RESULT
Question: "${question}"
Transcription: "${transcription}"
Score: ${evaluation.overall_score}/5
Justification: "${evaluation.justification}"
═══════════════════════════════════════════════════════════
`)
  },
}
