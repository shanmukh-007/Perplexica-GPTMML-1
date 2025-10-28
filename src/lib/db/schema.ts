import { text, integer, pgTable, serial, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { Document } from '@langchain/core/documents';

// Keep existing tables for backward compatibility
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  role: text('type').notNull(),
  chatId: text('chatId').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  messageId: text('messageId').notNull(),
  content: text('content'),
  sources: jsonb('sources').$type<Document[]>().default([]),
});

interface File {
  name: string;
  fileId: string;
}

export const chats = pgTable('chats', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  focusMode: text('focusMode').notNull(),
  files: jsonb('files').$type<File[]>().default([]),
});

// New tables for Trainer-Student Exam Prep Platform

// Documents table - stores uploaded PDFs and documents
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  trainerId: text('trainerId').notNull(), // ID of the trainer who uploaded
  fileName: text('fileName').notNull(),
  fileType: text('fileType').notNull(), // 'pdf', 'docx', 'txt', 'image'
  fileUrl: text('fileUrl').notNull(), // Path or URL to the file
  fileSize: integer('fileSize'), // File size in bytes

  // Metadata
  subject: text('subject'), // e.g., 'History', 'Geography', 'Polity'
  topic: text('topic'), // e.g., 'Ancient India', 'World Geography'
  description: text('description'), // Brief description of the document

  // Access control
  visibility: text('visibility').notNull().default('public'), // 'public', 'group', 'private'
  accessGroups: jsonb('accessGroups').$type<string[]>().default([]), // Array of group IDs

  // Timestamps
  uploadedAt: timestamp('uploadedAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Document images table - stores images associated with documents
export const documentImages = pgTable('document_images', {
  id: serial('id').primaryKey(),
  documentId: integer('documentId').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  imageUrl: text('imageUrl').notNull(), // Cloudinary URL or local path
  pageNumber: integer('pageNumber'), // Page number in the document (if applicable)
  description: text('description'), // Optional description of the image
  uploadedAt: timestamp('uploadedAt').notNull().defaultNow(),
});

// Document access table - tracks student access to documents
export const documentAccess = pgTable('document_access', {
  id: serial('id').primaryKey(),
  documentId: integer('documentId').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  studentId: text('studentId').notNull(), // ID of the student
  accessLevel: text('accessLevel').notNull().default('view'), // 'view', 'download', 'comment'
  grantedAt: timestamp('grantedAt').notNull().defaultNow(),
  grantedBy: text('grantedBy'), // ID of the trainer who granted access
});

// Document chunks table - stores chunked text with embeddings for RAG
export const documentChunks = pgTable('document_chunks', {
  id: serial('id').primaryKey(),
  documentId: integer('documentId').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  content: text('content').notNull(), // The actual text chunk
  embedding: jsonb('embedding').$type<number[]>(), // Vector embedding (stored as JSON array)
  pageNumber: integer('pageNumber'), // Page number where this chunk appears
  chunkIndex: integer('chunkIndex').notNull(), // Order of the chunk in the document
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// MCQs table - stores generated multiple choice questions
export const mcqs = pgTable('mcqs', {
  id: serial('id').primaryKey(),
  documentId: integer('documentId').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  options: jsonb('options').$type<string[]>().notNull(), // Array of 4 options
  correctAnswer: integer('correctAnswer').notNull(), // Index of correct option (0-3)
  explanation: text('explanation'), // Explanation of the correct answer
  difficulty: text('difficulty').default('medium'), // 'easy', 'medium', 'hard'
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// Mind maps table - stores generated mind map structures
export const mindmaps = pgTable('mindmaps', {
  id: serial('id').primaryKey(),
  documentId: integer('documentId').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  structure: jsonb('structure').notNull(), // Hierarchical mind map structure
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Study sessions table - tracks student progress and quiz attempts
export const studySessions = pgTable('study_sessions', {
  id: serial('id').primaryKey(),
  studentId: text('studentId').notNull(), // ID of the student
  documentId: integer('documentId').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  sessionType: text('sessionType').notNull(), // 'mcq', 'mindmap', 'reading'

  // MCQ session data
  questionsAttempted: integer('questionsAttempted').default(0),
  correctAnswers: integer('correctAnswers').default(0),
  incorrectAnswers: integer('incorrectAnswers').default(0),
  score: integer('score').default(0), // Percentage score

  // Session metadata
  startedAt: timestamp('startedAt').notNull().defaultNow(),
  completedAt: timestamp('completedAt'),
  duration: integer('duration'), // Duration in seconds
});
