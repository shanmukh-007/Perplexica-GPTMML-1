# 🔌 External APIs & Services Guide

Complete guide for all external dependencies, APIs, and services needed for the Trainer-Student Exam Prep Platform.

---

## 1. 🗄️ Database - Neon PostgreSQL + Drizzle ORM

### **Current Setup (SQLite)**
Perplexica currently uses **SQLite** with **Drizzle ORM**:

<augment_code_snippet path="src/lib/db/index.ts" mode="EXCERPT">
````typescript
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
const sqlite = new Database(path.join(DATA_DIR, './data/db.sqlite'));
const db = drizzle(sqlite, { schema: schema });
````
</augment_code_snippet>

### **Migration to Neon PostgreSQL** ✅

#### **What You Need:**
- **Neon Account**: https://neon.tech (Free tier available)
- **Connection String**: `postgresql://user:password@host/database?sslmode=require`

#### **Installation:**
```bash
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
```

#### **Configuration Changes:**

**1. Update `src/lib/db/index.ts`:**
```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema: schema });

export default db;
```

**2. Update `drizzle.config.ts`:**
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',  // Changed from 'sqlite'
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

**3. Update `src/lib/db/schema.ts`:**
```typescript
// Change imports
import { text, integer, pgTable, serial, timestamp } from 'drizzle-orm/pg-core';

// Change table definitions from sqliteTable to pgTable
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),  // Auto-increment
  trainerId: text('trainerId').notNull(),
  // ... rest of fields
  uploadedAt: timestamp('uploadedAt').defaultNow(),
});
```

**4. Environment Variables (`.env`):**
```bash
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
```

#### **Migration Commands:**
```bash
# Generate migration
npx drizzle-kit generate

# Push to Neon database
npx drizzle-kit push

# Or run migrations
npx drizzle-kit migrate
```

#### **Neon Features You Can Use:**
- ✅ **Serverless**: Auto-scaling, pay-per-use
- ✅ **Branching**: Create database branches for testing
- ✅ **Connection Pooling**: Built-in
- ✅ **Vector Extension**: For pgvector (embeddings)

---

## 2. 🤖 LLM APIs - Google Gemini

### **Current Setup**
Perplexica already has **Gemini integration**:

<augment_code_snippet path="src/lib/models/providers/gemini.ts" mode="EXCERPT">
````typescript
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

class GeminiProvider extends BaseModelProvider<GeminiConfig> {
  async loadChatModel(key: string): Promise<BaseChatModel> {
    return new ChatGoogleGenerativeAI({
      apiKey: this.config.apiKey,
      temperature: 0.7,
      model: key,
    });
  }
}
````
</augment_code_snippet>

### **What You Need:**

#### **1. Gemini API Key**
- **Get it from**: https://makersuite.google.com/app/apikey
- **Free tier**: 60 requests/minute
- **Environment Variable**: `GEMINI_API_KEY`

#### **2. Available Models:**

**Chat Models (for MCQ, Mind Map, Responses):**
- `gemini-2.0-flash-exp` - Latest, fastest
- `gemini-1.5-pro` - Best quality
- `gemini-1.5-flash` - Fast, cost-effective

**Embedding Models (for RAG/Search):**
- `text-embedding-004` - Latest embedding model
- `embedding-001` - Legacy model

#### **3. Installation:**
```bash
npm install @langchain/google-genai
```

#### **4. Configuration:**

**Environment Variables (`.env`):**
```bash
GEMINI_API_KEY=your_api_key_here
```

**Usage in Code:**
```typescript
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

// For MCQ/Mind Map Generation
const chatModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-2.0-flash-exp',
  temperature: 0.7,
});

// For Document Embeddings (RAG)
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'text-embedding-004',
});
```

#### **5. Use Cases:**

| Feature | Model | Purpose |
|---------|-------|---------|
| PDF RAG | `text-embedding-004` | Generate embeddings for document chunks |
| MCQ Generation | `gemini-2.0-flash-exp` | Generate questions from content |
| Mind Map Generation | `gemini-1.5-pro` | Create hierarchical structures |
| Student Queries | `gemini-2.0-flash-exp` | Answer student questions |
| Search | `text-embedding-004` | Vector similarity search |

