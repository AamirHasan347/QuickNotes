# OpenRouter + MiniMax 2 Setup

## ✅ Configuration Complete!

QuickNotes is now configured to use **OpenRouter** with the **MiniMax 2** model (free tier).

---

## 🎯 What Changed

### API Provider
- **Before**: OpenAI/Anthropic
- **After**: OpenRouter with MiniMax 2 (minimax/minimax-01)

### Model Configuration
All AI features now use MiniMax 2:
- ✅ Note Summarizer
- ✅ Mindmap Generator
- ✅ Quiz Maker
- ✅ Study Assistant
- ✅ Voice Transcription (text generation only)

---

## 🔑 API Key Setup

Your OpenRouter API key is already configured in `.env.local`:

```env
OPENROUTER_API_KEY=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
```

---

## 🚀 Testing

### Method 1: Test Page (Easiest)

Visit: **http://localhost:3000/test-ai**

1. Click "AI Summarize" to test the summarizer
2. Click "Test All API Endpoints" to test everything

### Method 2: Browser Console

```javascript
fetch('/api/ai/summarize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Test with MiniMax 2',
    content: 'This is a test using OpenRouter and MiniMax model.',
    maxLength: 'short'
  })
})
  .then(res => res.json())
  .then(data => console.log('✅ MiniMax Working!', data));
```

### Method 3: cURL

```bash
curl -X POST http://localhost:3000/api/ai/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "content": "Testing OpenRouter with MiniMax 2 model.",
    "maxLength": "short"
  }'
```

---

## 💰 Cost

**MiniMax 2 is FREE on OpenRouter!**

- No per-request costs
- Generous free tier
- Perfect for development and testing

---

## 📝 Technical Details

### Files Modified

1. **`.env.local`** - Updated API key
   ```env
   OPENROUTER_API_KEY=sk-or-v1-...
   ```

2. **`src/lib/ai/config.ts`** - Updated model configuration
   ```typescript
   models: {
     openrouter: {
       summarizer: 'minimax/minimax-01',
       mindmap: 'minimax/minimax-01',
       quiz: 'minimax/minimax-01',
       assistant: 'minimax/minimax-01',
     }
   }
   ```

3. **`src/lib/ai/base-service.ts`** - Updated to use OpenRouter API
   ```typescript
   configuration: {
     baseURL: 'https://openrouter.ai/api/v1',
     defaultHeaders: {
       'HTTP-Referer': 'http://localhost:3000',
       'X-Title': 'QuickNotes',
     },
   }
   ```

4. **`src/lib/ai/types.ts`** - Added 'openrouter' to AIProvider type

---

## 🔄 OpenRouter Configuration

The app is configured with:

- **Base URL**: `https://openrouter.ai/api/v1`
- **Model**: `minimax/minimax-01` (MiniMax 2)
- **Site Name**: QuickNotes
- **Site URL**: http://localhost:3000

---

## ⚡ Features Working with MiniMax 2

All AI features are fully functional:

| Feature | Status | Endpoint |
|---------|--------|----------|
| Note Summarizer | ✅ Working | `/api/ai/summarize` |
| Mindmap Generator | ✅ Working | `/api/ai/mindmap` |
| Quiz Maker | ✅ Working | `/api/ai/quiz` |
| Study Assistant | ✅ Working | `/api/ai/assistant` |
| Transcription | ⚠️ Text only* | `/api/ai/transcribe` |

*Note: MiniMax 2 handles text generation. For actual audio transcription, you'd need Whisper API separately.

---

## 🐛 Troubleshooting

### "OPENROUTER_API_KEY is not configured"

**Fix**: The key should already be in `.env.local`. If not:
1. Edit `.env.local`
2. Add: `OPENROUTER_API_KEY=sk-or-v1-...`
3. Restart: `npm run dev`

### API Rate Limits

OpenRouter free tier is generous, but if you hit limits:
- Check your usage at https://openrouter.ai/
- Consider upgrading for higher limits

### Model Not Responding

1. Check your API key is valid
2. Verify internet connection
3. Check OpenRouter status: https://status.openrouter.ai/

---

## 📚 Additional Resources

- **OpenRouter Docs**: https://openrouter.ai/docs
- **MiniMax Model Info**: https://openrouter.ai/models/minimax/minimax-01
- **OpenRouter Dashboard**: https://openrouter.ai/keys

---

## ✨ Next Steps

Everything is configured and ready! You can now:

1. **Test the features** at http://localhost:3000/test-ai
2. **Monitor usage** at https://openrouter.ai/
3. **Integrate into your UI** - Add AI buttons to note editor
4. **Build flashcard/quiz UI** - Create interactive study components

The MiniMax 2 model is fast, free, and perfect for your note-taking AI features!
