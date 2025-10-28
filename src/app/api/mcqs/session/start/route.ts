import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { studySessions } from '@/lib/db/schema';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, documentId } = body;

    if (!studentId || typeof studentId !== 'string') {
      return NextResponse.json(
        { error: 'studentId (string) is required' },
        { status: 400 },
      );
    }
    const docId = Number(documentId);
    if (!docId || Number.isNaN(docId)) {
      return NextResponse.json(
        { error: 'documentId (number) is required' },
        { status: 400 },
      );
    }

    const [session] = await db
      .insert(studySessions)
      .values({
        studentId,
        documentId: docId,
        sessionType: 'mcq',
        questionsAttempted: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        score: 0,
      })
      .returning();

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('Error starting MCQ session:', error);
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 },
    );
  }
}

