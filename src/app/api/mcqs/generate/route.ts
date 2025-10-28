import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { documents, documentChunks, mcqs } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import ModelRegistry from '@/lib/models/registry';

// Helper to safely parse JSON possibly wrapped in code fences
function safeParseJSON(raw: string): any | null {
  try {
    return JSON.parse(raw);
  } catch (_) {
    // Try to extract JSON from markdown code fences
    const match = raw.match(/```(?:json)?\n([\s\S]*?)\n```/i);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch (_) {}
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { documentId, count = 10, maxChunks = 20 } = body;

    if (!documentId || typeof documentId !== 'number') {
      return NextResponse.json(
        { error: 'documentId (number) is required' },
        { status: 400 },
      );
    }

    // Ensure document exists
    const [doc] = await db.select().from(documents).where(eq(documents.id, documentId));
    if (!doc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 },
      );
    }

    // Fetch chunks for the document (ordered to preserve flow)
    const chunks = await db
      .select()
      .from(documentChunks)
      .where(eq(documentChunks.documentId, documentId));

    if (!chunks.length) {
      return NextResponse.json(
        { error: 'No chunks found for this document. Please ensure processing completed.' },
        { status: 400 },
      );
    }

    // Build context string limited by number of chunks and character budget
    const sorted = [...chunks].sort((a, b) => (a.chunkIndex ?? 0) - (b.chunkIndex ?? 0));
    const limited = sorted.slice(0, Math.max(1, Math.min(maxChunks, sorted.length)));

    const MAX_CHARS = 12000; // rough safety cap
    let context = '';
    for (const c of limited) {
      const toAdd = `\n\n[Page ${c.pageNumber ?? '?'} | Chunk ${c.chunkIndex}]\n${c.content}`;
      if ((context + toAdd).length > MAX_CHARS) break;
      context += toAdd;
    }

    // Load a chat model (prefer Gemini flash family)
    const registry = new ModelRegistry();
    let chatModel: any;
    try {
      const providers = registry.getRawActiveProviders();
      const gemini = providers.find((p) => p.type === 'gemini');
      if (gemini) {
        const list = await gemini.provider.getModelList();
        const chatCandidates = [
          'models/gemini-2.5-flash',
          'models/gemini-2.5-flash-lite',
          'models/gemini-2.0-flash',
          'models/gemini-2.0-flash-lite',
          'models/gemini-flash-latest',
          'models/gemini-flash-lite-latest',
        ];
        const available = list.chat.map((m: any) => m.key);
        const chosen = chatCandidates.find((k) => available.includes(k)) || available[0];
        chatModel = await registry.loadChatModel(gemini.id, chosen);
      } else {
        const anyProv = providers.find((p) => (p.chatModels?.length ?? 0) > 0);
        if (!anyProv) throw new Error('No chat model provider configured');
        chatModel = await registry.loadChatModel(anyProv.id, anyProv.chatModels![0].key);
      }
    } catch (err) {
      console.error('Error loading chat model:', err);
      return NextResponse.json(
        { error: 'Failed to load AI chat model. Configure a provider in Settings.' },
        { status: 500 },
      );
    }

    const systemPrompt = `You are an expert exam-setter for Indian competitive exams (UPSC/SSC etc.).
Generate high-quality MCQs ONLY from the provided context. Follow these rules strictly:
- Each question must have EXACTLY 4 options (A, B, C, D) but return options as an array of 4 strings.
- Provide the correctAnswer as a zero-based index (0..3).
- Provide a short, precise explanation citing the context.
- Balance difficulty across easy/medium/hard, default medium.
- Do not include content outside the context. Avoid ambiguous questions.
Return ONLY valid JSON with the following shape: { "mcqs": [ { "question": string, "options": string[4], "correctAnswer": number, "explanation": string, "difficulty": "easy"|"medium"|"hard" } ] }`;

    const userPrompt = `Context:\n${context}\n\nGenerate ${Math.max(1, Math.min(30, Number(count) || 10))} MCQs.`;

    // Invoke LLM
    let raw: string = '';
    try {
      const res = await chatModel.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);
      raw = res?.content?.toString?.() ?? String(res ?? '');
    } catch (err) {
      console.error('MCQ generation failed:', err);
      return NextResponse.json(
        { error: 'AI generation failed. Please try again.' },
        { status: 502 },
      );
    }

    // Parse and validate
    const parsed = safeParseJSON(raw);
    if (!parsed || !Array.isArray(parsed.mcqs)) {
      return NextResponse.json(
        { error: 'Model returned invalid format', raw },
        { status: 500 },
      );
    }

    const cleaned = (parsed.mcqs as any[])
      .filter((q) => q && typeof q.question === 'string' && Array.isArray(q.options))
      .map((q) => ({
        question: String(q.question).trim(),
        options: Array.isArray(q.options) ? q.options.slice(0, 4).map((o: any) => String(o)) : [],
        correctAnswer: Number.isInteger(q.correctAnswer) ? q.correctAnswer : 0,
        explanation: q.explanation ? String(q.explanation).trim() : null,
        difficulty: ['easy', 'medium', 'hard'].includes(String(q.difficulty)) ? String(q.difficulty) : 'medium',
      }))
      .filter((q) => q.options.length === 4 && q.correctAnswer >= 0 && q.correctAnswer <= 3)
      .slice(0, Math.max(1, Math.min(30, Number(count) || 10)));

    if (!cleaned.length) {
      return NextResponse.json(
        { error: 'No valid MCQs generated' },
        { status: 500 },
      );
    }

    // Insert into DB and return
    const inserts = await Promise.all(
      cleaned.map((q) =>
        db
          .insert(mcqs)
          .values({
            documentId,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
          })
          .returning(),
      ),
    );

    const flattened = inserts.flat();

    return NextResponse.json({
      success: true,
      count: flattened.length,
      mcqs: flattened,
    });
  } catch (error) {
    console.error('Error in MCQ generation API:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate MCQs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

