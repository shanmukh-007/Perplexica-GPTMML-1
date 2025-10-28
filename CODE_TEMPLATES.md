# 💻 Code Templates & Examples

## 1. Database Schema Template

```typescript
// src/lib/db/schema.ts - Add these tables

// Trainer-Student Document Management
export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  trainerId: text('trainerId').notNull(),           // Trainer who uploaded
  fileName: text('fileName').notNull(),
  fileType: text('fileType', {                      // 'pdf', 'image', 'document'
    enum: ['pdf', 'image', 'document']
  }).notNull(),
  fileSize: integer('fileSize').notNull(),
  uploadedAt: text('uploadedAt').notNull(),
  embeddingStatus: text('embeddingStatus', {
    enum: ['pending', 'completed', 'failed']
  }).default('pending'),
  visibility: text('visibility', {                 // Access control
    enum: ['public', 'group', 'private']
  }).default('public'),
  accessGroups: text('accessGroups', { mode: 'json' }).default(sql`'[]'`), // Group IDs if visibility='group'
  subject: text('subject'),                        // e.g., 'History', 'Geography'
  topic: text('topic'),                            // e.g., 'Ancient India'
  description: text('description'),
  metadata: text('metadata', { mode: 'json' }).default(sql`'{}'`),
});

export const mcqs = sqliteTable('mcqs', {
  id: text('id').primaryKey(),
  documentId: text('documentId').notNull(),
  question: text('question').notNull(),
  options: text('options', { mode: 'json' }).$type<string[]>(),
  correctAnswer: integer('correctAnswer').notNull(),
  explanation: text('explanation'),
  difficulty: text('difficulty', { 
    enum: ['easy', 'medium', 'hard'] 
  }).default('medium'),
  createdAt: text('createdAt').notNull(),
});

export const mindmaps = sqliteTable('mindmaps', {
  id: text('id').primaryKey(),
  documentId: text('documentId').notNull(),
  title: text('title').notNull(),
  structure: text('structure', { mode: 'json' }),
  createdAt: text('createdAt').notNull(),
});

export const studySessions = sqliteTable('study_sessions', {
  id: text('id').primaryKey(),
  studentId: text('studentId').notNull(),          // Student user ID
  documentId: text('documentId').notNull(),
  questionsAttempted: integer('questionsAttempted').default(0),
  correctAnswers: integer('correctAnswers').default(0),
  createdAt: text('createdAt').notNull(),
});

// Image Management Table
export const documentImages = sqliteTable('document_images', {
  id: text('id').primaryKey(),
  documentId: text('documentId').notNull(),        // FK to documents
  imageUrl: text('imageUrl').notNull(),            // S3 or local storage URL
  imageName: text('imageName').notNull(),
  imageSize: integer('imageSize').notNull(),
  uploadedAt: text('uploadedAt').notNull(),
  pageNumber: integer('pageNumber'),               // For PDFs with images
  description: text('description'),                // Alt text / description
  embeddingStatus: text('embeddingStatus', {
    enum: ['pending', 'completed', 'failed']
  }).default('pending'),
});

// Access Control & Permissions
export const documentAccess = sqliteTable('document_access', {
  id: text('id').primaryKey(),
  documentId: text('documentId').notNull(),        // FK to documents
  studentId: text('studentId').notNull(),          // Student user ID
  accessLevel: text('accessLevel', {               // 'view', 'download', 'comment'
    enum: ['view', 'download', 'comment']
  }).default('view'),
  grantedAt: text('grantedAt').notNull(),
  grantedBy: text('grantedBy').notNull(),          // Trainer ID who granted access
});

// Document Chunks for RAG (Vector Store)
export const documentChunks = sqliteTable('document_chunks', {
  id: text('id').primaryKey(),
  documentId: text('documentId').notNull(),        // FK to documents
  chunkIndex: integer('chunkIndex').notNull(),
  content: text('content').notNull(),              // Chunk text
  embedding: text('embedding', { mode: 'json' }),  // Vector embedding
  metadata: text('metadata', { mode: 'json' }).default(sql`'{}'`),
  createdAt: text('createdAt').notNull(),
});
```

