# QuickNotes AI Features

## Overview

QuickNotes integrates LangChain-powered AI agents to enhance your note-taking and studying experience. All AI features support both **OpenAI** and **Anthropic** models.

## Setup

### 1. Install Dependencies

```bash
npm install langchain @langchain/openai @langchain/anthropic @langchain/community openai ai faiss-node
```

### 2. Configure API Keys

Create a `.env.local` file in the project root:

```env
# Required: At least one AI provider
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Get your API keys:
- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/

### 3. Default Configuration

The default configuration is in [`src/lib/ai/config.ts`](src/lib/ai/config.ts):
- **Default Provider**: OpenAI
- **Models**: GPT-4o for complex tasks, GPT-4o-mini for simple tasks
- **Temperature**: Varies by task (0.2-0.8)

## AI Agents

### 1. Note Summarizer

**Purpose**: Summarize long notes into concise summaries with key points and topics.

**API Endpoint**: `POST /api/ai/summarize`

**Request**:
```json
{
  "title": "Machine Learning Basics",
  "content": "Long note content...",
  "maxLength": "medium"
}
```

**Response**:
```json
{
  "summary": "Brief 2-3 sentence summary",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "topics": ["Topic A", "Topic B"],
  "wordCount": 523
}
```

**Service Usage**:
```typescript
import { NoteSummarizerService } from '@/lib/ai';

const summarizer = new NoteSummarizerService();
const summary = await summarizer.summarize(title, content, 'medium');
```

---

### 2. Mindmap Generator

**Purpose**: Convert notes into structured, visual mindmaps.

**API Endpoint**: `POST /api/ai/mindmap`

**Request**:
```json
{
  "title": "Biology: Cell Structure",
  "content": "Note content about cells..."
}
```

**Response**:
```json
{
  "title": "Cell Structure",
  "nodes": [
    { "id": "root", "label": "Cell", "type": "root", "position": { "x": 400, "y": 300 } },
    { "id": "branch-1", "label": "Organelles", "type": "branch", "position": { "x": 600, "y": 300 } }
  ],
  "edges": [
    { "id": "e-root-branch-1", "source": "root", "target": "branch-1" }
  ]
}
```

**Service Usage**:
```typescript
import { MindmapGeneratorService } from '@/lib/ai';

const generator = new MindmapGeneratorService();
const mindmap = await generator.generateMindmap(title, content);
```

---

### 3. Quiz Maker

**Purpose**: Generate flashcards, multiple choice, and fill-in-the-blank quizzes from notes.

**API Endpoint**: `POST /api/ai/quiz`

**Request (Flashcards)**:
```json
{
  "title": "History: World War II",
  "content": "Note content...",
  "count": 10,
  "type": "flashcard"
}
```

**Response**:
```json
{
  "title": "World War II - Quiz",
  "flashcards": [
    {
      "id": "card-1",
      "question": "When did World War II begin?",
      "answer": "September 1, 1939",
      "hint": "Think about the invasion of Poland",
      "difficulty": "easy"
    }
  ],
  "totalCards": 10,
  "estimatedTime": 15
}
```

**Quiz Types**:
- `flashcard` - Q&A flashcards (default)
- `multiple-choice` - Multiple choice questions
- `fill-in-blank` - Fill in the blank questions

**Service Usage**:
```typescript
import { QuizMakerService } from '@/lib/ai';

const quizMaker = new QuizMakerService();

// Flashcards
const quiz = await quizMaker.generateFlashcards(title, content, 10);

// Multiple choice
const mcq = await quizMaker.generateMultipleChoice(title, content, 5);

// Fill in blanks
const fib = await quizMaker.generateFillInBlanks(title, content, 10);
```

---

### 4. Study Assistant (RAG)

**Purpose**: Conversational Q&A with your notes using Retrieval-Augmented Generation.

**API Endpoint**: `POST /api/ai/assistant`

**Initialize with Notes**:
```json
{
  "action": "initialize",
  "sessionId": "user-session-123",
  "notes": [
    { "id": "1", "title": "Note 1", "content": "...", "tags": ["math"] },
    { "id": "2", "title": "Note 2", "content": "...", "tags": ["physics"] }
  ]
}
```

**Ask a Question**:
```json
{
  "action": "ask",
  "sessionId": "user-session-123",
  "question": "What is Newton's second law?",
  "conversationHistory": [
    { "role": "user", "content": "Previous question", "timestamp": "..." },
    { "role": "assistant", "content": "Previous answer", "timestamp": "..." }
  ]
}
```

**Response**:
```json
{
  "answer": "Based on your notes, Newton's second law states..."
}
```

**Other Actions**:
- `find-related` - Find related notes by similarity
- `study-suggestions` - Get study activity suggestions
- `study-plan` - Generate a multi-day study plan

**Service Usage**:
```typescript
import { StudyAssistantService } from '@/lib/ai';

