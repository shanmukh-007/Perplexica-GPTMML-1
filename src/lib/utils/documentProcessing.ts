import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import fs from 'fs';

/**
 * Extract text content from a document file
 * @param filePath - Path to the document file
 * @param fileType - Type of file (pdf, docx, txt)
 * @returns Array of LangChain Document objects
 */
export async function extractTextFromDocument(
  filePath: string,
  fileType: string
): Promise<Document[]> {
  let docs: Document[] = [];

  try {
    if (fileType === 'pdf') {
      const loader = new PDFLoader(filePath);
      docs = await loader.load();
    } else if (fileType === 'docx') {
      const loader = new DocxLoader(filePath);
      docs = await loader.load();
    } else if (fileType === 'txt') {
      const text = fs.readFileSync(filePath, 'utf-8');
      docs = [
        new Document({
          pageContent: text,
          metadata: { source: filePath },
        }),
      ];
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    return docs;
  } catch (error) {
    console.error('Error extracting text from document:', error);
    throw new Error(`Failed to extract text from ${fileType} file`);
  }
}

/**
 * Split documents into chunks for embedding
 * @param docs - Array of LangChain Document objects
 * @param chunkSize - Size of each chunk (default: 500)
 * @param chunkOverlap - Overlap between chunks (default: 100)
 * @returns Array of chunked Document objects
 */
export async function chunkDocuments(
  docs: Document[],
  chunkSize: number = 500,
  chunkOverlap: number = 100
): Promise<Document[]> {
  try {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
    });

    const chunks = await splitter.splitDocuments(docs);
    return chunks;
  } catch (error) {
    console.error('Error chunking documents:', error);
    throw new Error('Failed to chunk documents');
  }
}

/**
 * Calculate cosine similarity between two vectors
 * @param vecA - First vector
 * @param vecB - Second vector
 * @returns Cosine similarity score (0-1)
 */
export function cosineSimilarity(vecA: number[] | unknown, vecB: number[] | unknown): number {
  // Coerce inputs into flat number arrays
  const toNumberArray = (v: any): number[] => {
    if (!Array.isArray(v)) return [];
    // Flatten one level if nested
    const flat = Array.isArray(v[0]) ? (v as any[]).flat() : v;
    return (flat as any[]).map((x) => (typeof x === 'number' ? x : Number(x)));
  };

  const a = toNumberArray(vecA);
  const b = toNumberArray(vecB);

  if (a.length === 0 || b.length === 0) return 0;
  if (a.length !== b.length) {
    // Gracefully handle dimension mismatch by returning 0 similarity
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    const ai = a[i];
    const bi = b[i];
    if (!Number.isFinite(ai) || !Number.isFinite(bi)) continue;
    dotProduct += ai * bi;
    normA += ai * ai;
    normB += bi * bi;
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Find top K most similar chunks based on cosine similarity
 * @param queryEmbedding - Embedding vector of the query
 * @param chunks - Array of chunks with embeddings
 * @param topK - Number of top results to return (default: 5)
 * @returns Array of chunks sorted by similarity score
 */
export function findSimilarChunks(
  queryEmbedding: number[],
  chunks: Array<{ id: number; content: string; embedding: number[]; documentId: number; pageNumber: number | null }>,
  topK: number = 5
): Array<{ id: number; content: string; similarity: number; documentId: number; pageNumber: number | null }> {
  // Calculate similarity scores for all chunks with safety against dim mismatch
  const chunksWithScores = chunks
    .map((chunk) => {
      try {
        return {
          id: chunk.id,
          content: chunk.content,
          documentId: chunk.documentId,
          pageNumber: chunk.pageNumber,
          similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
        };
      } catch (e) {
        console.warn(
          `Skipping chunk ${chunk.id} due to embedding dimension mismatch: query=${queryEmbedding.length}, chunk=${chunk.embedding?.length}`,
        );
        return null;
      }
    })
    .filter((c): c is {
      id: number;
      content: string;
      similarity: number;
      documentId: number;
      pageNumber: number | null;
    } => c !== null);

  if (chunksWithScores.length === 0) return [];

  // Sort by similarity score (descending) and return top K
  return chunksWithScores
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

/**
 * Format chunks into context string for LLM prompt
 * @param chunks - Array of chunks with similarity scores
 * @param includeMetadata - Whether to include metadata (default: true)
 * @returns Formatted context string
 */
export function formatChunksAsContext(
  chunks: Array<{ content: string; similarity: number; pageNumber: number | null }>,
  includeMetadata: boolean = true
): string {
  if (chunks.length === 0) {
    return 'No relevant context found.';
  }

  return chunks
    .map((chunk, index) => {
      const metadata = includeMetadata && chunk.pageNumber
        ? ` (Page ${chunk.pageNumber}, Relevance: ${(chunk.similarity * 100).toFixed(1)}%)`
        : '';
      return `[Context ${index + 1}]${metadata}\n${chunk.content}`;
    })
    .join('\n\n---\n\n');
}

/**
 * Check if a student has access to a document
 * @param documentId - ID of the document
 * @param studentId - ID of the student
 * @param documentVisibility - Visibility setting of the document
 * @param documentAccessRecords - Array of access records for the document
 * @returns Boolean indicating if student has access
 */
export function checkDocumentAccess(
  documentId: number,
  studentId: string,
  documentVisibility: string,
  documentAccessRecords: Array<{ studentId: string; documentId: number }>
): boolean {
  // Public documents are accessible to all
  if (documentVisibility === 'public') {
    return true;
  }

  // Private documents require explicit access
  if (documentVisibility === 'private') {
    return documentAccessRecords.some(
      (record) => record.studentId === studentId && record.documentId === documentId
    );
  }

  // Group documents require explicit access
  if (documentVisibility === 'group') {
    return documentAccessRecords.some(
      (record) => record.studentId === studentId && record.documentId === documentId
    );
  }

  return false;
}

/**
 * Validate file type
 * @param fileName - Name of the file
 * @param allowedTypes - Array of allowed file extensions
 * @returns Boolean indicating if file type is valid
 */
export function validateFileType(
  fileName: string,
  allowedTypes: string[] = ['pdf', 'docx', 'txt']
): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
}

/**
 * Get file extension from filename
 * @param fileName - Name of the file
 * @returns File extension (lowercase)
 */
export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

/**
 * Generate unique filename
 * @param originalName - Original filename
 * @returns Unique filename with timestamp
 */
export function generateUniqueFileName(originalName: string): string {
  const extension = getFileExtension(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}.${extension}`;
}

