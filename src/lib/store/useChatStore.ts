/**
 * Chat Store
 * Manages chat conversations and messages
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage } from '@/lib/ai/types';

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  noteIds: string[]; // Notes included in this conversation
  createdAt: Date;
  updatedAt: Date;
}

interface ChatStore {
  // State
  conversations: Conversation[];
  currentConversationId: string | null;

  // Actions
  createConversation: (noteIds?: string[]) => string;
  deleteConversation: (id: string) => void;
  setCurrentConversation: (id: string | null) => void;
  getCurrentConversation: () => Conversation | null;

  addMessage: (conversationId: string, message: ChatMessage) => void;
  clearMessages: (conversationId: string) => void;
  updateConversationTitle: (id: string, title: string) => void;

  // Utility
  getConversationsByNoteId: (noteId: string) => Conversation[];
  clearAllConversations: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial State
      conversations: [],
      currentConversationId: null,

      // Create a new conversation
      createConversation: (noteIds = []) => {
        const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newConversation: Conversation = {
          id,
          title: `Chat ${new Date().toLocaleDateString()}`,
          messages: [],
          noteIds,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: id,
        }));

        return id;
      },

      // Delete a conversation
      deleteConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          currentConversationId:
            state.currentConversationId === id ? null : state.currentConversationId,
        }));
      },

      // Set the current conversation
      setCurrentConversation: (id) => {
        set({ currentConversationId: id });
      },

      // Get the current conversation
      getCurrentConversation: () => {
        const { conversations, currentConversationId } = get();
        return conversations.find((c) => c.id === currentConversationId) || null;
      },

      // Add a message to a conversation
      addMessage: (conversationId, message) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, message],
                  updatedAt: new Date(),
                  // Auto-generate title from first user message
                  title:
                    c.messages.length === 0 && message.role === 'user'
                      ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                      : c.title,
                }
              : c
          ),
        }));
      },

      // Clear all messages from a conversation
      clearMessages: (conversationId) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, messages: [], updatedAt: new Date() }
              : c
          ),
        }));
      },

      // Update conversation title
      updateConversationTitle: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title, updatedAt: new Date() } : c
          ),
        }));
      },

      // Get all conversations that include a specific note
      getConversationsByNoteId: (noteId) => {
        const { conversations } = get();
        return conversations.filter((c) => c.noteIds.includes(noteId));
      },

      // Clear all conversations
      clearAllConversations: () => {
        set({ conversations: [], currentConversationId: null });
      },
    }),
    {
      name: 'quicknotes-chat-storage',
      version: 1,
    }
  )
);
