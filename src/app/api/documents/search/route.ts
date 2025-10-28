import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { documents, documentChunks, documentAccess } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import ModelRegistry from '@/lib/models/registry';
import {
  findSimilarChunks,
  formatChunksAsContext,
  checkDocumentAccess,
} from '@/lib/utils/documentProcessing';

// Force recompilation to pick up Gemini provider fix

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, studentId, topK = 5 } = body;

    // Validation
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    console.log(`Processing query: "${query}" for student: ${studentId}`);

    // Load models
    const registry = new ModelRegistry();
    
    let embeddingModel;
    let chatModel;
    
    try {
      // Try to find Gemini provider
      const providers = registry.getRawActiveProviders();
      const geminiProvider = providers.find(p => p.type === 'gemini');

      if (geminiProvider) {
        // Get the model list to find available models
        const modelList = await geminiProvider.provider.getModelList();

        console.log('DEBUG: Available embedding models:', modelList.embedding.map(m => m.key));
        console.log('DEBUG: Available chat models:', modelList.chat.map(m => m.key));

        if (!modelList.embedding || modelList.embedding.length === 0) {
          throw new Error('No embedding models available for Gemini provider');
        }
        if (!modelList.chat || modelList.chat.length === 0) {
          throw new Error('No chat models available for Gemini provider');
        }

        // Select best available embedding model (avoid deprecated gecko)
        const embeddingCandidates = [
          'models/text-embedding-004',
          'models/embedding-001',
          'models/gemini-embedding-001',
          'models/gemini-embedding-exp-03-07',
          'models/gemini-embedding-exp',
        ];
        const availableEmbeddings = modelList.embedding.map(m => m.key);
        const embeddingModelKey =
          embeddingCandidates.find(k => availableEmbeddings.includes(k)) ||
          (modelList.embedding.find(m => m.key.includes('embedding') && !m.key.includes('gecko'))?.key ??
           modelList.embedding[0].key);

        // Select a cost-efficient chat model (prefer flash over pro)
        const chatCandidates = [
          'models/gemini-2.5-flash',
          'models/gemini-2.5-flash-lite',
          'models/gemini-2.0-flash',
          'models/gemini-2.0-flash-lite',
          'models/gemini-flash-latest',
          'models/gemini-flash-lite-latest',
        ];
        const availableChats = modelList.chat.map(m => m.key);
        const chatModelKey =
          chatCandidates.find(k => availableChats.includes(k)) ||
          (modelList.chat.find(m => m.key.includes('flash'))?.key ?? modelList.chat[0].key);

        console.log('Using Gemini embedding model:', embeddingModelKey);
        console.log('Using Gemini chat model:', chatModelKey);

        embeddingModel = await registry.loadEmbeddingModel(
          geminiProvider.id,
          embeddingModelKey
        );
        chatModel = await registry.loadChatModel(
          geminiProvider.id,
          chatModelKey
        );
      } else {
        // Fallback to first available provider
        const providerWithModels = providers.find(p =>
          p.embeddingModels && p.embeddingModels.length > 0 &&
          p.chatModels && p.chatModels.length > 0
        );

        if (!providerWithModels) {
          throw new Error('No model provider available');
        }

        embeddingModel = await registry.loadEmbeddingModel(
          providerWithModels.id,
          providerWithModels.embeddingModels[0].key
        );
        chatModel = await registry.loadChatModel(
          providerWithModels.id,
          providerWithModels.chatModels[0].key
        );
      }
    } catch (error) {
      console.error('Error loading models:', error);
      return NextResponse.json(
        { error: 'Failed to load AI models. Please configure a model provider.' },
        { status: 500 }
      );
    }

    // Generate embedding for the query
    const queryEmbedding = await embeddingModel.embedQuery(query);
    console.log(`Generated query embedding (dimension: ${queryEmbedding.length})`);

    // Get all accessible documents for the student
    const allDocuments = await db.select().from(documents);
    const accessRecords = await db
      .select()
      .from(documentAccess)
      .where(eq(documentAccess.studentId, studentId));

    // Filter documents based on access control
    const accessibleDocuments = allDocuments.filter((doc) =>
      checkDocumentAccess(
        doc.id,
        studentId,
        doc.visibility,
        accessRecords
      )
    );

    if (accessibleDocuments.length === 0) {
      return NextResponse.json({
        answer: "I don't have access to any study materials yet. Please ask your trainer to upload documents or grant you access.",
        sources: [],
        relevantChunks: [],
      });
    }

    const accessibleDocumentIds = accessibleDocuments.map((doc) => doc.id);
    console.log(`Found ${accessibleDocumentIds.length} accessible documents`);

    // Get all chunks from accessible documents
    const allChunks = await db
      .select()
      .from(documentChunks)
      .where(inArray(documentChunks.documentId, accessibleDocumentIds));

    console.log(`Retrieved ${allChunks.length} chunks from accessible documents`);

    if (allChunks.length === 0) {
      return NextResponse.json({
        answer: "The documents are still being processed. Please try again in a moment.",
        sources: [],
        relevantChunks: [],
      });
    }

    // Filter chunks that have embeddings
    const chunksWithEmbeddings = allChunks.filter(
      (chunk) => chunk.embedding && Array.isArray(chunk.embedding)
    );

    // Ensure embedding dimension matches the query embedding dimension
    const expectedDim = queryEmbedding.length;
    const validChunks = chunksWithEmbeddings.filter(
      (chunk) => Array.isArray(chunk.embedding) && (chunk.embedding as number[]).length === expectedDim
    );
    const invalidCount = chunksWithEmbeddings.length - validChunks.length;
    if (invalidCount > 0) {
      console.warn(`Skipping ${invalidCount} chunk(s) due to embedding dimension mismatch`);
    }

    if (validChunks.length === 0) {
      return NextResponse.json({
        answer: "The documents are still being processed (embedding format update). Please re-upload the documents to refresh embeddings.",
        sources: [],
        relevantChunks: [],
      });
    }

    // Debug: log embedding dims
    console.log('Query embedding dim:', expectedDim);
    console.log('Sample chunk embedding dims:', validChunks.slice(0, Math.min(5, validChunks.length)).map(c => (c.embedding as number[]).length));

    // Find similar chunks
    const similarChunks = findSimilarChunks(
      queryEmbedding,
      validChunks.map((chunk) => ({
        id: chunk.id,
        content: chunk.content,
        embedding: chunk.embedding as number[],
        documentId: chunk.documentId,
        pageNumber: chunk.pageNumber,
      })),
      topK
    );

    console.log(`Found ${similarChunks.length} similar chunks`);

    // Get document information for sources
    const relevantDocumentIds = [...new Set(similarChunks.map((c) => c.documentId))];
    const relevantDocuments = accessibleDocuments.filter((doc) =>
      relevantDocumentIds.includes(doc.id)
    );

    // Format context for LLM
    const context = formatChunksAsContext(similarChunks, true);

    // Create prompt for LLM
    const systemPrompt = `You are a helpful study assistant for competitive exam preparation (UPSC, SSC, etc.). 
Answer the student's question based ONLY on the provided context from their study materials.
If the context doesn't contain enough information to answer the question, say so clearly.
Be concise, accurate, and educational in your responses.
When relevant, cite the page numbers from the source material.`;

    const userPrompt = `Context from study materials:

${context}

---

Student's Question: ${query}

Please provide a clear and helpful answer based on the context above.`;

    // Get response from LLM (tolerant to provider errors)
    let answer: string;
    try {
      const response = await chatModel.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);
      answer = response.content.toString();
    } catch (err) {
      console.error('LLM invocation failed:', err);
      answer = 'I could not generate an answer due to an AI model error. Here are the most relevant excerpts from your documents.';
    }

    // Prepare sources information
    const sources = relevantDocuments.map((doc) => ({
      id: doc.id,
      fileName: doc.fileName,
      subject: doc.subject,
      topic: doc.topic,
    }));

    return NextResponse.json({
      answer,
      sources,
      relevantChunks: similarChunks.map((chunk) => ({
        content: chunk.content.substring(0, 200) + '...', // Truncate for response
        similarity: chunk.similarity,
        pageNumber: chunk.pageNumber,
      })),
    });
  } catch (error) {
    console.error('Error processing search query:', error);
    return NextResponse.json(
      {
        error: 'Failed to process search query',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