---

## 8. MCQ Generation Agent Template

```typescript
// src/lib/agents/mcqGeneratorAgent.ts

import { RunnableSequence, RunnableLambda } from '@langchain/core/runnables';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

const mcqGenerationPrompt = `
You are an expert exam question generator. Generate 5-10 multiple choice questions 
from the provided content for competitive exams like UPSC/SSC.

Content:
{content}

For each question, provide:
1. Question text
2. 4 options (A, B, C, D)
3. Correct answer (A/B/C/D)
4. Explanation (2-3 sentences)
5. Difficulty level (easy/medium/hard)

Format as JSON array:
[
  {
    "question": "...",
    "options": ["A: ...", "B: ...", "C: ...", "D: ..."],
    "correctAnswer": "A",
    "explanation": "...",
    "difficulty": "medium"
  }
]
`;

export const generateMCQs = async (
  content: string,
  llm: BaseChatModel
) => {
  const chain = RunnableSequence.from([
    ChatPromptTemplate.fromTemplate(mcqGenerationPrompt),
    llm,
    RunnableLambda.from(async (input: string) => {
      // Parse JSON from response
      const jsonMatch = input.match(/\[[\s\S]*\]/);
      return JSON.parse(jsonMatch?.[0] || '[]');
    }),
  ]);

  return chain.invoke({ content });
};
```

---

## 9. Mind Map Generation Agent Template

```typescript
// src/lib/agents/mindmapGeneratorAgent.ts

const mindmapGenerationPrompt = `
You are an expert at creating hierarchical mind maps for learning.
Create a mind map structure from the provided content.

Content:
{content}

Generate a hierarchical JSON structure:
{
  "title": "Main Topic",
  "children": [
    {
      "title": "Subtopic 1",
      "children": [
        { "title": "Detail 1" },
        { "title": "Detail 2" }
      ]
    }
  ]
}

Ensure:
- Max 3 levels deep
- 3-5 children per node
- Clear, concise titles
- Logical hierarchy
`;

export const generateMindMap = async (
  content: string,
  llm: BaseChatModel
) => {
  const chain = RunnableSequence.from([
    ChatPromptTemplate.fromTemplate(mindmapGenerationPrompt),
    llm,
    RunnableLambda.from(async (input: string) => {
      const jsonMatch = input.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch?.[0] || '{}');
    }),
  ]);

  return chain.invoke({ content });
};
```

---

## 4. Trainer Document Upload API Template

```typescript
// src/app/api/documents/trainer-upload.ts
// Trainer-only endpoint for uploading study materials

import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import db from '@/lib/db';
import { documents, documentImages } from '@/lib/db/schema';

export const POST = async (req: Request) => {
  try {
    // Verify trainer role (implement your auth check)
    const trainerId = req.headers.get('x-trainer-id');
    if (!trainerId) {
      return NextResponse.json(
        { error: 'Unauthorized: Trainer role required' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const subject = formData.get('subject') as string;
    const topic = formData.get('topic') as string;
    const description = formData.get('description') as string;
    const visibility = (formData.get('visibility') as string) || 'public';
    const accessGroups = formData.get('accessGroups')
      ? JSON.parse(formData.get('accessGroups') as string)
      : [];

    const uploadedDocs = [];

    for (const file of files) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}` },
          { status: 400 }
        );
      }

      // Determine file type
      let fileType: 'pdf' | 'image' | 'document' = 'document';
      if (file.type === 'application/pdf') fileType = 'pdf';
      else if (file.type.startsWith('image/')) fileType = 'image';

      // Save file
      const fileName = `${crypto.randomUUID()}-${file.name}`;
      const uploadDir = path.join(process.cwd(), 'public/uploads');
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);

      const buffer = await file.arrayBuffer();
      await writeFile(filePath, Buffer.from(buffer));

      // Create document record
      const docId = crypto.randomUUID();
      await db.insert(documents).values({
        id: docId,
        trainerId,
        fileName: file.name,
        fileType,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        embeddingStatus: 'pending',
        visibility,
        accessGroups: JSON.stringify(accessGroups),
        subject,
        topic,
        description,
        metadata: JSON.stringify({
          originalName: file.name,
          storagePath: `/uploads/${fileName}`,
        }),
      });

      uploadedDocs.push({
        id: docId,
        fileName: file.name,
        fileType,
        fileSize: file.size,
      });
    }

    return NextResponse.json({
      success: true,
      documents: uploadedDocs,
      message: `${uploadedDocs.length} document(s) uploaded successfully`,
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload documents' },
      { status: 500 }
    );
  }
};
```

---

## 5. Student Document Search API Template

```typescript
// src/app/api/documents/student-search.ts
// Students search across all trainer-uploaded documents

