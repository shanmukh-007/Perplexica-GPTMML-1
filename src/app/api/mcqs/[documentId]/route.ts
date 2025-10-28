import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { mcqs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(_req: Request, context: any) {
  try {
    const documentId = Number(context?.params?.documentId);
    if (!documentId || Number.isNaN(documentId)) {
      return NextResponse.json(
        { error: 'Invalid documentId' },
        { status: 400 }
      );
    }

    const rows = await db
      .select()
      .from(mcqs)
      .where(eq(mcqs.documentId, documentId));

    return NextResponse.json({ mcqs: rows, count: rows.length });
  } catch (error) {
    console.error('Error fetching MCQs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch MCQs' },
      { status: 500 }
    );
  }
}