const assistant = new StudyAssistantService();

// Initialize with notes
await assistant.initializeWithNotes(notes);

// Ask questions
const answer = await assistant.ask("What is photosynthesis?", conversationHistory);

// Find related notes
const related = await assistant.findRelatedNotes("quantum mechanics", 5);

// Get study suggestions
const suggestions = await assistant.generateStudySuggestions(["calculus", "physics"]);

// Generate study plan
const plan = await assistant.generateStudyPlan(noteIds, 7);
```

---

### 5. Voice Transcription

**Purpose**: Convert audio recordings to text using OpenAI Whisper.

**API Endpoint**: `POST /api/ai/transcribe`

**Request** (form-data):
```
audio: <File> (audio blob)
language: "en" (optional)
withSummary: "true" (optional)
```

**Response**:
```json
{
  "transcription": {
    "text": "Transcribed text from audio...",
    "language": "en",
    "duration": 45.2
  },
  "summary": "Optional AI-generated summary of the recording"
}
```

**Service Usage**:
```typescript
import { TranscriptionService } from '@/lib/ai';

const transcription = new TranscriptionService();

// Transcribe audio
const result = await transcription.transcribeAudio(audioBlob, 'en');

// Transcribe with summary
const { transcription, summary } = await transcription.transcribeAndSummarize(audioBlob);
```

---

## Architecture

### Service Layer

All AI services extend `BaseAIService` which provides:
- LLM initialization (OpenAI or Anthropic)
- Error handling
- Configuration validation

```
src/lib/ai/
├── config.ts           # AI configuration
├── types.ts            # TypeScript interfaces
├── base-service.ts     # Abstract base class
├── summarizer.ts       # Note summarizer
├── mindmap-generator.ts # Mindmap generator
├── quiz-maker.ts       # Quiz/flashcard maker
├── study-assistant.ts  # RAG-based assistant
├── transcription.ts    # Whisper transcription
└── index.ts           # Exports & singletons
```

### API Routes

```
src/app/api/ai/
├── summarize/route.ts
├── mindmap/route.ts
├── quiz/route.ts
├── assistant/route.ts
└── transcribe/route.ts
```

## Models Used

### OpenAI
- **GPT-4o**: Complex tasks (mindmaps, study plans)
- **GPT-4o-mini**: Simple tasks (summaries, quizzes)
- **Whisper-1**: Audio transcription

### Anthropic
- **Claude 3.5 Sonnet**: Complex tasks
- **Claude 3.5 Haiku**: Simple tasks

## Cost Optimization

- Use temperature settings to control creativity vs consistency
- Limit max tokens per request
- Use batch processing when possible
- Cache embeddings for RAG (in production)

## Future Enhancements

- [ ] Contextual search across all notes
- [ ] AI-suggested note connections
- [ ] Note rewriting/simplification
- [ ] Topic-based study plan generator
- [ ] Spaced repetition flashcard scheduling
- [ ] Multi-language support for transcription
- [ ] Real-time collaborative Q&A

## Troubleshooting

### "OPENAI_API_KEY is not configured"
Add your API key to `.env.local` and restart the dev server.

### "Failed to transcribe audio"
Ensure the audio format is supported by Whisper (WebM, MP3, MP4, etc.)

### RAG not finding relevant notes
Make sure you call `initializeWithNotes()` before using the Study Assistant.

## Security

- API keys are stored in `.env.local` (never commit this file)
- Add `.env.local` to `.gitignore`
- Use environment variables in production
- Implement rate limiting for production (not included)

---

**Need Help?** Check the [LangChain docs](https://js.langchain.com/docs/) or [OpenAI API docs](https://platform.openai.com/docs/).
