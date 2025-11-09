# 🧠 AI Quiz & Mindmap Features - Complete Guide

## ✅ What's Been Fixed & Implemented

### 1. **Debugging & Error Handling**
- Added comprehensive console logging for both mindmap and quiz generation
- Better error messages with specific details
- Proper response validation before showing viewers

### 2. **Interactive MCQ Quiz System** ✨

Complete redesign of the quiz feature with:

#### **New Component: `InteractiveQuiz`**
Location: `src/components/ai/InteractiveQuiz.tsx`

**Features:**
- ✅ Multiple Choice Questions (4 options each)
- ✅ Visual feedback (green for correct, red for incorrect)
- ✅ Hint system (shows before answering)
- ✅ Detailed explanations after answering
- ✅ Progress tracking with visual indicators
- ✅ Difficulty badges (Easy/Medium/Hard)
- ✅ Score calculation and completion screen
- ✅ "Try Again" button to regenerate quiz
- ✅ Smooth animations throughout

#### **Updated Quiz AI Prompt**
The AI now generates:
- Exactly 4 options per question
- Plausible distractors (not obviously wrong)
- Detailed explanations for correct answers
- Helpful hints for each question
- Difficulty ratings

### 3. **Updated Type System**

**Enhanced `Flashcard` type** (`src/lib/ai/types.ts`):
```typescript
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  options?: string[];              // NEW: MCQ options
  correctAnswerIndex?: number;     // NEW: Index of correct answer
  explanation?: string;            // NEW: Detailed explanation
}
```

### 4. **Integration Status**

✅ **NoteEditor Integration** (`src/components/editor/NoteEditor.tsx`):
- AI Toolbar with 3 buttons (Summarize, Mindmap, Quiz)
- Mindmap Viewer (ReactFlow-based visualization)
- Interactive Quiz (new MCQ interface)
- All components properly connected

---

## 🎮 How to Use

### **Generate a Quiz**

1. **Create or open a note** with content (e.g., notes about physics, chemistry, etc.)
2. **Click "Create Quiz"** button in the AI Study Tools section
3. **Wait for AI generation** (15-40 seconds depending on content length)
4. **Interactive quiz appears** with:
   - Progress bar at top
   - Question with difficulty badge
   - Hint (if available)
   - 4 multiple choice options (A, B, C, D)

5. **Answer questions:**
   - Click any option to submit answer
   - Immediately see if correct (green) or wrong (red)
   - Read detailed explanation
   - Click "Next" to continue

6. **Completion screen** shows:
   - Final score percentage
   - Number of correct answers
   - Options to "Try Again" or close

### **Generate a Mindmap**

1. **Create or open a note** with structured content
2. **Click "Generate Mindmap"** button
3. **Interactive mindmap opens** with:
   - Root node (main topic) - Purple
   - Branch nodes (subtopics) - Blue
   - Leaf nodes (details) - Green
4. **Interact with the map:**
   - Drag nodes to rearrange
   - Zoom in/out with controls
   - Use minimap for navigation

---

## 🏗️ Architecture

### **Flow: User clicks "Create Quiz"**

```
1. NoteEditor.handleGenerateQuiz()
   ↓
2. POST /api/ai/quiz
   ↓
3. QuizMakerService.generateFlashcards()
   ↓
4. LangChain → OpenRouter → MiniMax 2
   ↓
5. AI returns JSON with MCQ questions
   ↓
6. parseAIJson() strips markdown
   ↓
7. Return Quiz object to frontend
   ↓
8. InteractiveQuiz component renders
```

### **Components Structure**

```
NoteEditor
├── AIToolbar
│   ├── Summarize Note
│   ├── Generate Mindmap
│   └── Create Quiz ← User clicks this
│
├── MindmapViewer (conditional)
└── InteractiveQuiz (conditional)
    ├── Progress Bar
    ├── Question Card
    │   ├── Difficulty Badge
    │   ├── Question Text
    │   ├── Hint (optional)
    │   └── 4 MCQ Options
    ├── Explanation (after answer)
    └── Navigation
```

---

## 🎨 Design Implementation

### **Quiz UI/UX Features**

1. **Visual Hierarchy:**
   - Large question text (2xl font)
   - Clear option buttons with letter badges (A/B/C/D)
   - Color-coded feedback (green/red)

2. **Animations:**
   - Slide in/out transitions between questions
   - Scale hover effects on options
   - Smooth height transitions for explanations
   - Progress bar animation

3. **Accessibility:**
   - Clear visual feedback for answered questions
   - Disabled state for already-answered questions
   - Progress dots show correct (green) / incorrect (red) / unanswered (gray)

4. **Completion Screen:**
   - Trophy icon
   - Large score display
   - Actionable buttons (Try Again, Close)

---

## 📊 API Response Structure

### **Quiz API Response**

