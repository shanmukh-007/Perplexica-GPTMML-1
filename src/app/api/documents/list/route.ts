import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { documents, documentAccess, documentChunks } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { checkDocumentAccess } from '@/lib/utils/documentProcessing';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const trainerId = searchParams.get('trainerId');

    // If trainerId is provided, return all documents uploaded by that trainer
    if (trainerId) {
      const trainerDocuments = await db
        .select()
        .from(documents)
        .where(eq(documents.trainerId, trainerId))
        .orderBy(sql`${documents.uploadedAt} DESC`);

      // Get chunk counts for each document
      const documentsWithCounts = await Promise.all(
        trainerDocuments.map(async (doc) => {
          const chunks = await db
            .select({ count: sql<number>`count(*)` })
            .from(documentChunks)
            .where(eq(documentChunks.documentId, doc.id));

          return {
            ...doc,
            chunksCount: Number(chunks[0]?.count || 0),
          };
        })
      );

      return NextResponse.json({
        documents: documentsWithCounts,
        total: documentsWithCounts.length,
      });
    }

    // If studentId is provided, return accessible documents for that student
    if (studentId) {
      // Get all documents
      const allDocuments = await db.select().from(documents);

      // Get access records for the student
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

      // Get chunk counts for each accessible document
      const documentsWithCounts = await Promise.all(
        accessibleDocuments.map(async (doc) => {
          const chunks = await db
            .select({ count: sql<number>`count(*)` })
            .from(documentChunks)
            .where(eq(documentChunks.documentId, doc.id));

          return {
            id: doc.id,
            fileName: doc.fileName,
            fileType: doc.fileType,
            subject: doc.subject,
            topic: doc.topic,
            description: doc.description,
            visibility: doc.visibility,
            uploadedAt: doc.uploadedAt,
            chunksCount: Number(chunks[0]?.count || 0),
          };
        })
      );

      // Sort by upload date (newest first)
      documentsWithCounts.sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );

      return NextResponse.json({
        documents: documentsWithCounts,
        total: documentsWithCounts.length,
      });
    }

    // If neither studentId nor trainerId is provided, return error
    return NextResponse.json(
      { error: 'Either studentId or trainerId is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch documents',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

