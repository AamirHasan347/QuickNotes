# Testing QuickNotes AI Features

## Quick Start

### 1. Setup API Keys

Edit `.env.local` and add your API keys:

```env
OPENAI_API_KEY=sk-proj-your-key-here
# OR
ANTHROPIC_API_KEY=sk-ant-api-your-key-here
```

Get API keys:
- **OpenAI**: https://platform.openai.com/api-keys (Recommended - supports all features)
- **Anthropic**: https://console.anthropic.com/

### 2. Restart Dev Server

After adding API keys:

```bash
# Stop current server (Ctrl+C)
rm -rf .next
npm run dev
```

---

## Testing Methods

### Option 1: Using cURL (Command Line)

Test each API endpoint directly with cURL commands:

#### Test 1: Note Summarizer

```bash
curl -X POST http://localhost:3000/api/ai/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Photosynthesis",
    "content": "Photosynthesis is the process by which plants use sunlight, water and carbon dioxide to create oxygen and energy in the form of sugar. During photosynthesis, plants take in carbon dioxide (CO2) and water (H2O) from the air and soil. Within the plant cell, the water is oxidized, meaning it loses electrons, while the carbon dioxide is reduced, meaning it gains electrons. This transforms the water into oxygen and the carbon dioxide into glucose. The plant then releases the oxygen back into the air, and stores energy within the glucose molecules.",
    "maxLength": "medium"
  }'
```

Expected Response:
```json
{
  "summary": "Photosynthesis is the process plants use to convert sunlight, water, and CO2 into oxygen and glucose...",
  "keyPoints": [
    "Plants convert sunlight, water, and CO2 into oxygen and sugar",
    "Water is oxidized and CO2 is reduced during the process",
    "Oxygen is released while glucose stores energy"
  ],
  "topics": ["Photosynthesis", "Plant Biology", "Energy Production"],
  "wordCount": 89
}
```

#### Test 2: Mindmap Generator

```bash
curl -X POST http://localhost:3000/api/ai/mindmap \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Solar System",
    "content": "The Solar System consists of the Sun and everything that orbits it. There are eight planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. The inner planets (Mercury, Venus, Earth, Mars) are rocky. The outer planets (Jupiter, Saturn, Uranus, Neptune) are gas giants. Between Mars and Jupiter is the asteroid belt."
  }'
```

#### Test 3: Quiz Maker (Flashcards)

```bash
curl -X POST http://localhost:3000/api/ai/quiz \
  -H "Content-Type: application/json" \
  -d '{
    "title": "World War II",
    "content": "World War II was a global war that lasted from 1939 to 1945. It involved most of the world'\''s nations, including all the great powers, forming two opposing military alliances: the Allies and the Axis. It was the deadliest conflict in history, with an estimated 70-85 million deaths. Key events include the invasion of Poland, Pearl Harbor, D-Day, and the atomic bombings of Hiroshima and Nagasaki.",
    "count": 5,
    "type": "flashcard"
  }'
```

#### Test 4: Study Assistant (Initialize)

```bash
curl -X POST http://localhost:3000/api/ai/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "action": "initialize",
    "sessionId": "test-session-123",
    "notes": [
      {
        "id": "note1",
        "title": "Newton'\''s Laws",
        "content": "First Law: An object at rest stays at rest. Second Law: F=ma. Third Law: For every action there is an equal and opposite reaction.",
        "tags": ["physics"]
      },
      {
        "id": "note2",
        "title": "Photosynthesis",
        "content": "Plants convert sunlight into energy through photosynthesis, using CO2 and water to produce glucose and oxygen.",
        "tags": ["biology"]
      }
    ]
  }'
```

#### Test 5: Study Assistant (Ask Question)

```bash
curl -X POST http://localhost:3000/api/ai/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "action": "ask",
    "sessionId": "test-session-123",
    "question": "What is Newton'\''s second law?",
    "conversationHistory": []
  }'
```

#### Test 6: Voice Transcription

