# AI Chat Feature - Implementation Guide

## Overview

The AI Chat feature provides an intelligent conversational interface for students to interact with their notes. It uses the Study Assistant Service to answer questions, provide explanations, and help students understand their study materials.

## Features Implemented

### 1. **Chat Interface** (`/chat`)
- Full-screen chat page with modern, clean UI
- Real-time message streaming
- Markdown support for formatted responses
- Auto-scrolling to latest messages
- Loading indicators and error handling

### 2. **Components**

#### ChatInterface (`src/components/chat/ChatInterface.tsx`)
- Main chat container component
- Manages message state and API communication
- Displays welcome screen when no messages
- Handles note context for AI responses
- Error alerts and loading states

#### MessageBubble (`src/components/chat/MessageBubble.tsx`)
- Individual message display component
- Supports user, assistant, and system messages
- Markdown rendering with syntax highlighting
- Smooth animations using Framer Motion
- Timestamp display

#### ChatInput (`src/components/chat/ChatInput.tsx`)
- Auto-resizing textarea for message input
- Send button with loading state
- Keyboard shortcuts (Enter to send, Shift+Enter for newline)
- Visual feedback and disabled states

### 3. **API Route** (`src/app/api/ai/chat/route.ts`)
- Edge runtime for fast responses
- Integrates with StudyAssistantService
- Accepts message, conversation history, and notes context
- Returns formatted AI responses
- Comprehensive error handling

### 4. **State Management** (`src/lib/store/useChatStore.ts`)
- Zustand store for chat state
- Conversation management (create, delete, update)
- Message persistence with localStorage
- Support for multiple conversations
- Note-to-conversation mapping

### 5. **Navigation Integration**
- Added "AI Chat" button to sidebar
- Gradient styling matching app theme
- MessageSquare icon for visual clarity
- Direct navigation to `/chat` route

## Usage

### For Users

1. **Starting a Chat**
   - Click "AI Chat" in the sidebar
   - The chat will automatically load all your notes
   - Start asking questions about your study materials

2. **Asking Questions**
   - Type your question in the input field
   - Press Enter to send (or click the send button)
   - The AI will search relevant notes and provide answers
   - Continue the conversation naturally

3. **No Notes Available**
   - If you have no notes, you'll see a helpful message
   - Click "Create Your First Note" to get started

### For Developers

#### API Usage

```typescript
// POST /api/ai/chat
{
  "message": "Explain Newton's First Law",
  "conversationHistory": [
    {
      "role": "user",
      "content": "What is inertia?",
      "timestamp": "2025-01-16T10:00:00Z"
    },
    {
      "role": "assistant",
      "content": "Inertia is...",
      "timestamp": "2025-01-16T10:00:01Z"
    }
  ],
  "notes": [
    {
      "id": "note-123",
      "title": "Physics - Laws of Motion",
      "content": "Newton's First Law states...",
      "tags": ["physics", "mechanics"]
    }
  ]
}
```

Response:
```json
{
  "message": "Newton's First Law, also known as the law of inertia...",
  "timestamp": "2025-01-16T10:00:05Z"
}
```

#### Using the Chat Store

```typescript
import { useChatStore } from '@/lib/store/useChatStore';

function MyComponent() {
  const {
    conversations,
    createConversation,
    addMessage,
    getCurrentConversation
  } = useChatStore();

  // Create a new conversation
  const convId = createConversation(['note-1', 'note-2']);

  // Add a message
  addMessage(convId, {
    role: 'user',
    content: 'Hello',
    timestamp: new Date()
  });

  // Get current conversation
  const current = getCurrentConversation();
}
```

## Architecture

### Data Flow

```
User Input → ChatInput → ChatInterface
                            ↓
                    API Call (/api/ai/chat)
                            ↓
                  StudyAssistantService
                            ↓
                    OpenRouter API (DeepSeek R1)
                            ↓
                    Response Processing
                            ↓
                MessageBubble (Display)
```

### State Management

