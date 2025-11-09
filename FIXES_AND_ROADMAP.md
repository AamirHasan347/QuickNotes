# QuickNotes - Fixes & Enhancement Roadmap

## ✅ FIXED: Quiz & Mindmap Generation

### The Problem
When clicking "Generate Mindmap" or "Create Quiz" buttons, the loading animation would start but no result would appear.

### Root Cause
The API routes were returning data directly, but the frontend expected it wrapped in an object:

**Before (Broken):**
```typescript
// API returned:
{ title: "...", flashcards: [...] }

// Frontend expected:
{ quiz: { title: "...", flashcards: [...] } }
```

### The Fix
Updated both API routes to wrap responses correctly:

1. **`src/app/api/ai/quiz/route.ts:36`**
   - Changed: `return NextResponse.json(result);`
   - To: `return NextResponse.json({ quiz: result });`

2. **`src/app/api/ai/mindmap/route.ts:25`**
   - Changed: `return NextResponse.json(mindmap);`
   - To: `return NextResponse.json({ mindmap });`

### Testing
Now when you:
1. Create a note with content
2. Click "Generate Mindmap" or "Create Quiz"
3. Wait 20-40 seconds for AI generation
4. The viewer should appear with your generated content

---

## 📊 Data Model Enhancements

Updated `src/lib/store/types.ts` to support new features:

### New Interfaces Added:

```typescript
// Handwriting/Sketches
export interface Drawing {
  id: string;
  data: string; // Base64 canvas image
  createdAt: Date;
}

// Smart Attachments
export interface Attachment {
  id: string;
  type: 'image' | 'pdf' | 'video' | 'link';
  src: string;
  name?: string;
  meta?: {
    title?: string;
    summary?: string;
    thumbnail?: string;
    favicon?: string;
  };
  createdAt: Date;
}

// Wiki-style Linking
export interface NoteLink {
  targetId: string;
  targetTitle: string;
}

// Content Blocks
export interface ContentBlock {
  id: string;
  type: 'text' | 'heading' | 'image' | 'attachment' | 'code' | 'checklist' | 'drawing';
  content: string;
  collapsed?: boolean;
  order: number;
}
```

### Updated Note Interface:

```typescript
export interface Note {
  // ... existing fields ...
  drawings?: Drawing[];        // NEW: Handwriting data
  attachments?: Attachment[];  // NEW: PDFs, videos, links
  links?: NoteLink[];         // NEW: Note connections
  blocks?: ContentBlock[];    // NEW: Block-based content
  useBlocks?: boolean;        // NEW: Toggle block mode
}
```

---

## 🚀 Enhancement Roadmap

### Priority 1: Core Functionality ✅ READY TO IMPLEMENT

#### 1. Handwriting/Sketch Mode
**Status:** Data models ready, needs UI implementation

**What to build:**
- [ ] Sketch mode toggle button in NoteEditor toolbar
- [ ] Canvas overlay using `react-sketch-canvas`
- [ ] Save canvas as Base64 to `note.drawings[]`
- [ ] Display saved drawings below content
- [ ] Smooth fade-in/fade-out animations

**Libraries needed:**
```bash
npm install react-sketch-canvas
```

**Estimated time:** 2-3 hours

---

#### 2. Smart Attachments
**Status:** Data models ready, needs UI implementation

**What to build:**
- [ ] Drag-drop zone with glow effect
- [ ] Auto-detect attachment type (PDF/image/video/link)
- [ ] Generate AI summaries for PDFs
- [ ] Rich preview cards for links (fetch og:tags)
- [ ] YouTube embed detection
- [ ] Inline image previews with resize handles

**Libraries needed:**
```bash
npm install react-dropzone
npm install @vercel/og-image (for link previews)
```

**Estimated time:** 4-5 hours

---

#### 3. Wiki-style Note Linking
**Status:** Data models ready, needs UI implementation

**What to build:**
- [ ] Detect `[[note title]]` syntax in content
- [ ] Show autocomplete dropdown when typing `[[`
- [ ] Render links as clickable inline elements
- [ ] Hover preview tooltip with note summary
- [ ] Update links when note titles change

**Implementation approach:**
- Use regex to detect `[[...]]` patterns
- Parse during render and replace with clickable components
- Store in `note.links[]` for quick reference
- Use Framer Motion for hover previews

**Estimated time:** 3-4 hours

---

#### 4. Smart Content Blocks
**Status:** Data models ready, needs UI implementation

**What to build:**
- [ ] Convert content to block structure
- [ ] Drag handles for reordering (react-beautiful-dnd)
- [ ] Block toolbar (merge, delete, collapse)
- [ ] Smooth expand/collapse animations
- [ ] Auto-save on reorder

