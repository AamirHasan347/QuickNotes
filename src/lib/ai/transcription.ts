/**
 * Transcription Service
 * Uses OpenAI Whisper API to convert audio to text
 */

import OpenAI from 'openai';
import { TranscriptionResult } from './types';

export class TranscriptionService {
  private openai: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  /**
   * Transcribe audio file to text using Whisper API
   */
  async transcribeAudio(
    audioBlob: Blob,
    language?: string
  ): Promise<TranscriptionResult> {
    if (!this.openai) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    try {
      // Convert blob to File object (required by Whisper API)
      const audioFile = new File([audioBlob], 'recording.webm', {
        type: audioBlob.type,
      });

      // Call Whisper API
      const transcription = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: language || undefined,
        response_format: 'verbose_json',
      });

      return {
        text: transcription.text,
        language: transcription.language,
        duration: transcription.duration || 0,
      };
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to transcribe audio'
      );
    }
  }

  /**
   * Transcribe with automatic summary
   */
  async transcribeAndSummarize(
    audioBlob: Blob,
    language?: string
  ): Promise<{ transcription: TranscriptionResult; summary: string }> {
    if (!this.openai) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    try {
      // First, transcribe
      const transcription = await this.transcribeAudio(audioBlob, language);

      // Then summarize using GPT
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that summarizes voice recordings into concise notes.',
          },
          {
            role: 'user',
            content: `Summarize the following voice recording transcript into key points:\n\n${transcription.text}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const summary = completion.choices[0]?.message?.content || '';

      return {
        transcription,
        summary,
      };
    } catch (error) {
      console.error('Transcription and summarization error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to process audio'
      );
    }
  }

  /**
   * Transcribe from audio URL
   */
  async transcribeFromUrl(audioUrl: string): Promise<TranscriptionResult> {
    try {
      // Fetch the audio file
      const response = await fetch(audioUrl);
      const audioBlob = await response.blob();

      return this.transcribeAudio(audioBlob);
    } catch (error) {
      console.error('URL transcription error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to transcribe from URL'
      );
    }
  }

  /**
   * Batch transcribe multiple audio files
   */
  async batchTranscribe(
    audioBlobs: Blob[]
  ): Promise<TranscriptionResult[]> {
    const results = await Promise.all(
      audioBlobs.map((blob) => this.transcribeAudio(blob))
    );
    return results;
  }
}
