# QuickNotes AI Features - Quick Start Guide

## ✅ Setup Complete!

All AI features have been successfully installed and configured. The app is ready to test!

---

## 🚀 Quick Start (3 Steps)

### Step 1: Add Your API Key

Edit `.env.local` in the project root:

```env
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
```

Get your API key: https://platform.openai.com/api-keys

### Step 2: Restart Dev Server

```bash
rm -rf .next
npm run dev
```

### Step 3: Test the Features

Visit: **http://localhost:3000/test-ai**

This test page lets you:
- Test the AI Summarizer with a sample note
- Run all API endpoints at once
- See real-time results

---

## 🧪 Testing Methods

### Method 1: Use the Test Page (Easiest)

1. Go to http://localhost:3000/test-ai
2. Click "AI Summarize" button
3. Click "Test All API Endpoints" to test everything

### Method 2: Browser Console

Open browser console at http://localhost:3000 and run:

```javascript
fetch('/api/ai/summarize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Test Note',
    content: 'Photosynthesis is how plants convert sunlight into energy.',
    maxLength: 'short'
  })
})
  .then(res => res.json())
  .then(data => console.log('✅ AI Working!', data))
  .catch(err => console.error('❌ Error:', err));
```

### Method 3: cURL (Terminal)

```bash
curl -X POST http://localhost:3000/api/ai/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "content": "Photosynthesis is how plants make energy from sunlight.",
    "maxLength": "short"
  }'
```

---

## 📋 Available AI Features

| Feature | API Endpoint | Description |
|---------|-------------|-------------|
| **Note Summarizer** | `POST /api/ai/summarize` | Summarize notes into key points |
| **Mindmap Generator** | `POST /api/ai/mindmap` | Convert notes into mindmaps |
| **Quiz Maker** | `POST /api/ai/quiz` | Generate flashcards/quizzes |
| **Study Assistant** | `POST /api/ai/assistant` | Q&A with your notes |
| **Voice Transcription** | `POST /api/ai/transcribe` | Convert audio to text |

---

## ❌ Common Errors & Fixes

### "OPENAI_API_KEY is not configured"

**Fix:**
1. Create `.env.local` in project root
2. Add: `OPENAI_API_KEY=sk-proj-your-key`
3. Restart: `rm -rf .next && npm run dev`

### "401 Unauthorized"

**Fix:** Invalid API key. Get a new one from https://platform.openai.com/api-keys

### API key not working

**Fix:** Make sure you restarted the dev server after adding the key!

---

## 📚 Full Documentation

- **[TESTING_AI_FEATURES.md](TESTING_AI_FEATURES.md)** - Detailed testing guide with all examples
- **[AI_FEATURES.md](AI_FEATURES.md)** - Complete API documentation
- **Test Page**: http://localhost:3000/test-ai

---

## 💡 What's Next?

Once testing is complete:

1. **Integrate into your app** - Add AI buttons to the note editor
2. **Add UI components** - Build flashcard viewer, mindmap editor
3. **Configure costs** - Monitor OpenAI usage at https://platform.openai.com/usage
4. **Add rate limiting** - Protect your API in production

---

## 🎯 Example: Test Summarizer Now

1. Make sure dev server is running (`npm run dev`)
2. Open http://localhost:3000/test-ai
3. Click "AI Summarize" button
4. See the magic happen!

---

Need help? Check the full docs in [AI_FEATURES.md](AI_FEATURES.md)