```
useChatStore (Zustand)
    ↓
LocalStorage Persistence
    ↓
Conversations & Messages
```

## Customization

### Styling

The chat interface uses the app's color scheme:
- **Primary Blue**: `#63cdff` - User messages, accents
- **Primary Green**: `#8ef292` - AI assistant, success states
- **Background Cream**: `#f8f8f8` - Page background
- **Text Black**: `#121421` - Primary text

### AI Configuration

Edit `src/lib/ai/config.ts` to customize:
- Model selection (currently using DeepSeek R1 free)
- Temperature settings
- Max tokens
- Response parameters

### Search Algorithm

The keyword-based search in `StudyAssistantService` can be enhanced:
- Replace with vector embeddings for semantic search
- Add fuzzy matching
- Implement relevance scoring
- Use external search libraries (MiniSearch, etc.)

## Known Limitations

1. **Search Quality**: Currently uses simple keyword matching
   - **Solution**: Integrate vector embeddings with services like Pinecone or Supabase Vector

2. **Context Window**: Limited by model's token limit
   - **Solution**: Implement conversation summarization or chunking

3. **No Streaming**: Responses wait for complete generation
   - **Solution**: Implement streaming responses using SSE or WebSockets

4. **Single Conversation**: No conversation history management in UI
   - **Solution**: Add conversation list sidebar with history

## Future Enhancements

### Phase 1 (Near-term)
- [ ] Conversation history sidebar
- [ ] Delete/rename conversations
- [ ] Copy message to clipboard
- [ ] Regenerate response option

### Phase 2 (Mid-term)
- [ ] Streaming responses with SSE
- [ ] Code syntax highlighting in responses
- [ ] Image support in messages
- [ ] Voice input integration

### Phase 3 (Advanced)
- [ ] Multi-note context selection
- [ ] Export conversations as notes
- [ ] Share conversations with study groups
- [ ] AI-suggested follow-up questions
- [ ] Integration with flashcards/quizzes

## Testing

### Manual Testing Checklist

- [ ] Navigate to `/chat` page
- [ ] Verify notes are loaded (check counter)
- [ ] Send a test message
- [ ] Verify AI response appears
- [ ] Test markdown rendering (code blocks, lists, etc.)
- [ ] Test error handling (disconnect network)
- [ ] Verify mobile responsiveness
- [ ] Check dark mode support
- [ ] Test keyboard shortcuts
- [ ] Verify message persistence (refresh page)

### Test Commands

```bash
# Build check
npm run build

# Run development server
npm run dev

# Check TypeScript errors
npx tsc --noEmit

# Lint check
npm run lint
```

## Deployment Notes

### Environment Variables Required

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
NEXT_PUBLIC_APP_URL=https://your-app-url.com
```

### Edge Runtime

The chat API uses Edge Runtime for:
- Faster cold starts
- Lower latency
- Global distribution
- Cost efficiency

### Performance Optimization

- Messages are paginated automatically by browser
- LocalStorage is used for persistence
- API responses are cached by browser
- Components use React.memo where appropriate

## Troubleshooting

### Common Issues

**Q: Chat page shows "No notes available"**
- A: Create at least one note in the main app first

**Q: AI responses are slow**
- A: Check your OpenRouter API key and rate limits
- Consider upgrading to a paid model

**Q: Markdown not rendering properly**
- A: Ensure `react-markdown` and `remark-gfm` are installed

**Q: Messages not persisting**
- A: Check browser's localStorage is enabled
- Clear cache and try again

**Q: Build fails with type errors**
- A: Run `npm install` to ensure all dependencies are installed
- Check TypeScript version compatibility

## Support

For issues or questions:
1. Check this documentation
2. Review the source code comments
3. Check the browser console for errors
4. Verify environment variables are set correctly

## Credits

- **AI Provider**: OpenRouter (DeepSeek R1 free model)
- **UI Framework**: Next.js 15 + TailwindCSS
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Markdown**: react-markdown + remark-gfm
- **Icons**: Lucide React
