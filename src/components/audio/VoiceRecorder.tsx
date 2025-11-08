'use client';

import { Mic, Square, Play, Pause, X } from 'lucide-react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { AudioRecording } from '@/lib/store/types';

interface VoiceRecorderProps {
  onSave: (recording: AudioRecording) => void;
}

export function VoiceRecorder({ onSave }: VoiceRecorderProps) {
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioLevel,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
  } = useVoiceRecorder();

  const handleSave = async () => {
    const result = await stopRecording();
    if (result) {
      const recording: AudioRecording = {
        id: `audio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        src: result.audioUrl,
        duration: result.duration,
        createdAt: new Date(),
      };
      onSave(recording);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate waveform bars based on audio level
  const generateWaveform = () => {
    const bars = 40;
    const waveformBars = [];

    for (let i = 0; i < bars; i++) {
      // Create a wave effect that pulses with audio
      const baseHeight = 20;
      const maxHeight = 60;

      // If recording and not paused, use audio level
      let height = baseHeight;
      if (isRecording && !isPaused) {
        // Create a wave pattern
        const wavePosition = (i / bars) * Math.PI * 2;
        const wave = Math.sin(wavePosition + Date.now() / 200);

        // Combine wave with audio level
        height = baseHeight + (maxHeight - baseHeight) * audioLevel * (0.5 + wave * 0.5);
      }

      waveformBars.push(
        <div
          key={i}
          className="w-1 bg-[--color-primary-blue] rounded-full transition-all duration-75"
          style={{
            height: `${height}%`,
            opacity: isPaused ? 0.3 : 1,
          }}
        />
      );
    }

    return waveformBars;
  };

  if (!isRecording) {
    return (
      <button
        onClick={startRecording}
        className="flex items-center gap-2 px-4 py-2 bg-[--color-primary-green] text-[--color-text-black] rounded-lg font-medium hover:opacity-90 transition-opacity"
      >
        <Mic className="w-4 h-4" />
        <span>Record Voice</span>
      </button>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Waveform Visualization */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-center gap-0.5 h-20">
          {generateWaveform()}
        </div>
      </div>

      {/* Timer */}
      <div className="text-center">
        <div className="text-2xl font-bold text-[--color-text-black] font-mono">
          {formatTime(recordingTime)}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {isPaused ? 'Paused' : 'Recording...'}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={cancelRecording}
          className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>

        <button
          onClick={isPaused ? resumeRecording : pauseRecording}
          className="p-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
          title={isPaused ? 'Resume' : 'Pause'}
        >
          {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
        </button>

        <button
          onClick={handleSave}
          className="p-3 bg-[--color-primary-blue] text-[--color-text-black] rounded-full hover:opacity-90 transition-opacity"
          title="Save"
        >
          <Square className="w-5 h-5" fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
