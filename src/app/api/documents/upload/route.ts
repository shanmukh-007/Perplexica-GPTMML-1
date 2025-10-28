import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import db from '@/lib/db';
import { documents, documentChunks } from '@/lib/db/schema';
import ModelRegistry from '@/lib/models/registry';
import {
  extractTextFromDocument,
  chunkDocuments,
  validateFileType,
  generateUniqueFileName,
  getFileExtension,
} from '@/lib/utils/documentProcessing';

const uploadDir = path.join(process.cwd(), 'uploads/documents');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // Extract form fields
    const file = formData.get('file') as File;
    const trainerId = formData.get('trainerId') as string;
    const subject = formData.get('subject') as string;
    const topic = formData.get('topic') as string;
    const description = formData.get('description') as string;
    const visibility = formData.get('visibility') as string;

    // Validation
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!trainerId) {
      return NextResponse.json(
        { error: 'Trainer ID is required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!validateFileType(file.name)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOCX, and TXT files are allowed.' },
        { status: 400 }
      );
    }

    const fileExtension = getFileExtension(file.name);
    const uniqueFileName = generateUniqueFileName(file.name);
    const filePath = path.join(uploadDir, uniqueFileName);

    // Save file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, new Uint8Array(buffer));

    console.log(`File saved: ${filePath}`);

    // Extract text from document
    const extractedDocs = await extractTextFromDocument(filePath, fileExtension);
    console.log(`Extracted ${extractedDocs.length} document(s)`);

    // Chunk the documents
    const chunks = await chunkDocuments(extractedDocs, 500, 100);
    console.log(`Created ${chunks.length} chunks`);

    // Load embedding model
    const registry = new ModelRegistry();
    
    // Try to get Gemini provider - use first available provider if not found
    let embeddingModel;
    try {
      // Try to find Gemini provider
      const providers = registry.getRawActiveProviders();
      const geminiProvider = providers.find(p => p.type === 'gemini');

      if (geminiProvider) {
        // Get the model list to find available embedding models
        const modelList = await geminiProvider.provider.getModelList();

        if (!modelList.embedding || modelList.embedding.length === 0) {
          throw new Error('No embedding models available for Gemini provider');
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
        console.log('Using Gemini embedding model:', embeddingModelKey);

        embeddingModel = await registry.loadEmbeddingModel(
          geminiProvider.id,
          embeddingModelKey
        );
      } else {
        // Fallback to first available provider with embedding models
        const providerWithEmbeddings = providers.find(p =>
          p.embeddingModels && p.embeddingModels.length > 0
        );

        if (!providerWithEmbeddings) {
          throw new Error('No embedding model provider available');
        }

        embeddingModel = await registry.loadEmbeddingModel(
          providerWithEmbeddings.id,
          providerWithEmbeddings.embeddingModels[0].key
        );
      }
    } catch (error) {
      console.error('Error loading embedding model:', error);
      return NextResponse.json(
        { error: 'Failed to load embedding model. Please configure a model provider.' },
        { status: 500 }
      );
    }

    // Generate embeddings for all chunks
    const chunkContents = chunks.map((chunk) => chunk.pageContent);
    const embeddings = await embeddingModel.embedDocuments(chunkContents);
    console.log(`Generated ${embeddings.length} embeddings`);

    // Insert document into database
    const [insertedDocument] = await db
      .insert(documents)
      .values({
        trainerId,
        fileName: file.name,
        fileType: fileExtension,
        fileUrl: `/uploads/documents/${uniqueFileName}`,
        fileSize: file.size,
        subject: subject || null,
        topic: topic || null,
        description: description || null,
        visibility: visibility || 'public',
        accessGroups: [],
      })
      .returning();

    console.log(`Document inserted with ID: ${insertedDocument.id}`);

    // Insert chunks with embeddings into database
    const chunkInserts = chunks.map((chunk, index) => ({
      documentId: insertedDocument.id,
      content: chunk.pageContent,
      embedding: embeddings[index],
      pageNumber: chunk.metadata.loc?.pageNumber || null,
      chunkIndex: index,
    }));

    await db.insert(documentChunks).values(chunkInserts);
    console.log(`Inserted ${chunkInserts.length} chunks into database`);

    return NextResponse.json({
      success: true,
      document: {
        id: insertedDocument.id,
        fileName: insertedDocument.fileName,
        fileType: insertedDocument.fileType,
        subject: insertedDocument.subject,
        topic: insertedDocument.topic,
        chunksCount: chunks.length,
      },
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload document',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

