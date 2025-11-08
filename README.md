# 🧠 QuickNotes

**QuickNotes** is a minimal, clean, and intelligent note-taking app designed for students — especially those preparing for competitive exams like **JEE Advanced**.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for authentication and database)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd QuickNotes
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Then edit `.env.local` with your Supabase credentials.

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎨 Features

- **Rich Text Editing**: Markdown + WYSIWYG support
- **AI-Powered**: Summarization, mindmaps, and quiz generation
- **Smart Organization**: Subject-based workspaces and tags
- **Offline Support**: Works without internet connection
- **Dark Mode**: Easy on the eyes for late-night study sessions

## 🧰 Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **Database**: Supabase
- **State Management**: Zustand
- **AI**: LangChain (coming soon)
- **Mindmaps**: React Flow

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── notes/       # Note-related components
│   ├── mindmap/     # Mindmap components
│   ├── editor/      # Editor components
│   ├── ui/          # UI components
│   └── layout/      # Layout components
├── lib/             # Libraries and utilities
│   ├── ai/          # AI agents and chains
│   ├── supabase/    # Supabase client
│   └── store/       # Zustand stores
└── utils/           # Helper functions
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC

---

Built with ❤️ for students by students.
