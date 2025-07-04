"use client";

import React, { useState } from 'react';

export default function TestNLPPage() {
  const [inputText, setInputText] = useState("July 2nd - 2 goals, 2 assists. 7 miles. Left foot needs to be better.");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testExamples = [
    "July 2nd - 2 goals, 2 assists. 7 miles. Left foot needs to be better.",
    "Today I ran 5 miles in 45 minutes. Feeling great!",
    "Workout: 3 sets of 10 pushups, 20 squats. Need to improve upper body strength.",
    "Scored 1 goal, 3 assists. Need to work on passing accuracy.",
    "Ran 10k in 52 minutes. New personal best!"
  ];

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-nlp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Processing failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setInputText(example);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">NLP Processing Test</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Input Text:</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full h-32 p-3 border border-gray-300 rounded-lg text-gray-900 bg-white"
          placeholder="Enter text to test NLP processing..."
        />
      </div>

      <div className="mb-6">
        <button
          onClick={handleTest}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Test NLP Processing'}
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Examples:</h3>
        <div className="space-y-2">
          {testExamples.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="block w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-900 bg-white"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Results:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold mb-2 text-gray-900">Extracted Metrics:</h4>
              <pre className="text-sm overflow-auto text-gray-900 bg-white p-3 rounded border">
                {JSON.stringify(result.result.extractedData.metrics, null, 2)}
              </pre>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold mb-2 text-gray-900">Domain:</h4>
              <p className="text-lg font-medium text-gray-900">{result.result.domain}</p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold mb-2 text-blue-900">Insights:</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-900">
              {result.result.insights.map((insight: string, index: number) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold mb-2 text-green-900">Recommendations:</h4>
            <ul className="list-disc list-inside space-y-1 text-green-900">
              {result.result.recommendations.map((rec: string, index: number) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold mb-2 text-gray-900">Full Result:</h4>
            <pre className="text-xs overflow-auto max-h-96 text-gray-900 bg-white p-3 rounded border">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
} 