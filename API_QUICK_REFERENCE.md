# 🚀 API Quick Reference Card

Quick reference for all external APIs and services needed for the Trainer-Student Exam Prep Platform.

---

## 📋 Required Services

| Service | Purpose | Free Tier | Sign Up |
|---------|---------|-----------|---------|
| **Neon** | PostgreSQL Database | 10 GB storage | https://neon.tech |
| **Google Gemini** | LLM & Embeddings | 60 req/min | https://makersuite.google.com/app/apikey |
| **Cloudinary** | Image Storage | 25 GB/month | https://cloudinary.com |
| **SearXNG** | Web Search | Self-hosted | Docker (included) |
| **NextAuth** | Authentication | Unlimited | NPM package |

---

## 🔑 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Image Storage (Optional - use local if not needed)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Search (Already configured in Perplexica)
SEARXNG_API_URL=http://localhost:4000

# Authentication
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
```

---

## 📦 NPM Packages

```bash
# Core Dependencies
npm install @neondatabase/serverless drizzle-orm
npm install @langchain/google-genai
npm install @langchain/community @langchain/textsplitters
npm install pdf-parse compute-cosine-similarity
npm install next-auth
npm install cloudinary  # Optional

# Dev Dependencies
npm install -D drizzle-kit
```

---

## 🗄️ Database Setup (Neon)

### 1. Create Account
- Go to https://neon.tech
- Sign up (free tier)
- Create new project

### 2. Get Connection String
```
postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
```

### 3. Update Configuration

**`src/lib/db/index.ts`:**
```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema: schema });
```

**`drizzle.config.ts`:**
```typescript
export default defineConfig({
  dialect: 'postgresql',  // Changed from 'sqlite'
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

### 4. Migrate Schema
```bash
npx drizzle-kit generate
npx drizzle-kit push
```

---

## 🤖 Gemini API Setup

### 1. Get API Key
- Go to https://makersuite.google.com/app/apikey
- Create API key
- Copy to `.env`

### 2. Available Models

**Chat Models:**
- `gemini-2.0-flash-exp` - Latest, fastest
- `gemini-1.5-pro` - Best quality
- `gemini-1.5-flash` - Fast, cost-effective

**Embedding Models:**
- `text-embedding-004` - Latest (768 dimensions)
- `embedding-001` - Legacy

### 3. Usage

```typescript
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

// Chat Model (MCQ, Mind Map)
const chatModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-2.0-flash-exp',
  temperature: 0.7,
});

// Embeddings (RAG, Search)
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'text-embedding-004',
});
```

### 4. Reuse ModelRegistry

```typescript
const registry = new ModelRegistry();
const chatModel = await registry.loadChatModel('gemini-id', 'gemini-2.0-flash-exp');
const embeddings = await registry.loadEmbeddingModel('gemini-id', 'text-embedding-004');
```

---

## 🖼️ Image Storage

### Option 1: Local (Simple)
```typescript
const uploadDir = path.join(process.cwd(), 'public/uploads/images');
await mkdir(uploadDir, { recursive: true });
await writeFile(path.join(uploadDir, fileName), buffer);
// Access: /uploads/images/filename.jpg
```

### Option 2: Cloudinary (Recommended)
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

---

## 📄 PDF Processing (Already Available)

```typescript
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

// Load PDF
const loader = new PDFLoader(filePath);
const docs = await loader.load();

// Split into chunks
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 100,
});
const chunks = await splitter.splitDocuments(docs);

// Generate embeddings
const embeddings = await embeddingModel.embedDocuments(
  chunks.map(c => c.pageContent)
);
```

---

## 🔍 Vector Search

### Option 1: Neon + pgvector (Recommended)

**Enable Extension:**
```sql
CREATE EXTENSION vector;
```

**Schema:**
```typescript
import { vector } from 'drizzle-orm/pg-core';

export const documentChunks = pgTable('document_chunks', {
  id: serial('id').primaryKey(),
  embedding: vector('embedding', { dimensions: 768 }),
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

### Option 2: In-Memory (Current)

```typescript
import computeSimilarity from '@/lib/utils/computeSimilarity';

const queryEmbedding = await embeddings.embedQuery(query);
const similarity = computeSimilarity(queryEmbedding, docEmbedding);
```

---

## 🔐 Authentication (NextAuth)

### Setup

```bash
npm install next-auth
```

**`src/app/api/auth/[...nextauth]/route.ts`:**
```typescript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        // Verify user
        return { id: '1', email: 'user@example.com', role: 'trainer' };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) token.role = user.role;
      return token;
    },
    session: ({ session, token }) => {
      session.user.role = token.role;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Protect Routes

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (session.user.role !== 'trainer') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Trainer-only logic
}
```

---

## 🌐 Web Search (SearXNG)

### Already Configured in Perplexica

```bash
# Start with Docker
docker-compose up -d

