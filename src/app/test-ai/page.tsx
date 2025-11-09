'use client';

import { useState } from 'react';
import { AISummarizer } from '@/components/ai/AISummarizer';

export default function TestAIPage() {
  const [noteTitle, setNoteTitle] = useState('Photosynthesis');
  const [noteContent, setNoteContent] = useState(
    'Photosynthesis is the process by which plants use sunlight, water and carbon dioxide to create oxygen and energy in the form of sugar. During photosynthesis, plants take in carbon dioxide (CO2) and water (H2O) from the air and soil. Within the plant cell, the water is oxidized, meaning it loses electrons, while the carbon dioxide is reduced, meaning it gains electrons. This transforms the water into oxygen and the carbon dioxide into glucose. The plant then releases the oxygen back into the air, and stores energy within the glucose molecules.'
  );

  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTestingAll, setIsTestingAll] = useState(false);

  const runAllTests = async () => {
    setIsTestingAll(true);
    setTestResults([]);
    const results: any[] = [];

    // Test 1: Summarizer
    try {
      const summaryRes = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noteTitle,
          content: noteContent,
          maxLength: 'short',
        }),
      });
      const summaryData = await summaryRes.json();
      results.push({ test: '1. Summarizer', status: 'success', data: summaryData });
    } catch (err) {
      results.push({ test: '1. Summarizer', status: 'error', error: String(err) });
    }

    // Test 2: Mindmap Generator
    try {
      const mindmapRes = await fetch('/api/ai/mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noteTitle,
          content: noteContent,
        }),
      });
      const mindmapData = await mindmapRes.json();
      results.push({ test: '2. Mindmap Generator', status: 'success', data: mindmapData });
    } catch (err) {
      results.push({ test: '2. Mindmap Generator', status: 'error', error: String(err) });
    }

    // Test 3: Quiz Maker
    try {
      const quizRes = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noteTitle,
          content: noteContent,
          count: 3,
          type: 'flashcard',
        }),
      });
      const quizData = await quizRes.json();
      results.push({ test: '3. Quiz Maker', status: 'success', data: quizData });
    } catch (err) {
      results.push({ test: '3. Quiz Maker', status: 'error', error: String(err) });
    }

    setTestResults(results);
    setIsTestingAll(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">AI Features Test Page</h1>
        <p className="text-gray-600 mb-8">
          Test all AI features to ensure they're working correctly.
        </p>

        {/* Note Input */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note Title
            </label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note Content
            </label>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
            />
          </div>
        </div>

        {/* AI Summarizer Component Test */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Test 1: AI Summarizer Component
          </h2>
          <AISummarizer
            noteTitle={noteTitle}
            noteContent={noteContent}
            onSummaryGenerated={(summary) => console.log('Summary generated:', summary)}
          />
        </div>

        {/* Run All Tests */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Run All API Tests</h2>
          <button
            onClick={runAllTests}
            disabled={isTestingAll}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTestingAll ? 'Testing All Features...' : 'Test All API Endpoints'}
          </button>

          {testResults.length > 0 && (
            <div className="mt-6 space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.status === 'success'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{result.test}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.status === 'success'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {result.status}
                    </span>
                  </div>
                  <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                    {JSON.stringify(result.data || result.error, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Setup Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>
              Create <code className="px-1.5 py-0.5 bg-blue-100 rounded">.env.local</code> in
              project root
            </li>
            <li>
              Add: <code className="px-1.5 py-0.5 bg-blue-100 rounded">OPENAI_API_KEY=sk-...</code>
            </li>
            <li>Restart dev server: <code className="px-1.5 py-0.5 bg-blue-100 rounded">npm run dev</code></li>
            <li>Click "AI Summarize" or "Test All API Endpoints" buttons above</li>
          </ol>

          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Get API Keys:</strong>
            </p>
            <ul className="list-disc list-inside text-sm text-blue-700 mt-1">
              <li>
                OpenAI: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com/api-keys</a>
              </li>
              <li>
                Anthropic: <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline">console.anthropic.com</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