```bash
# First, you need an audio file (recording.webm or recording.mp3)
curl -X POST http://localhost:3000/api/ai/transcribe \
  -F "audio=@/path/to/your/recording.webm" \
  -F "withSummary=true"
```

---

### Option 2: Using Postman/Insomnia

1. Import the endpoints into Postman or Insomnia
2. Set `Content-Type: application/json` header
3. Use the JSON bodies from the cURL examples above

---

### Option 3: Browser Console (Fetch API)

Open your browser console at `http://localhost:3000` and run:

#### Test Summarizer:

```javascript
fetch('/api/ai/summarize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Photosynthesis',
    content: 'Photosynthesis is the process by which plants use sunlight, water and carbon dioxide to create oxygen and energy in the form of sugar.',
    maxLength: 'medium'
  })
})
  .then(res => res.json())
  .then(data => console.log('Summary:', data))
  .catch(err => console.error('Error:', err));
```

#### Test Mindmap:

```javascript
fetch('/api/ai/mindmap', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Solar System',
    content: 'The Solar System consists of the Sun and eight planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune.'
  })
})
  .then(res => res.json())
  .then(data => console.log('Mindmap:', data))
  .catch(err => console.error('Error:', err));
```

#### Test Quiz:

```javascript
fetch('/api/ai/quiz', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'World War II',
    content: 'World War II lasted from 1939 to 1945. Key events include Pearl Harbor, D-Day, and atomic bombings.',
    count: 5,
    type: 'flashcard'
  })
})
  .then(res => res.json())
  .then(data => console.log('Quiz:', data))
  .catch(err => console.error('Error:', err));
```

---

## Common Errors & Solutions

### Error: "OPENAI_API_KEY is not configured"

**Solution**:
1. Create/edit `.env.local` file in project root
2. Add: `OPENAI_API_KEY=sk-proj-your-actual-key`
3. Restart dev server: `rm -rf .next && npm run dev`

### Error: "Module not found: Can't resolve '@langchain/core'"

**Solution**:
```bash
npm install @langchain/core --legacy-peer-deps
```

### Error: 401 Unauthorized from OpenAI

**Solution**: Your API key is invalid or expired. Generate a new one at https://platform.openai.com/api-keys

### Error: Rate limit exceeded

**Solution**: You've hit OpenAI's rate limit. Wait a minute or upgrade your plan.

### Error: "Assistant not initialized"

**Solution**: For Study Assistant, you must call `initialize` action first before `ask`.

---

## Verifying Setup

### Quick Health Check

Run this in browser console:

```javascript
fetch('/api/ai/summarize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Test',
    content: 'This is a test.',
    maxLength: 'short'
  })
})
  .then(res => res.json())
  .then(data => {
    if (data.summary) {
      console.log('✅ AI Features Working!', data);
    } else {
      console.error('❌ Error:', data);
    }
  });
```

---

## Cost Estimates (OpenAI)

Approximate costs per request:

- **Summarizer**: ~$0.001 - $0.002 per note
- **Mindmap**: ~$0.003 - $0.005 per note
- **Quiz (10 flashcards)**: ~$0.002 - $0.003
- **Study Assistant**: ~$0.002 - $0.004 per question
- **Transcription**: ~$0.006 per minute of audio

**Tip**: Use GPT-4o-mini for testing (cheaper). Edit [`src/lib/ai/config.ts`](src/lib/ai/config.ts) to change models.

---

## Next Steps

Once testing is complete, you can:

1. **Add API keys** to your production environment variables
2. **Build UI components** to integrate AI features into the app
3. **Add rate limiting** to prevent API abuse
4. **Implement caching** to reduce costs
5. **Add user feedback** for AI quality improvement

---

## Need Help?

- Check server logs for detailed error messages
- Verify API keys are correctly formatted (start with `sk-`)
- Ensure dev server restarted after adding `.env.local`
- Check OpenAI API status: https://status.openai.com/
