# HireVoice Test

A video interview platform that records candidate responses and automatically evaluates them using AI. Candidates answer predefined questions via video, which are then transcribed and scored.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           Client                                │
│  React + TypeScript + Tailwind CSS v4 + Vite                   │
│                                                                 │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐   │
│  │ Welcome     │───▶│ Interview    │───▶│ Completion      │   │
│  │ Screen      │    │ Screen       │    │ Screen          │   │
│  └─────────────┘    └──────────────┘    └─────────────────┘   │
│                            │                                    │
│                     ┌──────▼──────┐                            │
│                     │ Question    │                            │
│                     │ Recorder    │                            │
│                     │ (MediaRecorder API)                      │
│                     └──────┬──────┘                            │
└────────────────────────────┼────────────────────────────────────┘
                             │ POST /api/recordings
                             │ (video/webm)
┌────────────────────────────▼────────────────────────────────────┐
│                           Server                                │
│  Node.js + Express + TypeScript                                │
│                                                                 │
│  ┌─────────────┐    ┌──────────────────────────────────────┐   │
│  │ Multer      │───▶│ Processing Pipeline                  │   │
│  │ (upload)    │    │                                      │   │
│  └─────────────┘    │  ┌────────────┐    ┌─────────────┐  │   │
│                     │  │ Whisper    │───▶│ GPT-4o-mini │  │   │
│                     │  │ (transcribe)   │ (evaluate)   │  │   │
│                     │  └────────────┘    └─────────────┘  │   │
│                     └──────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────┐                                               │
│  │ Memory Store│  (in-memory storage for demo purposes)        │
│  └─────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### Frontend

| Decision | Rationale |
|----------|-----------|
| **React + Vite** | Fast development experience with HMR. Vite provides near-instant cold starts compared to webpack-based setups. |
| **Tailwind CSS v4** | Utility-first CSS with the new v4 engine for better performance. No separate CSS files needed. |
| **MediaRecorder API** | Native browser API for video recording. No external dependencies needed. Uses WebM format with VP8/Opus codecs for broad compatibility. |
| **State machine pattern** | The app uses a simple state machine (`welcome` → `interview` → `completed`) making the flow predictable and easy to debug. |
| **Permission gate pattern** | Camera/mic permissions are requested upfront and the stream is shared across all question recordings, avoiding repeated permission prompts. |
| **60-second time limit** | Each recording has a maximum duration with visual countdown. Prevents overly long responses and keeps interviews structured. |

### Backend

| Decision | Rationale |
|----------|-----------|
| **Express + TypeScript** | Minimal setup, widely understood, excellent TypeScript support. |
| **tsx for development** | Runs TypeScript directly without a build step during development. |
| **Multer for uploads** | Battle-tested multipart form handling. Files are saved to disk with UUID filenames. |
| **Pipeline pattern** | Processing is broken into discrete processors (`TranscriptionProcessor` → `EvaluationProcessor`). Easy to add new steps (e.g., sentiment analysis) or modify existing ones. |
| **Async processing** | Recordings are accepted immediately (HTTP 202) and processed in the background. The client doesn't wait for AI processing to complete. |
| **In-memory storage** | Simple `Map`-based storage for demo purposes. In production, this would be replaced with a database. |

### AI Integration

| Decision | Rationale |
|----------|-----------|
| **Whisper-1** | OpenAI's speech-to-text model. Handles various accents and audio quality well. |
| **GPT-4o-mini** | Cost-effective model for evaluation. Structured JSON output for consistent scoring. |
| **Low temperature (0.3)** | More consistent/deterministic evaluations across runs. |
| **5-point scoring** | Evaluates relevance, clarity, depth, communication, and overall score with justification. |

## Project Structure

```
hirevoice-test/
├── client/                    # Frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── WelcomeScreen.tsx      # Name input
│   │   │   ├── InterviewScreen.tsx    # Question flow orchestration
│   │   │   ├── QuestionRecorder.tsx   # Recording UI + timer
│   │   │   ├── PermissionGate.tsx     # Camera/mic permission handling
│   │   │   └── CompletionScreen.tsx   # Summary screen
│   │   ├── hooks/
│   │   │   ├── useMediaRecorder.ts    # Recording logic abstraction
│   │   │   └── useTimer.ts            # Countdown timer
│   │   ├── data/
│   │   │   └── questions.ts           # Interview questions
│   │   ├── lib/
│   │   │   └── api.ts                 # API client
│   │   └── types.ts
│   └── package.json
│
├── server/                    # Backend application
│   ├── src/
│   │   ├── routes/
│   │   │   └── recordings.ts          # Upload endpoint
│   │   ├── services/
│   │   │   ├── processing.pipeline.ts # Pipeline orchestration
│   │   │   ├── transcription.service.ts
│   │   │   ├── evaluation.service.ts
│   │   │   └── openai.client.ts
│   │   ├── storage/
│   │   │   └── memory.store.ts        # In-memory storage
│   │   ├── types.ts
│   │   └── index.ts
│   ├── uploads/               # Recorded videos
│   └── package.json
│
└── package.json               # Root package with concurrently
```

## Setup

### Prerequisites

- Node.js 18+
- OpenAI API key

### Installation

```bash
# Install root dependencies
npm install

# Install client and server dependencies
cd client && npm install
cd ../server && npm install

# Configure environment
cp server/.env.example server/.env
# Edit server/.env and add your OpenAI API key
```

### Development

```bash
npm run dev
```

This starts both client (http://localhost:5173) and server (http://localhost:3001) concurrently.

## API

### POST /api/recordings

Upload a video recording for processing.

**Request:** `multipart/form-data`
- `video` (file): WebM video file
- `questionIndex` (string): Question number (0-indexed)
- `candidateName` (string): Candidate's name

**Response:** `202 Accepted`
```json
{
  "id": "uuid",
  "status": "processing"
}
```

### GET /api/recordings

List all recordings with their status and evaluations.

**Response:**
```json
[
  {
    "id": "uuid",
    "questionIndex": 0,
    "candidateName": "John Doe",
    "status": "completed",
    "transcription": "...",
    "evaluation": {
      "relevance": 4,
      "clarity": 5,
      "depth": 3,
      "communication": 4,
      "overall_score": 4,
      "justification": "..."
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET /api/health

Health check endpoint.

## Interview Questions

The default questions are:

1. Tell us about yourself
2. What's your greatest achievement?
3. Where do you see yourself in 5 years?
4. Why do you want to work with us?
5. How do you handle working under pressure?

Questions can be customized in `client/src/data/questions.ts` and `server/src/types.ts`.

## Evaluation Criteria

Each response is scored on a 1-5 scale across:

| Criterion | Description |
|-----------|-------------|
| **Relevance** | How directly the answer addresses the question |
| **Clarity** | Structure and coherence of the response |
| **Depth** | Level of detail and examples provided |
| **Communication** | Speaking ability and articulation |
| **Overall Score** | Holistic assessment |

## Future Improvements

- [ ] Database persistence (PostgreSQL/MongoDB)
- [ ] Real-time status updates via WebSocket
- [ ] Admin dashboard for reviewing responses
- [ ] Custom question sets per interview
- [ ] Video playback in evaluation view
- [ ] Export evaluations to PDF/CSV