import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { documents, documentChunks } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';

export const POST = async (req: Request) => {
  try {
    const studentId = req.headers.get('x-student-id');
    if (!studentId) {
      return NextResponse.json(
        { error: 'Unauthorized: Student ID required' },
        { status: 401 }
      );
    }

    const { query, subject, topic, limit = 10 } = await req.json();

    // Get accessible documents (public or in student's groups)
    const accessibleDocs = await db.query.documents.findMany({
      where: (docs, { eq, or }) => or(
        eq(docs.visibility, 'public'),
        // Add group membership check here
      ),
    });

    // Search document chunks
    const results = await db.query.documentChunks.findMany({
      where: (chunks, { inArray }) => inArray(
        chunks.documentId,
        accessibleDocs.map(d => d.id)
      ),
      limit,
    });

    // Enhance with document metadata
    const enrichedResults = await Promise.all(
      results.map(async (chunk) => {
        const doc = accessibleDocs.find(d => d.id === chunk.documentId);
        return {
          ...chunk,
          document: {
            id: doc?.id,
            fileName: doc?.fileName,
            subject: doc?.subject,
            topic: doc?.topic,
            trainerId: doc?.trainerId,
          },
        };
      })
    );

    return NextResponse.json({
      results: enrichedResults,
      total: enrichedResults.length,
    });
  } catch (error) {
    console.error('Document search error:', error);
    return NextResponse.json(
      { error: 'Failed to search documents' },
      { status: 500 }
    );
  }
};
```

---

## 6. Image Upload & Management API Template

```typescript
// src/app/api/documents/upload-image.ts
// Upload images to documents

import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import db from '@/lib/db';
import { documentImages } from '@/lib/db/schema';

