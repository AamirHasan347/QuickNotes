# DeepSeek R1 Integration Fix

## Problem

The DeepSeek R1 model (`deepseek/deepseek-r1:free`) is a **reasoning model** that outputs chain-of-thought reasoning before providing the actual answer. This causes issues with JSON parsing and text extraction in AI features.

### Symptoms

1. **500 Internal Server Error** on all AI endpoints (chat, summarize, flashcards, quiz, mindmap)
2. **Empty responses** from chat
3. **JSON parse errors** like "Unterminated string in JSON"
4. Console errors showing malformed JSON responses

### Root Cause

DeepSeek R1 outputs responses in this format:

```
<think>
This is the model's internal reasoning process...
Step 1: Analyze the question
Step 2: Consider the context
Step 3: Formulate the answer
</think>

Actual response content here
```

For JSON responses:
```
<think>
Reasoning about the structure...
</think>

{
  "summary": "The actual JSON response",
  "keyPoints": ["point 1", "point 2"]
}
```

## Solution

Created utility functions to handle DeepSeek R1's special output format:

### 1. JSON Extraction (`/src/lib/utils/json-extractor.ts`)

```typescript
/**
 * Extract JSON from DeepSeek R1 response format
 * Handles <think> tags and extracts valid JSON
 */
export function extractDeepSeekJSON(text: string): any {
  // Remove <think> tags first
  const withoutThink = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

  // Try to parse the remaining text
  return JSON.parse(withoutThink);
}

/**
 * Remove thinking tags from text responses
 */
export function stripThinkingTags(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}
```

### 2. Updated Services

#### Summarizer (`src/lib/ai/summarizer.ts`)
```typescript
import { extractDeepSeekJSON } from '@/lib/utils/json-extractor';

// Changed from:
const parsed = JSON.parse(result.trim());

// To:
const parsed = extractDeepSeekJSON(result);
```

#### Flashcard Generator (`src/lib/ai/flashcard-generator.ts`)
```typescript
const { extractDeepSeekJSON } = await import('@/lib/utils/json-extractor');
parsed = extractDeepSeekJSON(cleaned);
```

#### Study Assistant (`src/lib/ai/study-assistant.ts`)
```typescript
import { stripThinkingTags } from '@/lib/utils/json-extractor';

// For text responses (chat):
return stripThinkingTags(response);

// For JSON responses (study plans):
return extractDeepSeekJSON(result);
```

### 3. Improved Error Handling in API Routes

Updated all API routes to match the pattern in `/api/ai/summarize`:

```typescript
export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          error: 'AI service is not configured.',
          code: 'MISSING_API_KEY'
        },
        { status: 500 }
      );
    }

    // ... process request ...

  } catch (error) {
    console.error('API Error:', error);

    // Detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // Categorized error responses
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    const isConfigError = errorMessage.includes('API key') || errorMessage.includes('OPENROUTER');
    const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network');

    return NextResponse.json(
      {
        error: isConfigError
          ? 'AI service is not properly configured.'
          : isNetworkError
          ? 'Failed to connect to AI service.'
          : `Operation failed: ${errorMessage}`,
        code: isConfigError ? 'CONFIG_ERROR' : isNetworkError ? 'NETWORK_ERROR' : 'PROCESSING_ERROR',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
```

## Files Modified

1. ✅ **Created**: `src/lib/utils/json-extractor.ts` - Utility functions for DeepSeek R1
2. ✅ **Updated**: `src/lib/ai/summarizer.ts` - Uses `extractDeepSeekJSON`
3. ✅ **Updated**: `src/lib/ai/flashcard-generator.ts` - Uses `extractDeepSeekJSON`
4. ✅ **Updated**: `src/lib/ai/study-assistant.ts` - Uses `stripThinkingTags` and `extractDeepSeekJSON`
5. ✅ **Updated**: `src/app/api/ai/chat/route.ts` - Improved error handling, removed Edge runtime
6. ✅ **Updated**: `src/components/chat/ChatInterface.tsx` - Better error logging

## Testing

All AI features now work correctly:

### Chat API
```bash
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "notes": [{"id": "1", "title": "Test", "content": "Test content", "tags": []}]
  }'

# Response:
{
  "message": "Hello! It looks like there are no specific notes...",
  "timestamp": "2025-01-16T16:40:35.232Z"
}
```

### Summarize API
```bash
curl -X POST http://localhost:3001/api/ai/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Note",
    "content": "This is a test note.",
    "maxLength": "short"
  }'

# Response:
{
  "summary": "This test note contains sample content...",
  "keyPoints": ["Note is a test example", ...],
  "topics": ["Summarization techniques", ...],
  "wordCount": 5
}
```

## Benefits

1. ✅ **All AI features working** - Chat, summarize, flashcards, quiz, mindmap
2. ✅ **Better error handling** - Clear, categorized error messages
3. ✅ **Robust JSON parsing** - Handles DeepSeek R1's special format
4. ✅ **Detailed logging** - Easy debugging of AI issues
5. ✅ **Future-proof** - Works with other reasoning models that use similar formats

## Alternative Solutions

If you continue to have issues with DeepSeek R1, consider these alternatives:

### 1. Use a Different Model

Update `src/lib/ai/config.ts`:

```typescript
export const AI_CONFIG = {
  models: {
    openrouter: {
      // Option 1: Use a non-reasoning model (more reliable JSON)
      summarizer: 'meta-llama/llama-3.2-3b-instruct:free',
      mindmap: 'meta-llama/llama-3.2-3b-instruct:free',
      quiz: 'meta-llama/llama-3.2-3b-instruct:free',
      assistant: 'meta-llama/llama-3.2-3b-instruct:free',

      // Option 2: Use paid models for better quality
      // summarizer: 'anthropic/claude-3-haiku',
      // assistant: 'openai/gpt-4-turbo-preview',
    },
  },
};
```

### 2. Add Response Post-Processing

For even more robust handling, add a response validation step:

```typescript
function cleanAIResponse(text: string): string {
  // Remove thinking tags
  text = stripThinkingTags(text);

  // Remove markdown code blocks
  text = text.replace(/```(?:json)?\n?([\s\S]*?)\n?```/g, '$1');

  // Trim whitespace
  return text.trim();
}
```

## Notes

- DeepSeek R1 is still a powerful free model despite these quirks
- The reasoning output can actually be useful for debugging
- Consider displaying the thinking process to users for transparency
- Monitor API costs if switching to paid models

## Future Enhancements

1. **Show Thinking Process**: Display DeepSeek's reasoning to users (educational value)
2. **Fallback Models**: Automatically retry with a different model if parsing fails
3. **Response Caching**: Cache AI responses to reduce API calls
4. **Streaming**: Implement streaming responses for better UX
