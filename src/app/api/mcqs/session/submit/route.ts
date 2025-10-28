import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { mcqs, studySessions } from '@/lib/db/schema';
import { and, eq, inArray } from 'drizzle-orm';

interface Answer {
  mcqId: number;
  selectedIndex: number; // 0..3
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, answers, durationSeconds } = body as {
      sessionId: number;
      answers: Answer[];
      durationSeconds?: number;
    };

    if (!sessionId || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: 'sessionId and non-empty answers are required' },
        { status: 400 },
      );
    }

    const validAnswers = answers.filter(
      (a) => a && Number.isInteger(a.mcqId) && Number.isInteger(a.selectedIndex),
    );
    if (!validAnswers.length) {
      return NextResponse.json(
        { error: 'No valid answers provided' },
        { status: 400 },
      );
    }

    // Load MCQs
    const ids = validAnswers.map((a) => a.mcqId);
    const rows = await db
      .select()
      .from(mcqs)
      .where(inArray(mcqs.id, ids));

    // Score
    let attempted = 0;
    let correct = 0;
    for (const ans of validAnswers) {
      const m = rows.find((r) => r.id === ans.mcqId);
      if (!m) continue;
      attempted++;
      if (ans.selectedIndex === m.correctAnswer) correct++;
    }
    const incorrect = Math.max(0, attempted - correct);
    const score = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

    // Update session
    await db
      .update(studySessions)
      .set({
        questionsAttempted: attempted,
        correctAnswers: correct,
        incorrectAnswers: incorrect,
        score,
        completedAt: new Date(),
        duration: durationSeconds && Number.isFinite(durationSeconds)
          ? Math.max(0, Math.floor(durationSeconds))
          : null,
      })
      .where(eq(studySessions.id, sessionId));

    return NextResponse.json({ success: true, attempted, correct, incorrect, score });
  } catch (error) {
    console.error('Error submitting MCQ session:', error);
    return NextResponse.json(
      { error: 'Failed to submit session' },
      { status: 500 },
    );
  }
}

