# AI Integration Guide - QuickNotes

## ✅ Current Status

**API Layer**: ✅ Complete and Working
- All AI endpoints functional with OpenRouter + MiniMax 2 (FREE)
- JSON parsing fixed for all responses
- Summarizer, Mindmap, Quiz, Assistant, Transcription all operational

**UI Components**: ✅ Created
- `FloatingAIToolbar` - Beautiful floating toolbar on text selection
- `AIInlineSuggestion` - Inline suggestions with accept/reject
- `AIPassiveHint` - Gentle passive suggestions

**Hooks**: ✅ Created
- `useTextSelection` - Detects text selection and position
- `useAIActions` - Processes AI actions (Improve, Summarize, Expand, Translate)

---

## 🎨 Design Philosophy

The AI integration follows these principles:
1. **Minimal & Non-intrusive** - AI appears only when needed
2. **Smooth Animations** - Framer Motion for buttery transitions
3. **Contextual** - Appears near user's focus area
4. **Inline Experience** - No popups or separate windows

---

## 🧩 Components Overview

### 1. FloatingAIToolbar

**Purpose**: Shows AI actions when text is selected

**Features**:
- Appears above selected text
- 4 actions: Improve, Summarize, Expand, Translate
- Smooth fade-in/out animations
- Auto-positions to avoid screen edges
- Closes on click outside

**Usage**:
```tsx
<FloatingAIToolbar
  isVisible={!!selectedText}
  position={selectionPosition}
  on Action={(action) => processAction(action, selectedText)}
  onClose={clearSelection}
/>
```

### 2. AIInlineSuggestion

**Purpose**: Displays AI-generated suggestions inline

**Features**:
- Loading shimmer while processing
- AI glow effect around suggestion
- Accept/Reject buttons
- Expandable for long content
- Smooth height transitions

**Usage**:
```tsx
<AIInlineSuggestion
  suggestion={aiSuggestion}
  isLoading={isProcessing}
  onAccept={() => insertSuggestion()}
  onReject={() => clearSuggestion()}
/>
```

### 3. AIPassiveHint

**Purpose**: Gentle suggestions for long paragraphs

**Features**:
- Subtle italic hint below long text
- Yes/Dismiss buttons
- Fade in/out animations
- Non-intrusive colors (purple tint)

**Usage**:
```tsx
<AIPassiveHint
  isVisible={showHint}
  message="💡 Would you like me to summarize this section?"
  type="summarize"
  onAccept={() => handleSummarize()}
  onDismiss={() => setShowHint(false)}
/>
```

---

## 🎣 Hooks Overview

### useTextSelection

**Purpose**: Track text selection in editor

**Returns**:
```typescript
{
  selectedText: string;
  selectionPosition: { x: number; y: number } | null;
  clearSelection: () => void;
}
```

**Example**:
```tsx
const { selectedText, selectionPosition, clearSelection } = useTextSelection(editorRef);
```

### useAIActions

**Purpose**: Process AI actions

**Returns**:
```typescript
{
  isProcessing: boolean;
  currentSuggestion: string | null;
  error: string | null;
  processAction: (action: AIAction, text: string) => Promise<void>;
  clearSuggestion: () => void;
}
```

**Example**:
```tsx
const { isProcessing, currentSuggestion, processAction, clearSuggestion } = useAIActions();

// Process action
await processAction('improve', selectedText);
```

---

## 📝 Next Steps to Complete Integration

### 1. Integrate into NoteEditor

Update `src/components/editor/NoteEditor.tsx`:

```tsx
import { useRef } from 'react';
import { useTextSelection } from '@/hooks/useTextSelection';
import { useAIActions } from '@/hooks/useAIActions';
import { FloatingAIToolbar } from '@/components/ai/FloatingAIToolbar';
import { AIInlineSuggestion } from '@/components/ai/AIInlineSuggestion';

export function NoteEditor({ note, isOpen, onClose }: NoteEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // AI hooks
  const { selectedText, selectionPosition, clearSelection } = useTextSelection(editorRef);
  const { isProcessing, currentSuggestion, processAction, clearSuggestion } = useAIActions();

  const handleAIAction = async (action: AIAction) => {
    await processAction(action, selectedText);
    clearSelection();
  };

  const handleAcceptSuggestion = () => {
    // Insert suggestion into editor
    // Implementation depends on your editor setup
    clearSuggestion();
  };

  return (
    <div ref={editorRef}>
      {/* Your existing editor */}
      <textarea value={content} onChange={...} />

      {/* AI Components */}
      <FloatingAIToolbar
        isVisible={!!selectedText && !isProcessing}
        position={selectionPosition || { x: 0, y: 0 }}
        onAction={handleAIAction}
        onClose={clearSelection}
      />

      {currentSuggestion && (
        <AIInlineSuggestion
          suggestion={currentSuggestion}
          isLoading={false}
          onAccept={handleAcceptSuggestion}
          onReject={clearSuggestion}
        />
      )}

      {isProcessing && (
        <AIInlineSuggestion
          suggestion=""
          isLoading={true}
          onAccept={() => {}}
          onReject={() => {}}
        />
      )}
    </div>
  );
}
```

### 2. Add Passive Hints

Detect long paragraphs and show hints:

```tsx
useEffect(() => {
  const paragraphs = content.split('\n\n');
  const longParagraph = paragraphs.find(p => p.split(' ').length > 100);

  if (longParagraph && !hasShownHint) {
    setTimeout(() => setShowPassiveHint(true), 3000); // Show after 3s
  }
}, [content]);
```

### 3. Add /command System

Implement slash commands:

```tsx
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === '/' && content.endsWith('\n')) {
    // Show command palette
    setShowCommands(true);
  }
};

// Commands
const commands = [
  { trigger: '/summarize', action: () => summarizeNote() },
  { trigger: '/expand', action: () => expandNote() },
  { trigger: '/improve', action: () => improveNote() },
  { trigger: '/translate', action: () => translateNote() },
];
```

---

## 🎨 Animation Details

All animations use Framer Motion with these configs:

**Fade In/Out**:
```tsx
initial={{ opacity: 0, y: 8, scale: 0.95 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
exit={{ opacity: 0, y: 8, scale: 0.95 }}
transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
```

**Staggered Fade**:
```tsx
{actions.map((action, index) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05 }}
  />
))}
```

**Shimmer Loading**:
```tsx
<div className="animate-pulse bg-gray-200 rounded" />
```

---

## 💡 Tips

1. **Positioning**: The toolbar auto-adjusts if near screen edges
2. **Performance**: Text selection uses native browser APIs (fast)
3. **Mobile**: Consider touch events for mobile selection
4. **Accessibility**: All components have proper ARIA labels

---

## 🐛 Known Limitations

1. **Selection in contentEditable**: May need adjustments for rich text editors
2. **Multi-line selection**: Toolbar positions at selection center
3. **PDF/Images**: Currently only works with text content

---

## 🚀 Future Enhancements

- [ ] AI History sidebar (optional, collapsible)
- [ ] Custom AI prompts
- [ ] Multi-language translation
- [ ] Voice-to-text with AI enhancement
- [ ] Smart auto-completion
- [ ] Context-aware suggestions based on note history

---

**Status**: ✅ Core components ready for integration
**Next**: Integrate into NoteEditor and test end-to-end flow
