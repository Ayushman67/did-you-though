'use client';

import { useState, useRef } from 'react';
import { useData, Task, Meeting } from '@/lib/data-context';
import { FileText, Mic, Upload, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import ReviewModal from './ReviewModal';

type InputMode = 'text' | 'audio';

export default function MeetingInput() {
  const [mode, setMode] = useState<InputMode>('text');
  const [meetingName, setMeetingName] = useState('');
  const [notes, setNotes] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Review modal state
  const [showReview, setShowReview] = useState(false);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [pendingMeeting, setPendingMeeting] = useState<Meeting | null>(null);

  const { addTasks, addMeeting } = useData();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setError(null);
    }
  };

  const transcribeAudio = async (file: File): Promise<string> => {
    setIsTranscribing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Transcription failed');
      }

      const data = await response.json();
      return data.text;
    } finally {
      setIsTranscribing(false);
    }
  };

  const processContent = async (content: string, name: string) => {
    const response = await fetch('/api/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, meetingName: name }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Processing failed');
    }

    return response.json();
  };

  const handleSubmit = async () => {
    const name = meetingName.trim() || `Meeting ${new Date().toLocaleDateString()}`;
    let content = '';

    if (mode === 'text') {
      if (!notes.trim()) {
        setError('Please enter meeting notes');
        return;
      }
      content = notes;
    } else {
      if (!audioFile) {
        setError('Please select an audio file');
        return;
      }
      try {
        content = await transcribeAudio(audioFile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Transcription failed');
        return;
      }
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await processContent(content, name);

      const newTasks: Task[] = result.tasks.map((t: any, i: number) => ({
        id: `T-${Date.now()}-${i}`,
        description: t.description,
        owner: t.owner || 'Unassigned',
        dueDate: t.due_date || 'TBD',
        priority: t.priority || 'Med',
        initiative: t.initiative || 'General',
        status: 'Open',
        sourceMeeting: name,
        sourceQuote: t.source_quote || undefined,
        sourceSpeaker: t.source_speaker || undefined,
        createdAt: new Date().toISOString(),
      }));

      const newMeeting: Meeting = {
        id: `M-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        name,
        type: mode,
        decisions: result.decisions || [],
        risks: result.risks || [],
      };

      // Show review modal instead of auto-saving
      setPendingTasks(newTasks);
      setPendingMeeting(newMeeting);
      setShowReview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReview = (tasks: Task[], meeting: Meeting) => {
    addTasks(tasks);
    addMeeting(meeting);
    
    setShowReview(false);
    setPendingTasks([]);
    setPendingMeeting(null);
    setSuccess(true);
    setMeetingName('');
    setNotes('');
    setAudioFile(null);

    setTimeout(() => setSuccess(false), 3000);
  };

  const handleCloseReview = () => {
    setShowReview(false);
    setPendingTasks([]);
    setPendingMeeting(null);
  };

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Process Meeting</h2>
          <p className="text-xs text-text-muted">Extract tasks from notes or recordings</p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-1 p-1 bg-gray-50 rounded-lg mb-4 w-fit">
        <button
          onClick={() => setMode('text')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            mode === 'text'
              ? 'bg-white text-text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Text
        </button>
        <button
          onClick={() => setMode('audio')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            mode === 'audio'
              ? 'bg-white text-text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          Audio
        </button>
      </div>

      {/* Meeting Name */}
      <input
        type="text"
        placeholder="Meeting name (optional)"
        value={meetingName}
        onChange={(e) => setMeetingName(e.target.value)}
        className="input mb-3"
      />

      {/* Content Input */}
      {mode === 'text' ? (
        <textarea
          placeholder="Paste meeting notes, transcript, or any text with action items..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          className="input resize-none mb-4"
        />
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-6 mb-4 text-center cursor-pointer
            transition-colors duration-150
            ${audioFile 
              ? 'border-accent bg-accent-light' 
              : 'border-border hover:border-accent hover:bg-gray-50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {audioFile ? (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium text-accent">{audioFile.name}</span>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-secondary">Click to upload audio</p>
              <p className="text-xs text-text-muted mt-1">MP3, WAV, M4A up to 25MB</p>
            </>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-danger-light text-danger text-sm">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 rounded-lg bg-success-light text-success text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Tasks extracted successfully!
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isProcessing || isTranscribing}
        className="btn-primary w-full"
      >
        {isTranscribing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Transcribing...
          </>
        ) : isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Extracting tasks...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Extract Commitments
          </>
        )}
      </button>

      {/* Review Modal */}
      {showReview && pendingMeeting && (
        <ReviewModal
          isOpen={showReview}
          onClose={handleCloseReview}
          onConfirm={handleConfirmReview}
          extractedTasks={pendingTasks}
          extractedMeeting={pendingMeeting}
        />
      )}
    </div>
  );
}