export const POST = async (req: Request) => {
  try {
    const trainerId = req.headers.get('x-trainer-id');
    if (!trainerId) {
      return NextResponse.json(
        { error: 'Unauthorized: Trainer role required' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const image = formData.get('image') as File;
    const documentId = formData.get('documentId') as string;
    const pageNumber = formData.get('pageNumber') as string;
    const description = formData.get('description') as string;

    if (!image || !documentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate image type
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type: must be an image' },
        { status: 400 }
      );
    }

    // Save image
    const fileName = `${crypto.randomUUID()}-${image.name}`;
    const uploadDir = path.join(process.cwd(), 'public/uploads/images');
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);

    const buffer = await image.arrayBuffer();
    await writeFile(filePath, Buffer.from(buffer));

    // Create image record
    const imageId = crypto.randomUUID();
    await db.insert(documentImages).values({
      id: imageId,
      documentId,
      imageName: image.name,
      imageUrl: `/uploads/images/${fileName}`,
      imageSize: image.size,
      uploadedAt: new Date().toISOString(),
      pageNumber: pageNumber ? parseInt(pageNumber) : undefined,
      description,
      embeddingStatus: 'pending',
    });

    return NextResponse.json({
      success: true,
      image: {
        id: imageId,
        url: `/uploads/images/${fileName}`,
        name: image.name,
        size: image.size,
      },
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
};
```

---

## 7. MCQ Generation Agent Template

import { NextResponse } from 'next/server';
import { generateMCQs } from '@/lib/agents/mcqGeneratorAgent';
import ModelRegistry from '@/lib/models/registry';
import db from '@/lib/db';
import { mcqs } from '@/lib/db/schema';
import crypto from 'crypto';

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { documentId, chatModel } = body;

    // Get document content from DB
    const doc = await db.query.documents.findFirst({
      where: (docs, { eq }) => eq(docs.id, documentId),
    });

    if (!doc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Load LLM
    const registry = new ModelRegistry();
    const llm = await registry.loadChatModel(
      chatModel.providerId,
      chatModel.key
    );

    // Generate MCQs
    const generatedMCQs = await generateMCQs(doc.content, llm);

    // Store in database
    for (const mcq of generatedMCQs) {
      await db.insert(mcqs).values({
        id: crypto.randomUUID(),
        documentId,
        question: mcq.question,
        options: mcq.options,
        correctAnswer: mcq.correctAnswer,
        explanation: mcq.explanation,
        difficulty: mcq.difficulty,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ mcqs: generatedMCQs });
  } catch (error) {
    console.error('MCQ generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate MCQs' },
      { status: 500 }
    );
  }
};
```

---

## 10. Frontend Component Template

```typescript
// src/components/ExamPrep/MCQQuiz.tsx

'use client';

import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface MCQ {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
}

export const MCQQuiz = ({ mcqs }: { mcqs: MCQ[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const current = mcqs[currentIndex];
  const isCorrect = selected === current.correctAnswer;

  const handleAnswer = (option: string) => {
    if (!answered) {
      setSelected(option);
      setAnswered(true);
      if (option === current.correctAnswer) {
        setScore(score + 1);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < mcqs.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Question {currentIndex + 1} of {mcqs.length}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / mcqs.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-4">{current.question}</h3>

        <div className="space-y-3 mb-6">
          {current.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(option)}
              disabled={answered}
              className={`w-full p-3 text-left rounded-lg border-2 transition ${
                selected === option
                  ? isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-blue-500'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {answered && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="font-semibold mb-2">Explanation:</p>
            <p>{current.explanation}</p>
          </div>
        )}

        {answered && currentIndex < mcqs.length - 1 && (
          <button
            onClick={handleNext}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Next Question
          </button>
        )}
      </div>

      <div className="mt-4 text-center">
        <p className="text-lg font-semibold">
          Score: {score}/{mcqs.length}
        </p>
      </div>
    </div>
  );
};
```

---

## 11. Exam Prep Focus Mode Template

```typescript
// Add to src/lib/search/index.ts

import ExamPrepAgent from '@/lib/search/examPrepAgent';

export const searchHandlers: Record<string, MetaSearchAgent> = {
  // ... existing handlers ...
  
  examPrep: new ExamPrepAgent({
    activeEngines: [],
    queryGeneratorPrompt: prompts.examPrepRetrieverPrompt,
    responsePrompt: prompts.examPrepResponsePrompt,
    queryGeneratorFewShots: prompts.examPrepFewShots,
    rerank: true,
    rerankThreshold: 0.3,
    searchWeb: true,
  }),
};
```

---

## Key Integration Points

1. **Database** - Use Drizzle ORM like existing code
2. **LLM** - Use ModelRegistry for loading models
3. **Embeddings** - Use existing embedding infrastructure
4. **UI** - Follow Tailwind + React patterns
5. **API** - Use NextResponse for responses
6. **Error Handling** - Use try-catch with proper logging

---

## Testing Example

```typescript
// Test MCQ generation
describe('MCQ Generation', () => {
  it('should generate valid MCQs', async () => {
    const content = 'Sample study material...';
    const mcqs = await generateMCQs(content, mockLLM);
    
    expect(mcqs).toHaveLength(5);
    expect(mcqs[0]).toHaveProperty('question');
    expect(mcqs[0]).toHaveProperty('options');
    expect(mcqs[0]).toHaveProperty('correctAnswer');
  });
});
```

