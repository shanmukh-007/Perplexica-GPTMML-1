CREATE TABLE "chats" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"focusMode" text NOT NULL,
	"files" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "document_access" (
	"id" serial PRIMARY KEY NOT NULL,
	"documentId" integer NOT NULL,
	"studentId" text NOT NULL,
	"accessLevel" text DEFAULT 'view' NOT NULL,
	"grantedAt" timestamp DEFAULT now() NOT NULL,
	"grantedBy" text
);
--> statement-breakpoint
CREATE TABLE "document_chunks" (
	"id" serial PRIMARY KEY NOT NULL,
	"documentId" integer NOT NULL,
	"content" text NOT NULL,
	"embedding" jsonb,
	"pageNumber" integer,
	"chunkIndex" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"documentId" integer NOT NULL,
	"imageUrl" text NOT NULL,
	"pageNumber" integer,
	"description" text,
	"uploadedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"trainerId" text NOT NULL,
	"fileName" text NOT NULL,
	"fileType" text NOT NULL,
	"fileUrl" text NOT NULL,
	"fileSize" integer,
	"subject" text,
	"topic" text,
	"description" text,
	"visibility" text DEFAULT 'public' NOT NULL,
	"accessGroups" jsonb DEFAULT '[]'::jsonb,
	"uploadedAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mcqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"documentId" integer NOT NULL,
	"question" text NOT NULL,
	"options" jsonb NOT NULL,
	"correctAnswer" integer NOT NULL,
	"explanation" text,
	"difficulty" text DEFAULT 'medium',
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"chatId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"messageId" text NOT NULL,
	"content" text,
	"sources" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "mindmaps" (
	"id" serial PRIMARY KEY NOT NULL,
	"documentId" integer NOT NULL,
	"title" text NOT NULL,
	"structure" jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"studentId" text NOT NULL,
	"documentId" integer NOT NULL,
	"sessionType" text NOT NULL,
	"questionsAttempted" integer DEFAULT 0,
	"correctAnswers" integer DEFAULT 0,
	"incorrectAnswers" integer DEFAULT 0,
	"score" integer DEFAULT 0,
	"startedAt" timestamp DEFAULT now() NOT NULL,
	"completedAt" timestamp,
	"duration" integer
);
--> statement-breakpoint
ALTER TABLE "document_access" ADD CONSTRAINT "document_access_documentId_documents_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_documentId_documents_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_images" ADD CONSTRAINT "document_images_documentId_documents_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mcqs" ADD CONSTRAINT "mcqs_documentId_documents_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mindmaps" ADD CONSTRAINT "mindmaps_documentId_documents_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_documentId_documents_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;