#### **6. Reuse Existing ModelRegistry:**

Perplexica already has a **ModelRegistry** system:

<augment_code_snippet path="src/lib/models/registry.ts" mode="EXCERPT">
````typescript
class ModelRegistry {
  async loadChatModel(providerId: string, modelKey: string): Promise<BaseChatModel>
  async loadEmbeddingModel(providerId: string, modelKey: string): Promise<Embeddings>
}
````
</augment_code_snippet>

**Usage:**
```typescript
const registry = new ModelRegistry();
const chatModel = await registry.loadChatModel('gemini-provider-id', 'gemini-2.0-flash-exp');
const embeddings = await registry.loadEmbeddingModel('gemini-provider-id', 'text-embedding-004');
```

---

## 3. 📄 PDF Processing & Text Extraction

### **Current Setup**
Perplexica already has **PDF processing**:

<augment_code_snippet path="src/app/api/uploads/route.ts" mode="EXCERPT">
````typescript
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

const loader = new PDFLoader(filePath);
const docs = await loader.load();
const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 100 });
const chunks = await splitter.splitDocuments(docs);
````
</augment_code_snippet>

### **What You Need:**

#### **1. LangChain Document Loaders**
```bash
npm install @langchain/community
npm install @langchain/textsplitters
npm install pdf-parse  # For PDF parsing
```

#### **2. Supported File Types:**
- ✅ **PDF** - `PDFLoader`
- ✅ **DOCX** - `DocxLoader`
- ✅ **TXT** - Direct file read
- ✅ **Images** - For trainer uploads (new)

#### **3. Text Splitting Strategy:**
```typescript
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,        // Characters per chunk
  chunkOverlap: 100,     // Overlap between chunks
});
```

#### **4. Reuse Existing Code:**
- **File Upload**: `src/app/api/uploads/route.ts`
- **PDF Processing**: Already implemented
- **Embedding Generation**: Already implemented

---

## 4. 🖼️ Image Storage & Management

### **Options:**

#### **Option 1: Local File System** (Simplest)
```typescript
const uploadDir = path.join(process.cwd(), 'public/uploads/images');
await mkdir(uploadDir, { recursive: true });
const imagePath = path.join(uploadDir, fileName);
await writeFile(imagePath, buffer);

// Access via: /uploads/images/filename.jpg
```

**Pros:** Simple, no external service
**Cons:** Not scalable, no CDN

#### **Option 2: Cloudinary** (Recommended)
```bash
npm install cloudinary
```

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const result = await cloudinary.uploader.upload(filePath, {
  folder: 'exam-prep/documents',
});

// result.secure_url - Image URL
```

**Free Tier:** 25 GB storage, 25 GB bandwidth/month
**Get it from:** https://cloudinary.com

#### **Option 3: AWS S3** (Enterprise)
```bash
npm install @aws-sdk/client-s3
```

**Requires:** AWS account, S3 bucket, IAM credentials

---

## 5. 🔍 Vector Embeddings & Search

### **Current Setup**
Perplexica already has **vector similarity search**:

<augment_code_snippet path="src/lib/search/metaSearchAgent.ts" mode="EXCERPT">
````typescript
import computeSimilarity from '../utils/computeSimilarity';

const queryEmbedding = await embeddings.embedQuery(query);
const docEmbeddings = await embeddings.embedDocuments(docs);
const similarity = computeSimilarity(queryEmbedding, docEmbedding);
````
</augment_code_snippet>

### **What You Need:**

#### **1. Embedding Generation:**
- **Gemini Embeddings**: `text-embedding-004` (Already available)
- **Transformers.js**: Local embeddings (Already available)

#### **2. Vector Storage Options:**

**Option A: In-Database (Neon + pgvector)** ✅ Recommended
```bash
# Enable pgvector extension in Neon
CREATE EXTENSION vector;
```

```typescript
import { vector } from 'drizzle-orm/pg-core';