**Libraries needed:**
```bash
npm install react-beautiful-dnd @types/react-beautiful-dnd
npm install @dnd-kit/core @dnd-kit/sortable (modern alternative)
```

**Estimated time:** 5-6 hours

---

### Priority 2: AI Enhancements

#### 5. Handwriting to Text Conversion
**Status:** Depends on Sketch Mode implementation

**What to build:**
- [ ] "Convert to Text" button on drawings
- [ ] AI OCR using OpenRouter/Vision API
- [ ] Replace drawing with editable text
- [ ] Undo functionality

**API approach:**
- Use vision-capable model (e.g., GPT-4 Vision via OpenRouter)
- Send Base64 image
- Extract text
- Insert into content

**Estimated time:** 2-3 hours

---

#### 6. AI PDF Summarization
**Status:** Depends on Smart Attachments

**What to build:**
- [ ] Extract text from PDFs (pdf.js)
- [ ] Send to AI for summarization
- [ ] Display summary in attachment card
- [ ] Cache summaries in `attachment.meta.summary`

**Libraries needed:**
```bash
npm install pdfjs-dist
```

**Estimated time:** 3-4 hours

---

### Priority 3: UX Polish

#### 7. Animations & Transitions
**What to add:**
- [ ] Glow effect on drag-over for attachments
- [ ] Shimmer "Importing..." loader
- [ ] Slide transitions between linked notes
- [ ] Bounce effect when dropping items
- [ ] Smooth block reordering

**Already using:** Framer Motion (installed)

**Estimated time:** 2-3 hours

---

## 📋 Implementation Order

### Week 1: Core Features
1. ✅ Fix quiz/mindmap generation (DONE)
2. ✅ Update data models (DONE)
3. Implement Sketch Mode
4. Implement Smart Attachments
5. Add Note Linking

### Week 2: Advanced Features
6. Build Smart Blocks system
7. Add AI handwriting OCR
8. Add AI PDF summarization
9. Polish animations

### Week 3: Testing & Refinement
10. End-to-end testing
11. Performance optimization
12. Documentation

---

## 🧪 Testing Checklist

### Quiz & Mindmap (Now Fixed)
- [ ] Create note with 300+ words
- [ ] Click "Generate Mindmap" → Wait 30s → Mindmap appears
- [ ] Click "Create Quiz" → Wait 30s → Interactive quiz appears
- [ ] Answer quiz questions → See score
- [ ] Navigate mindmap → Drag nodes

### Handwriting (To Implement)
- [ ] Toggle sketch mode
- [ ] Draw with mouse/stylus
- [ ] Save drawing
- [ ] Reload note → Drawing persists
- [ ] Convert to text with AI

### Attachments (To Implement)
- [ ] Drag PDF → See thumbnail + AI summary
- [ ] Paste YouTube link → Embedded video appears
- [ ] Drop image → Inline preview with resize
- [ ] Paste website URL → Rich preview card

### Note Linking (To Implement)
- [ ] Type `[[` → Autocomplete shows notes
- [ ] Click link → Opens linked note
- [ ] Hover link → Preview tooltip
- [ ] Rename note → Links update

### Smart Blocks (To Implement)
- [ ] Enable block mode
- [ ] Drag blocks to reorder
- [ ] Collapse/expand blocks
- [ ] Merge adjacent blocks
- [ ] Delete blocks

---

## 💡 Next Steps

### Immediate Action
The quiz and mindmap features are now **FIXED**. Test them by:
1. Opening http://localhost:3000
2. Creating a note with substantial content
3. Clicking "Generate Mindmap" or "Create Quiz"
4. Waiting for the AI (check browser console for logs)

### Begin Implementation
Start with **Sketch Mode** as it's:
- Isolated feature
- Good foundation for understanding the architecture
- Provides immediate value
- Simplest of the new features

**Command to start:**
```bash
npm install react-sketch-canvas
```

Then create:
- `src/components/editor/SketchCanvas.tsx`
- Add toggle button to NoteEditor
- Wire up to `note.drawings[]`

---

## 📦 Dependencies Summary

### Already Installed
- ✅ Framer Motion (animations)
- ✅ React Flow (mindmaps)
- ✅ LangChain (AI)
- ✅ Zustand (state)

### Need to Install
```bash
# For handwriting
npm install react-sketch-canvas

# For drag-drop
npm install react-dropzone

# For blocks (choose one)
npm install react-beautiful-dnd @types/react-beautiful-dnd
# OR
npm install @dnd-kit/core @dnd-kit/sortable

# For PDFs
npm install pdfjs-dist
```

---

**Status:** Quiz & Mindmap **FIXED** ✅
**Ready for:** Enhanced features implementation
**Server:** Running at http://localhost:3000
