"use client";
import React, { useEffect, useMemo, useState } from 'react';
import MCQQuestion, { MCQItem } from './MCQQuestion';

interface Props {
  documentId: number;
  studentId?: string; // optional; fallback to 'student-guest'
  initialCount?: number; // how many to generate if none exist
}

export default function MCQPractice({ documentId, studentId, initialCount = 10 }: Props) {
  const [loading, setLoading] = useState(true);
  const [mcqs, setMcqs] = useState<MCQItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<number, number>>({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ attempted: number; correct: number; incorrect: number; score: number } | null>(null);

  const resolvedStudent = useMemo(() => studentId || 'student-guest', [studentId]);

  async function loadMcqs() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/mcqs/${documentId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch MCQs');

      if ((data.count || 0) === 0) {
        // Generate MCQs
        const gen = await fetch('/api/mcqs/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId, count: initialCount }),
        });
        const genData = await gen.json();
        if (!gen.ok) throw new Error(genData.error || 'Generation failed');
        setMcqs(genData.mcqs || []);
      } else {
        setMcqs(data.mcqs || []);
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMcqs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  function onSelect(mcqId: number, idx: number) {
    setSelections((prev) => ({ ...prev, [mcqId]: idx }));
  }

  async function onSubmit() {
    try {
      setSubmitting(true);
      setShowAnswers(true);

      // Start session
      const start = await fetch('/api/mcqs/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: resolvedStudent, documentId }),
      });
      const startData = await start.json();
      if (!start.ok) throw new Error(startData.error || 'Failed to start session');

      const sessionId = startData.session?.id;
      if (!sessionId) throw new Error('Invalid session ID');

      // Build answers payload
      const answers = Object.entries(selections).map(([mcqId, selected]) => ({
        mcqId: Number(mcqId),
        selectedIndex: Number(selected),
      }));

      const submit = await fetch('/api/mcqs/session/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, answers }),
      });
      const submitData = await submit.json();
      if (!submit.ok) throw new Error(submitData.error || 'Failed to submit answers');

      setResult({
        attempted: submitData.attempted,
        correct: submitData.correct,
        incorrect: submitData.incorrect,
        score: submitData.score,
      });
    } catch (e: any) {
      setError(e.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-4">Loading MCQs…</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!mcqs.length) return <div className="p-4">No MCQs available.</div>;

  const answeredCount = Object.keys(selections).length;

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">MCQ Practice</h2>
        <div className="text-sm text-gray-600">Document ID: {documentId}</div>
      </div>

      {result && (
        <div className="mb-4 p-3 rounded bg-blue-50 border border-blue-200">
          <div className="font-medium">Your Result</div>
          <div>Attempted: {result.attempted}</div>
          <div>Correct: {result.correct}</div>
          <div>Incorrect: {result.incorrect}</div>
          <div>Score: {result.score}%</div>
        </div>
      )}

      {mcqs.map((q, idx) => (
        <MCQQuestion
          key={q.id}
          item={q}
          index={idx}
          selectedIndex={selections[q.id] ?? null}
          onChange={(choice) => onSelect(q.id, choice)}
          showAnswer={showAnswers}
        />
      ))}

      <div className="flex items-center gap-3 mt-4">
        <button
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          disabled={submitting || answeredCount === 0}
          onClick={onSubmit}
        >
          {submitting ? 'Submitting…' : 'Submit Answers'}
        </button>
        <div className="text-sm text-gray-600">Answered: {answeredCount} / {mcqs.length}</div>
      </div>
    </div>
  );
}

