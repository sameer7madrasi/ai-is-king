"use client";

import React, { useRef, useState } from "react";
import { PaperClipIcon, MicrophoneIcon, ArrowUpCircleIcon } from '@heroicons/react/24/outline';
import { useBackground } from "@/components/BackgroundProvider";

interface ChatEntry {
  id: string;
  type: 'text' | 'file' | 'voice';
  content: string;
  filename?: string;
  from: 'user' | 'ai';
}

export default function UploadPage() {
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getBackgroundStyle } = useBackground();

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
      setHistory((h) => [...h, { id: Date.now() + "-ai", type: 'text', content: data.aiResponse || "Entry received!", from: 'ai' }]);
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
    <div className="flex flex-col h-screen relative overflow-hidden" style={getBackgroundStyle()}>
      {/* 90s-coded background elements - only show on default background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg opacity-20 animate-bounce"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-r from-green-400 to-blue-400 transform rotate-45 opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-20 animate-bounce"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
      </div>

      {/* Chat bubbles/history - only show if there are entries */}
      {history.length > 0 && (
        <div className="flex-1 overflow-y-auto px-4 py-8 max-w-4xl mx-auto w-full relative z-10">
          <div className="flex flex-col gap-4">
            {history.map((entry) => (
              <div key={entry.id} className={`flex ${entry.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-2xl px-5 py-3 max-w-[75%] shadow-lg text-base backdrop-blur-sm ${
                  entry.from === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 border border-white/20'
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
      )}

      {/* Centered input area - positioned in the middle */}
      <div className="flex-1 flex items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-4xl">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-4">
            <div className="flex items-end gap-3">
              <button
                type="button"
                className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
              >
                <PaperClipIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
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
                className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                onClick={handleVoiceStub}
                title="Record voice note (stub)"
              >
                <MicrophoneIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message AI Analytics..."
                className="flex-1 min-h-[52px] max-h-32 p-4 border-0 rounded-xl resize-none focus:ring-0 focus:outline-none placeholder-gray-500 dark:placeholder-gray-400 text-base leading-relaxed text-gray-900 dark:text-gray-100 bg-transparent"
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
                className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
                title="Submit"
              >
                <ArrowUpCircleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          {error && <div className="mt-3 text-red-600 text-sm text-center">{error}</div>}
        </div>
      </div>
      
      {loading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 flex items-center space-x-4 shadow-2xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg text-gray-700 dark:text-gray-100">Processing your entry...</span>
          </div>
        </div>
      )}
    </div>
  );
} 