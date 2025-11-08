# 🧠 QuickNotes — The Ultimate AI-Powered Note-Taking App for Students

## 🪶 Vision

QuickNotes is a minimal, clean, and intelligent note-taking app designed for students — especially those preparing for competitive exams like **JEE Advanced**.  
It combines the flexibility of a digital notebook, the intelligence of AI summarization, and the power of visual mind mapping — all in one accessible, fast, and distraction-free workspace.

---

## 🚀 Tech Stack

**Framework & Core Technologies**

- **Frontend Framework:** React + Next.js (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS + shadcn/ui (for consistent, modern UI components)
- **Database & Auth:** Supabase
- **State Management:** Zustand (lightweight and simple)
- **Icons:** Lucide React (minimal, consistent icons)
- **Animations:** Framer Motion + Motion One
- **AI Agents:** LangChain (for building AI workflows and connecting models/tools)
- **Mindmap Engine:** React Flow (interactive mindmaps with draggable, editable nodes)
- **Markdown Renderer:** react-markdown + remark-gfm
- **Search Engine:** MiniSearch or Lunr.js (client-side full-text search)
- **Offline Support:** IndexedDB or idb-keyval
- **Speech to Text (Optional):** Whisper API
- **Deployment:** Vercel (for frontend) + Supabase (for backend)

---

## 🎨 Design System

**UI Philosophy:**  
QuickNotes follows a clean, minimal design philosophy optimized for **productivity and focus**.  
It draws inspiration from **Notion**, **Craft**, and **Obsidian** — blending simplicity, depth, and interactivity.

**Color Palette**
| Element | Color |
|----------|-------|
| Background (Cream) | `#f8f8f8` |
| Primary Blue | `#63cdff` |
| Primary Green | `#8ef292` |
| Accent Green (Selection) | `#e4f6e5` |
| Text Black | `#121421` |
| Grey (Inactive Text) | `#efefef` |

**Typography**

- **Headings:** League Spartan
- **Body Text:** Public Sans

---

## 🧩 Core Features

### 🪶 Basic (MVP)

- Create, edit, delete notes
- Rich text + Markdown editing
- Auto-save using Supabase and local storage
- Pin and unpin important notes
- Tag notes with color labels or categories
- Global search bar (Ctrl + K shortcut)
- Dark / Light mode toggle
- Responsive design for laptops and tablets
- Keyboard shortcuts for all key actions
- Note timestamps and history

---

### ✨ Intermediate Features

- Subject-based workspaces (Physics, Chemistry, Maths)
- Note linking using `[[note name]]` syntax
- Quick Search powered by MiniSearch
- Version history for each note (local cache)
- Daily Notes feature — “Today’s Notes” auto-created page
- Focus Mode (hide sidebar, fade background)
- Drag-and-drop note organization
- Manual Mindmap Editor using React Flow

---

### 🚀 Revolutionary / AI-Powered Features

#### 🤖 LangChain-Powered AI Agents

QuickNotes uses **LangChain** to orchestrate and manage AI-driven tasks.

| Agent Type                 | Description                                                               | Tools / Models                          |
| -------------------------- | ------------------------------------------------------------------------- | --------------------------------------- |
| **Note Summarizer**        | Summarizes long or unstructured notes into concise, topic-based summaries | OpenAI / Anthropic models via LangChain |
| **Mindmap Generator**      | Converts user notes into editable mindmaps                                | LangChain + React Flow                  |
| **Quiz Maker**             | Generates flashcards or quizzes from notes                                | LangChain custom chain                  |
| **Study Assistant**        | Conversational Q&A with your notes (context retrieval + response)         | LangChain RetrievalQA                   |
| **Voice Agent (Optional)** | Converts recorded audio into text notes                                   | Whisper API + LangChain pipeline        |

#### Additional AI Features

- Contextual search (“Find notes about Newton’s laws”)
- Note rewriting / simplification for clarity
- AI-suggested connections between related notes
- Study plan generator based on syllabus coverage

---

## 🧠 User Experience (UX)

- **Main Layout**
  - Sidebar: Subjects, Tags, AI Tools
  - Main Editor: Markdown + Rich text hybrid editor
  - Top Navbar: Search, Theme Toggle, Profile
- **Micro-interactions (Framer Motion)**
  - Fade-in animations for note cards
  - Smooth slide transitions between pages
  - Hover and press effects for buttons
  - Soft shadows and rounded corners for a modern aesthetic

**Mindmap Experience**

- Built with React Flow
- Add / edit / delete nodes interactively
- AI can auto-generate initial node flow
- Users can drag, group, or recolor nodes
- Animated edges for connection transitions

---

## 💡 Accessibility & Best Practices

- Follows **WCAG accessibility** guidelines
- Full keyboard navigation support
- Autosave + sync on edit stop
- Lazy loading and SSR via Next.js
- Optimized images and fonts
- Responsive grid layout via Tailwind utilities

---

## 🧰 Developer Setup

**Environment Setup**

```bash
# Create project
npx create-next-app@latest quicknotes --typescript
cd quicknotes

# Install dependencies
npm install tailwindcss framer-motion motion lucide-react zustand react-flow-renderer react-markdown remark-gfm minisearch idb-keyval @supabase/supabase-js @langchain/core @langchain/openai shadcn-ui

**Folder Structure

src/
  components/
    notes/
    mindmap/
    editor/
  lib/
    ai/
      agents/
      chains/
  pages/
  styles/
  utils/
```
