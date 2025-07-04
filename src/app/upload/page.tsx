"use client";

import React, { useRef, useState } from "react";
import { PaperClipIcon, MicrophoneIcon, ArrowUpCircleIcon } from '@heroicons/react/24/outline';

interface ChatEntry {
  id: string;
  type: 'text' | 'file' | 'voice';
  content: string;
  filename?: string;
  from: 'user' | 'ai';
}

const MOCK_HISTORY: ChatEntry[] = [
  { id: '1', type: 'text', content: 'How many steps did I walk last week?', from: 'user' },
  { id: '2', type: 'text', content: 'You walked 42,000 steps last week. Great job!', from: 'ai' },
  { id: '3', type: 'file', content: 'Uploaded: health_data.csv', filename: 'health_data.csv', from: 'user' },
  { id: '4', type: 'text', content: 'File received and processed.', from: 'ai' },
];

export default function UploadPage() {
  const [history, setHistory] = useState<ChatEntry[]>(MOCK_HISTORY);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    const userEntry: ChatEntry = {
      id: Date.now().toString(),
      type: 'text',
      content: input,
      from: 'user',
    };
    setHistory((h) => [...h, userEntry]);
    setInput("");
    try {
      const res = await fetch("/api/entry/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userEntry.content }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to process entry");
      setHistory((h) => [...h, { id: Date.now() + "-ai", type: 'text', content: "Entry received! (stub)", from: 'ai' }]);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setLoading(true);
    setError("");
    const file = e.target.files[0];
    const userEntry: ChatEntry = {
      id: Date.now().toString(),
      type: 'file',
      content: `Uploaded: ${file.name}`,
      filename: file.name,
      from: 'user',
    };
    setHistory((h) => [...h, userEntry]);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/entry/file", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to upload file");
      setHistory((h) => [...h, { id: Date.now() + "-ai", type: 'text', content: "File received! (stub)", from: 'ai' }]);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleVoiceStub = async () => {
    setLoading(true);
    setError("");
    const userEntry: ChatEntry = {
      id: Date.now().toString(),
      type: 'voice',
      content: `Voice note (stub)`,
      from: 'user',
    };
    setHistory((h) => [...h, userEntry]);
    // In real use, record and upload audio
    setTimeout(() => {
      setHistory((h) => [...h, { id: Date.now() + "-ai", type: 'text', content: "Voice note received! (stub)", from: 'ai' }]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Chat bubbles/history */}
      <div className="flex-1 overflow-y-auto px-4 py-8 max-w-2xl mx-auto w-full">
        <div className="flex flex-col gap-4">
          {history.map((entry) => (
            <div key={entry.id} className={`flex ${entry.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-2xl px-5 py-3 max-w-[75%] shadow text-base ${
                entry.from === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
              }`}>
                {entry.type === 'file' && entry.filename ? (
                  <span className="font-semibold">📎 {entry.filename}</span>
                ) : (
                  entry.content
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="w-full max-w-2xl mx-auto px-4 pb-8">
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
          >
            <PaperClipIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".csv,.xlsx,.xls,.txt,.text,.pdf,.doc,.docx,.json,.jpg,.jpeg,.png,.mp3,.wav,.m4a"
            />
          </button>
          <button
            type="button"
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={handleVoiceStub}
            title="Record voice note (stub)"
          >
            <MicrophoneIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your entry or ask a question..."
            className="flex-1 min-h-[48px] max-h-32 p-3 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 dark:placeholder-gray-400 text-base leading-relaxed text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900"
            rows={1}
            disabled={loading}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleTextSubmit();
              }
            }}
          />
          <button
            onClick={handleTextSubmit}
            disabled={!input.trim() || loading}
            className="ml-2 p-2 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-700 text-white flex items-center justify-center"
            title="Submit"
          >
            <ArrowUpCircleIcon className="h-7 w-7" />
          </button>
        </div>
        {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
      </div>
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg text-gray-700 dark:text-gray-100">Processing your entry...</span>
          </div>
        </div>
      )}
    </div>
  );
} 