```json
{
  "quiz": {
    "title": "Physics Quiz - Newton's Laws",
    "quizType": "mcq",
    "totalCards": 5,
    "estimatedTime": 10,
    "flashcards": [
      {
        "id": "q1",
        "question": "What is Newton's First Law also known as?",
        "options": [
          "Law of Inertia",
          "Law of Acceleration",
          "Law of Action-Reaction",
          "Law of Gravity"
        ],
        "correctAnswerIndex": 0,
        "answer": "Law of Inertia",
        "explanation": "Newton's First Law states that an object at rest stays at rest unless acted upon by an external force, which is the principle of inertia.",
        "hint": "Think about objects that resist changes in motion",
        "difficulty": "easy"
      }
    ]
  }
}
```

### **Mindmap API Response**

```json
{
  "mindmap": {
    "title": "Newton's Laws of Motion",
    "nodes": [
      {
        "id": "root",
        "label": "Newton's Laws",
        "type": "root",
        "position": { "x": 400, "y": 300 }
      },
      {
        "id": "branch-1",
        "label": "First Law",
        "type": "branch",
        "position": { "x": 650, "y": 300 }
      }
    ],
    "edges": [
      {
        "id": "e-root-branch-1",
        "source": "root",
        "target": "branch-1"
      }
    ]
  }
}
```

---

## 🔧 Troubleshooting

### **Quiz buttons not working?**

**Check browser console** (F12 → Console tab):
- Look for "Generating quiz for:" log
- Check "Quiz response status:" (should be 200)
- Look for "Quiz data received:" log

**Common issues:**
1. **No content in note** → Add some text before generating
2. **API timeout** → Quiz takes 15-40 seconds, be patient
3. **JSON parse error** → Already fixed with `parseAIJson()` utility
4. **Empty response** → Check console logs, API might have failed

### **Mindmap not showing?**

Similar debugging steps as quiz:
- Check console for "Generating mindmap for:"
- Verify "Mindmap response status: 200"
- Look for error messages

---

## 🚀 Next Steps (Pending Implementation)

### **1. Quiz Generation from Mindmap Nodes** 🔜
**Vision:** Right-click on any mindmap node → "Generate Quiz from this branch"

**Implementation Plan:**
```typescript
// Add to MindmapViewer.tsx
const handleNodeContextMenu = (nodeId: string) => {
  // Find node and its children
  const branch = extractBranch(nodeId);

  // Generate quiz from branch content
  onGenerateQuizFromBranch(branch);
};
```

### **2. Quiz Saving System** 🔜
**Vision:** Save generated quizzes for later review

**Implementation Plan:**
- Add `savedQuizzes` to note metadata
- "Save Quiz" button in completion screen
- Quiz library view in sidebar
- Re-take saved quizzes anytime

### **3. Enhanced Animations** 🔜
- Glow effect on mindmap nodes during quiz generation
- Confetti animation on quiz completion (high score)
- Subtle particle effects

---

## 💡 Tips for Best Results

### **For Better Quizzes:**
1. **Well-structured content** → AI generates better questions
2. **Clear concepts** → Include definitions and examples
3. **Sufficient length** → At least 200-300 words for 5 good questions
4. **Educational tone** → Formal notes work better than casual text

### **For Better Mindmaps:**
1. **Hierarchical structure** → Use headings and subheadings
2. **Key concepts** → AI identifies main topics and subtopics
3. **Logical flow** → Content should have clear relationships
4. **Bullet points** → Help AI identify discrete concepts

---

## 📁 Files Modified/Created

### **New Files:**
1. `src/components/ai/InteractiveQuiz.tsx` - Complete MCQ quiz interface
2. `AI_QUIZ_MINDMAP_GUIDE.md` - This guide

### **Modified Files:**
1. `src/components/editor/NoteEditor.tsx` - Added debug logging, switched to InteractiveQuiz
2. `src/lib/ai/types.ts` - Enhanced Flashcard interface for MCQ support
3. `src/lib/ai/quiz-maker.ts` - Updated AI prompt for MCQ generation

---

## 🎯 Current Status

✅ **Working:**
- Quiz generation API (generates MCQ questions)
- Mindmap generation API
- Interactive quiz UI with all features
- Mindmap visualization
- Error handling and debugging

🔄 **In Progress:**
- Testing end-to-end flow with real content
- Verifying AI generates proper MCQ format

🔜 **Planned:**
- Quiz from mindmap nodes
- Quiz saving/library
- Advanced animations

---

## 🧪 Testing Checklist

- [ ] Create note with 300+ words of educational content
- [ ] Click "Create Quiz" button
- [ ] Wait 20-40 seconds for generation
- [ ] Verify quiz opens with 4-5 questions
- [ ] Check each question has 4 options
- [ ] Answer questions and verify feedback
- [ ] Complete quiz and see score
- [ ] Click "Try Again" to regenerate
- [ ] Test "Generate Mindmap" similarly
- [ ] Verify both features work on different content types

---

## 💰 Cost

**FREE** - Using OpenRouter with MiniMax 2 model
- No API costs
- Unlimited quiz and mindmap generation
- No rate limits (within OpenRouter's fair use)

---

**Need help?** Check browser console (F12) for detailed logs during generation!