export const documentChunks = pgTable('document_chunks', {
  id: serial('id').primaryKey(),
  documentId: text('documentId').notNull(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 768 }),  // Gemini embedding size
});
```

**Query:**
```typescript
const results = await db.execute(sql`
  SELECT * FROM document_chunks
  ORDER BY embedding <-> ${queryEmbedding}
  LIMIT 10
`);
```

**Option B: In-Memory (Current Approach)**
- Store embeddings as JSON in database
- Compute similarity in application code
- Works for small datasets

#### **3. Similarity Computation:**
```bash
npm install compute-cosine-similarity
```

Already implemented in `src/lib/utils/computeSimilarity.ts`

---

## 6. 🌐 Web Search - SearXNG

### **Current Setup**
Perplexica uses **SearXNG** for web search:

<augment_code_snippet path="src/lib/config/index.ts" mode="EXCERPT">
````typescript
search: [
  {
    name: 'SearXNG URL',
    key: 'searxngURL',
    env: 'SEARXNG_API_URL',
  },
]
````
</augment_code_snippet>

### **What You Need:**

#### **1. SearXNG Instance:**

**Option A: Use Perplexica's Docker Setup** (Easiest)
```bash
docker-compose up -d
# SearXNG runs at http://localhost:4000
```

**Option B: Public Instance**
- Use public SearXNG instances (not recommended for production)
- List: https://searx.space

**Option C: Self-Hosted**
```bash
docker run -d -p 4000:8080 searxng/searxng
```

#### **2. Configuration:**
```bash
SEARXNG_API_URL=http://localhost:4000
```

#### **3. Usage:**
Already implemented in Perplexica's search agents.

---

## 7. 🔐 Authentication & Authorization

### **Options:**

#### **Option 1: NextAuth.js** (Recommended)
```bash
npm install next-auth
```

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        // Verify credentials
        // Return user with role: 'trainer' or 'student'
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) token.role = user.role;
      return token;
    },
  },
};
```

**Features:**
- ✅ Session management
- ✅ JWT tokens
- ✅ Role-based access
- ✅ Multiple providers (Google, GitHub, etc.)

#### **Option 2: Clerk** (Easiest)
```bash
npm install @clerk/nextjs
```

**Free Tier:** 10,000 MAU
**Get it from:** https://clerk.com

**Features:**
- ✅ Pre-built UI
- ✅ User management
- ✅ Role-based access
- ✅ Organizations (for groups)

#### **Option 3: Custom JWT**
```bash
npm install jsonwebtoken bcrypt
```

Simple but requires more implementation.

---

## 8. 📦 Complete Dependency List

### **Required NPM Packages:**

```json
{
  "dependencies": {
    "@neondatabase/serverless": "^0.9.0",
    "drizzle-orm": "^0.30.0",
    "@langchain/google-genai": "^0.0.25",
    "@langchain/community": "^0.2.0",
    "@langchain/textsplitters": "^0.0.3",
    "pdf-parse": "^1.1.1",
    "compute-cosine-similarity": "^1.1.0",
    "next-auth": "^4.24.0",
    "cloudinary": "^2.0.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.20.0"
  }
}
```

---

## 9. 🔑 Environment Variables

Create `.env` file:

```bash
# Database
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Image Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Search
SEARXNG_API_URL=http://localhost:4000

# Authentication (NextAuth)
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
```

---

## 10. ✅ Summary Checklist

- [ ] **Neon Account** - Create at https://neon.tech
- [ ] **Gemini API Key** - Get from https://makersuite.google.com/app/apikey
- [ ] **Cloudinary Account** (Optional) - For image storage
- [ ] **SearXNG** - Use Docker setup (already in Perplexica)
- [ ] **NextAuth** - Install for authentication
- [ ] **Install Dependencies** - Run `npm install`
- [ ] **Configure `.env`** - Add all environment variables
- [ ] **Migrate Database** - Run `npx drizzle-kit push`

---

## 11. 🚀 Quick Start Commands

```bash
# 1. Install dependencies
npm install @neondatabase/serverless drizzle-orm @langchain/google-genai next-auth cloudinary

# 2. Install dev dependencies
npm install -D drizzle-kit

# 3. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 4. Generate database schema
npx drizzle-kit generate

# 5. Push to Neon
npx drizzle-kit push

# 6. Start development
npm run dev
```

---

**All external dependencies are now documented! Ready to implement! 🎉**

