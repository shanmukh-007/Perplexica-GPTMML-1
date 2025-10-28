# 🎓 Exam Preparation Platform - Implementation Guide

## Overview
Transform Perplexica into a comprehensive exam preparation platform for competitive exams (UPSC, SSC, etc.) with:
- 📚 PDF RAG for study materials
- 📝 Auto-generated MCQs
- 🗺️ Mind Maps for concept visualization
- 🔍 Web search for current affairs

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    EXAM PREP PLATFORM                       │
└─────────────────────────────────────────────────────────────┘

FRONTEND (React/Next.js)
├─ PDF Upload Component
├─ MCQ Quiz Interface
├─ Mind Map Viewer
└─ Study Dashboard

BACKEND (Node.js/Express)
├─ PDF Processing & RAG
├─ MCQ Generation Agent
├─ Mind Map Generation Agent
└─ Exam Prep Focus Mode

DATABASE (SQLite + Drizzle)
├─ documents (PDFs)
├─ mcqs (Generated questions)
├─ mindmaps (Generated maps)
└─ study_sessions (User progress)
```

---

## Implementation Phases

### Phase 1: Database Schema
**Files to modify:**
- `src/lib/db/schema.ts` - Add new tables
- `drizzle/` - Create migration

**New Tables:**
```typescript
// documents - Store uploaded PDFs
documents {
  id, chatId, fileName, fileSize, uploadedAt, embedding_status
}

// mcqs - Store generated questions
mcqs {
  id, documentId, question, options[], correctAnswer, explanation, difficulty
}

// mindmaps - Store generated mind maps
mindmaps {
  id, documentId, title, structure (JSON), createdAt
}

// study_sessions - Track user progress
study_sessions {
  id, chatId, documentId, questionsAttempted, correctAnswers, createdAt
}
```

### Phase 2: PDF RAG Implementation
**Files to create/modify:**
- `src/lib/agents/pdfRagAgent.ts` - PDF retrieval logic
- `src/app/api/documents/upload.ts` - PDF upload endpoint
- `src/app/api/documents/search.ts` - RAG search endpoint

**Features:**
- Upload PDFs with chunking
- Vector embeddings for similarity search
- Context retrieval for MCQ/Mind Map generation

### Phase 3: MCQ Generation Agent
**Files to create:**
- `src/lib/agents/mcqGeneratorAgent.ts` - MCQ generation logic
- `src/app/api/mcqs/generate.ts` - MCQ generation endpoint

**Features:**
- Generate 5-10 MCQs from content
- Multiple difficulty levels
- Explanations for each answer

### Phase 4: Mind Map Generation Agent
**Files to create:**
- `src/lib/agents/mindmapGeneratorAgent.ts` - Mind map logic
- `src/app/api/mindmaps/generate.ts` - Mind map endpoint

**Features:**
- Hierarchical concept mapping
- JSON structure for visualization
- Interactive tree display

### Phase 5: Exam Prep Focus Mode
**Files to modify:**
- `src/lib/search/index.ts` - Add examPrep handler
- `src/app/api/search/route.ts` - Route to exam prep agent

**Features:**
- Combine RAG + MCQ + Mind Map
- Unified exam prep workflow

### Phase 6: Frontend Components
**Files to create:**
- `src/components/ExamPrep/PDFUploader.tsx`
- `src/components/ExamPrep/MCQQuiz.tsx`
- `src/components/ExamPrep/MindMapViewer.tsx`
- `src/components/ExamPrep/StudyDashboard.tsx`

### Phase 7: Integration & Testing
- End-to-end testing
- Performance optimization
- Error handling

---

## Key Technologies

| Component | Technology |
|-----------|-----------|
| PDF Processing | `@langchain/community/document_loaders/fs/pdf` |
| Vector DB | Existing embeddings + SQLite |
| MCQ Generation | LangChain + Claude/GPT |
| Mind Map | JSON structure + React visualization |
| UI Components | React + Tailwind CSS |

---

## Next Steps

1. **Start with Phase 1** - Database schema updates
2. **Then Phase 2** - PDF RAG implementation
3. **Phases 3-4** - AI agents for MCQ and Mind Maps
4. **Phase 5** - Integration into focus modes
5. **Phase 6** - Frontend components
6. **Phase 7** - Testing and refinement

---

## Success Criteria

✅ Students can upload PDFs and search through them
✅ Auto-generated MCQs with explanations
✅ Visual mind maps for concept learning
✅ Web search for current affairs integration
✅ Track study progress and performance
✅ Export study materials and results

---

## Notes

- Leverage existing Perplexica infrastructure (LangChain, embeddings, etc.)
- Reuse existing UI patterns and components
- Maintain backward compatibility with current features
- Consider performance for large PDF files

