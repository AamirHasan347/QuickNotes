import { Note } from '@/lib/store/types';

export interface NoteLink {
  text: string;
  noteId: string | null;
  start: number;
  end: number;
}

/**
 * Extracts note links from content in the format [[note name]]
 */
export function extractNoteLinks(content: string, allNotes: Note[]): NoteLink[] {
  const linkRegex = /\[\[([^\]]+)\]\]/g;
  const links: NoteLink[] = [];
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const linkText = match[1];
    const foundNote = allNotes.find(
      (note) => note.title.toLowerCase() === linkText.toLowerCase()
    );

    links.push({
      text: linkText,
      noteId: foundNote?.id || null,
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return links;
}

/**
 * Renders content with clickable note links
 */
export function renderContentWithLinks(
  content: string,
  allNotes: Note[],
  onLinkClick: (noteId: string) => void
): React.ReactNode[] {
  const links = extractNoteLinks(content, allNotes);

  if (links.length === 0) {
    return [content];
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  links.forEach((link, index) => {
    // Add text before the link
    if (link.start > lastIndex) {
      parts.push(content.substring(lastIndex, link.start));
    }

    // Add the link
    const key = `link-${index}`;
    if (link.noteId) {
      parts.push(
        <button
          key={key}
          onClick={(e) => {
            e.stopPropagation();
            onLinkClick(link.noteId!);
          }}
          className="text-[--color-primary-blue] hover:underline font-medium"
        >
          {link.text}
        </button>
      );
    } else {
      parts.push(
        <span key={key} className="text-gray-400 italic">
          [[{link.text}]]
        </span>
      );
    }

    lastIndex = link.end;
  });

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return parts;
}

/**
 * Gets all notes that link to a specific note
 */
export function getBacklinks(noteId: string, allNotes: Note[]): Note[] {
  const targetNote = allNotes.find((n) => n.id === noteId);
  if (!targetNote) return [];

  return allNotes.filter((note) => {
    if (note.id === noteId) return false;
    const links = extractNoteLinks(note.content, allNotes);
    return links.some((link) => link.noteId === noteId);
  });
}
