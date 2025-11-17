# 🐛 Debugging Guide - AI Features

## Added Comprehensive Logging

I've added detailed console logging throughout the entire AI pipeline to help identify where the 500 error is occurring.

### 🎯 Logging Flow

When you make a request to the chat API, you'll now see detailed logs in this order:

```
1. 🚀 [CHAT API] Request started
   ├─ 📋 Step 1: Validating API key
   ├─ 📋 Step 2: Parsing request body
   ├─ 📋 Step 3: Validating message
   ├─ 📋 Step 4: Initializing StudyAssistantService
   ├─ 📋 Step 5: Initializing with notes
   └─ 📋 Step 6: Calling assistant.ask()
       │
       ├─ 🤖 [STUDY ASSISTANT] ask() called
       ├─ 🔍 Validating config
       ├─ 🔍 Checking notes
       ├─ 🔧 Getting LLM instance
       │   │
       │   ├─ 🔧 [BASE SERVICE] getLLM() called
       │   ├─ 🔑 Checking API key
       │   ├─ 🏗️ Creating ChatOpenAI instance
       │   └─ ✅ ChatOpenAI instance created
       │
       ├─ 🔍 Finding relevant notes
       ├─ 📝 Formatting context
       ├─ 📝 Formatting history
       ├─ 🔨 Creating prompt template
       ├─ ⛓️ Creating chain
       ├─ 🚀 Invoking chain (calling AI)
       ├─ ⏱️ This may take 10-30 seconds...
       ├─ ✅ Chain invoked successfully
       ├─ 📏 Raw response length
       ├─ 🧹 Stripping thinking tags
       │   │
       │   ├─ 🧹 [JSON EXTRACTOR] stripThinkingTags() called
       │   ├─ 📏 Input length
       │   ├─ 🔍 Has <think> tags
       │   ├─ 📏 Output length
       │   └─ ✅ stripThinkingTags() completed
       │
       └─ ✅ ask() completed successfully

   └─ 📋 Step 7: Sending response
       └─ ✅ Request completed successfully
```

### 🔥 Error Logging

If an error occurs, you'll see detailed error information:

```
💥 [COMPONENT] ==================== ERROR ====================
❌ Error caught in [location]
🔍 Error type: [type]
🔍 Error constructor: [name]
📛 Error name: [error.name]
📛 Error message: [error.message]
📛 Error stack: [full stack trace]
🏷️ Error category: [CONFIG/NETWORK/PROCESSING]
💥 ==========================================
```

## 🚀 How to Use for Debugging

### 1. Start Your Dev Server

```bash
npm run dev
```

### 2. Open Browser DevTools Console

- Open your app in the browser
- Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
- Go to "Console" tab

### 3. Also Monitor Terminal/Server Logs

The server console will show detailed logs. Watch BOTH:
- **Browser Console** - Frontend errors
- **Terminal Console** - Backend/API errors

### 4. Try Using the Chat Feature

Navigate to `/chat` and send a message. Watch the logs carefully.

## 🔍 What to Look For

### Case 1: Error Before AI Call

If you see logs stop before "🚀 Invoking chain", the issue is likely:

- ❌ API key not configured
- ❌ Notes not loading
- ❌ Service initialization failure

**Check:**
```bash
# Verify .env.local exists and has the key
cat .env.local | grep OPENROUTER_API_KEY
```

### Case 2: Error During AI Call

If you see "🚀 Invoking chain" but no "✅ Chain invoked successfully":

- ❌ Network issue connecting to OpenRouter
- ❌ API key invalid or rate limited
- ❌ Model not available