# SearXNG runs at http://localhost:4000
```

**Environment Variable:**
```bash
SEARXNG_API_URL=http://localhost:4000
```

**Usage:**
Already implemented in Perplexica's search agents.

---

## 🚀 Quick Start Checklist

### 1. Sign Up for Services
- [ ] Neon account (https://neon.tech)
- [ ] Gemini API key (https://makersuite.google.com/app/apikey)
- [ ] Cloudinary account (optional, https://cloudinary.com)

### 2. Install Dependencies
```bash
npm install @neondatabase/serverless drizzle-orm @langchain/google-genai next-auth cloudinary
npm install -D drizzle-kit
```

### 3. Configure Environment
```bash
cp .env.example .env
# Add all credentials to .env
```

### 4. Update Database Configuration
- Update `src/lib/db/index.ts` (Neon)
- Update `drizzle.config.ts` (PostgreSQL)
- Update `src/lib/db/schema.ts` (pgTable)

### 5. Migrate Database
```bash
npx drizzle-kit generate
npx drizzle-kit push
```

### 6. Start Development
```bash
npm run dev
```

---

## 📊 Feature → API Mapping

| Feature | API/Service | Model/Config |
|---------|-------------|--------------|
| **Database** | Neon PostgreSQL | `DATABASE_URL` |
| **PDF Upload** | LangChain PDFLoader | Already available |
| **Text Extraction** | pdf-parse | Already available |
| **Document Chunking** | RecursiveCharacterTextSplitter | 500 chars, 100 overlap |
| **Embeddings** | Gemini | `text-embedding-004` |
| **MCQ Generation** | Gemini | `gemini-2.0-flash-exp` |
| **Mind Map** | Gemini | `gemini-1.5-pro` |
| **Student Queries** | Gemini | `gemini-2.0-flash-exp` |
| **Vector Search** | Neon pgvector | Cosine similarity |
| **Image Storage** | Cloudinary/Local | Optional |
| **Web Search** | SearXNG | Docker (included) |
| **Authentication** | NextAuth | JWT + Sessions |

---

## 💰 Cost Estimate (Free Tier)

| Service | Free Tier | Sufficient For |
|---------|-----------|----------------|
| **Neon** | 10 GB storage | ~100K documents |
| **Gemini** | 60 req/min | ~3,600 req/hour |
| **Cloudinary** | 25 GB/month | ~25K images |
| **SearXNG** | Self-hosted | Unlimited |
| **NextAuth** | Unlimited | Unlimited users |

**Total Cost:** $0/month for development and small-scale production

---

## 🔗 Useful Links

- **Neon Docs**: https://neon.tech/docs
- **Gemini API Docs**: https://ai.google.dev/docs
- **Drizzle ORM Docs**: https://orm.drizzle.team
- **LangChain Docs**: https://js.langchain.com
- **NextAuth Docs**: https://next-auth.js.org
- **Cloudinary Docs**: https://cloudinary.com/documentation

---

## 📞 Need Help?

- **Database Issues**: Check Neon dashboard logs
- **API Errors**: Verify API keys in `.env`
- **PDF Processing**: Check file permissions and formats
- **Authentication**: Check NextAuth configuration

---

**All APIs documented! Ready to implement! 🎉**