**Check:**
```bash
# Test OpenRouter API directly
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

### Case 3: Error After AI Call

If you see "✅ Chain invoked successfully" but still get a 500 error:

- ❌ Response parsing failure
- ❌ Thinking tags not being stripped correctly
- ❌ Empty response from AI

**Look for:**
- Raw response length = 0
- Cleaned response length = 0
- JSON parsing errors

### Case 4: Silent Failure

If logs stop suddenly without error:

- ❌ Unhandled promise rejection
- ❌ Timeout (AI took too long)
- ❌ Memory issue

**Check:**
- Browser Network tab for timeout
- Server memory usage
- Look for uncaught errors in console

## 📊 Log Symbols Guide

| Symbol | Meaning |
|--------|---------|
| 🚀 | Process starting |
| ✅ | Success/Completed |
| ❌ | Error/Failed |
| 📋 | Step/Stage |
| 🔍 | Checking/Validating |
| 🔧 | Creating/Building |
| 📝 | Processing data |
| 📏 | Size/Length info |
| 🔑 | API key related |
| 🤖 | AI/Model related |
| 💥 | Critical error |
| ⚠️ | Warning |
| 📦 | Data/Payload |
| 🌐 | Network/URL |
| 🧹 | Cleaning/Parsing |

## 🛠️ Common Issues & Solutions

### Issue 1: "OPENROUTER_API_KEY is not configured"

**Logs show:**
```
❌ [CHAT API] OPENROUTER_API_KEY is not configured
```

**Solution:**
```bash
# Check if .env.local exists
ls -la .env.local

# If missing, create it:
echo "OPENROUTER_API_KEY=your-key-here" > .env.local

# Restart dev server
npm run dev
```

### Issue 2: Empty Response

**Logs show:**
```
✅ Chain invoked successfully
📏 Raw response length: 0
```

**Possible causes:**
- Model returned empty response
- DeepSeek R1 output was only thinking tags
- Content filtering removed all content

**Solution:**
Check the raw response in logs. If it's all `<think>` tags, the model didn't provide an actual answer.

### Issue 3: Timeout

**Logs show nothing after:**
```
⏱️ This may take 10-30 seconds...
```

**Solution:**
- DeepSeek R1 can be slow (30+ seconds)
- Increase timeout in ChatInterface.tsx
- Try a faster model

### Issue 4: Network Error

**Logs show:**
```
📛 Error message: fetch failed
```

**Solution:**
```bash
# Check internet connection
ping openrouter.ai

# Check if OpenRouter is accessible
curl https://openrouter.ai/api/v1/models
```

### Issue 5: Rate Limiting

**Logs show:**
```
📛 Error message: Rate limit exceeded
```

**Solution:**
- Free tier has limits (20 requests/minute)
- Wait 60 seconds
- Upgrade to paid tier
- Use a different model

## 📱 Testing Commands

### Test Chat API Directly

```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "notes": [
      {
        "id": "1",
        "title": "Test",
        "content": "Test content",
        "tags": []
      }
    ]
  }'
```

### Monitor Logs in Real-Time

```bash
# In one terminal
npm run dev | grep -E "(🚀|✅|❌|💥)"

# In another terminal
# Use the app and watch logs
```

### Check All AI Endpoints

```bash
# Summarize
curl -X POST http://localhost:3000/api/ai/summarize \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Test content","maxLength":"short"}'

# Chat
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","notes":[]}'
```

## 🎯 Next Steps

1. **Start your dev server** with `npm run dev`
2. **Open your browser console** (F12)
3. **Navigate to** `http://localhost:3000/chat`
4. **Send a test message**
5. **Copy all logs** from both browser and terminal
6. **Share the logs** so we can pinpoint the exact error

## 📋 Log Collection Template

When reporting an issue, provide:

```
### Browser Console Logs
[Paste browser console output here]

### Server/Terminal Logs
[Paste terminal output here]

### Request Details
- Message sent: [your message]
- Number of notes: [count]
- Timestamp: [when error occurred]

### Environment
- Node version: [run: node -v]
- npm version: [run: npm -v]
- OS: [your OS]
```

## 🔒 Security Note

When sharing logs:
- ✅ Logs are safe to share (API key length shown, not actual key)
- ⚠️ Don't share the actual API key value
- ⚠️ Don't share personal note content
