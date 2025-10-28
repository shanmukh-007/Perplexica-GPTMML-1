# 🎯 Exam Prep Platform - Implementation Checklist

## Phase 1: Database Schema ✅ Ready to Start

### Database Tables - Trainer-Student Model

- [ ] **documents** table (Trainer-uploaded materials)
  - `id` (PK)
  - `trainerId` (FK - who uploaded)
  - `fileName` (string)
  - `fileType` (enum: pdf, image, document)
  - `fileSize` (number)
  - `uploadedAt` (timestamp)
  - `embeddingStatus` (enum: pending, completed, failed)
  - `visibility` (enum: public, group, private)
  - `accessGroups` (JSON array - group IDs)
  - `subject` (string - e.g., History)
  - `topic` (string - e.g., Ancient India)
  - `description` (text)
  - `metadata` (JSON)

- [ ] **document_images** table (Image management)
  - `id` (PK)
  - `documentId` (FK to documents)
  - `imageUrl` (string - S3/local URL)
  - `imageName` (string)
  - `imageSize` (number)
  - `uploadedAt` (timestamp)
  - `pageNumber` (number - optional)
  - `description` (text - alt text)
  - `embeddingStatus` (enum: pending, completed, failed)

- [ ] **document_access** table (Access control)
  - `id` (PK)
  - `documentId` (FK)
  - `studentId` (FK - student user ID)
  - `accessLevel` (enum: view, download, comment)
  - `grantedAt` (timestamp)
  - `grantedBy` (trainer ID)

- [ ] **document_chunks** table (RAG vector store)
  - `id` (PK)
  - `documentId` (FK)
  - `chunkIndex` (number)
  - `content` (text - chunk content)
  - `embedding` (JSON - vector)
  - `metadata` (JSON)
  - `createdAt` (timestamp)

- [ ] **mcqs** table
  - `id` (PK)
  - `documentId` (FK)
  - `question` (text)
  - `options` (JSON array)
  - `correctAnswer` (number)
  - `explanation` (text)
  - `difficulty` (enum: easy, medium, hard)
  - `createdAt` (timestamp)

- [ ] **mindmaps** table
  - `id` (PK)
  - `documentId` (FK)
  - `title` (string)
  - `structure` (JSON - hierarchical)
  - `createdAt` (timestamp)

- [ ] **study_sessions** table
  - `id` (PK)
  - `studentId` (FK - student user ID)
  - `documentId` (FK)
  - `questionsAttempted` (number)
  - `correctAnswers` (number)
  - `createdAt` (timestamp)

### Migration Files
- [ ] Create `drizzle/0002_exam_prep_schema.sql`
- [ ] Update `src/lib/db/schema.ts`
- [ ] Update `src/lib/db/migrate.ts` if needed

---

## Phase 2: Trainer-Student Document Management ✅ Ready to Start

### Backend Files - Trainer Upload
- [ ] Create `src/lib/agents/pdfRagAgent.ts`
  - PDF chunking logic
  - Embedding generation
  - Similarity search
  - Context retrieval

- [ ] Create `src/app/api/documents/trainer-upload.ts`
  - **Trainer-only endpoint**
  - File validation (PDF, images, documents)
  - Metadata collection (subject, topic, description)
  - Visibility/access control setup
  - Database storage with trainer ID

- [ ] Create `src/app/api/documents/upload-image.ts`
  - **Image upload endpoint**
  - Image validation
  - Storage management
  - Page number tracking
  - Alt text/description

### Backend Files - Student Access
- [ ] Create `src/app/api/documents/student-search.ts`
  - **Student-only endpoint**
  - Query processing
  - Access control validation
  - Vector similarity search
  - Result ranking with document metadata

- [ ] Create `src/app/api/documents/list.ts`
  - List accessible documents for student
  - Filter by subject/topic
  - Pagination support

### Features
- [ ] Trainer document upload with metadata
- [ ] Image upload & management
- [ ] Access control (public/group/private)
- [ ] Automatic chunking (500 chars, 100 overlap)
- [ ] Embedding generation for chunks
- [ ] Vector similarity search
- [ ] Student search across trainer documents
- [ ] Context retrieval for MCQ/Mind Map

---

## Phase 3: MCQ Generation Agent ✅ Ready to Start

### Backend Files
- [ ] Create `src/lib/agents/mcqGeneratorAgent.ts`
  - MCQ generation prompt
  - Question validation
  - Difficulty assignment
  - Explanation generation

- [ ] Create `src/app/api/mcqs/generate.ts`
  - Request validation
  - Agent invocation
  - Response formatting
  - Database storage

### Features
- [ ] Generate 5-10 MCQs per request
- [ ] Multiple difficulty levels
- [ ] Detailed explanations
- [ ] Correct answer validation
- [ ] Store in database

---

## Phase 4: Mind Map Generation Agent ✅ Ready to Start

### Backend Files
- [ ] Create `src/lib/agents/mindmapGeneratorAgent.ts`
  - Hierarchical structure generation
  - JSON formatting
  - Concept extraction
  - Relationship mapping

- [ ] Create `src/app/api/mindmaps/generate.ts`
  - Request validation
  - Agent invocation
  - JSON validation
  - Database storage

### Features
- [ ] Generate hierarchical mind maps
- [ ] JSON structure for visualization
- [ ] Concept relationships
- [ ] Multiple levels of depth

---

## Phase 5: Exam Prep Focus Mode ✅ Ready to Start

### Backend Files
- [ ] Modify `src/lib/search/index.ts`
  - Add examPrep handler
  - Configure prompts

- [ ] Modify `src/app/api/search/route.ts`
  - Route to exam prep agent

### Features
- [ ] Unified exam prep workflow
- [ ] Combine RAG + MCQ + Mind Map
- [ ] Web search integration
- [ ] Current affairs support

---

## Phase 6: Frontend Components - Trainer & Student Views ✅ Ready to Start

### Trainer Components
- [ ] `src/components/ExamPrep/TrainerDocumentUploader.tsx`
  - Drag & drop upload (PDF, images, documents)
  - Metadata form (subject, topic, description)
  - Visibility/access control selector
  - Group selection for group access
  - Progress indicator
  - Upload status

- [ ] `src/components/ExamPrep/TrainerImageManager.tsx`
  - Add images to documents
  - Image preview
  - Alt text/description
  - Page number tracking
  - Delete/edit functionality

- [ ] `src/components/ExamPrep/TrainerDocumentList.tsx`
  - List uploaded documents
  - Edit metadata
  - Manage access permissions
  - View analytics
  - Delete documents

### Student Components
- [ ] `src/components/ExamPrep/StudentDocumentBrowser.tsx`
  - Browse accessible documents
  - Filter by subject/topic
  - Search functionality
  - Document preview
  - Download option

- [ ] `src/components/ExamPrep/MCQQuiz.tsx`
  - Question display
  - Option selection
  - Answer validation
  - Score tracking
  - Explanation display

- [ ] `src/components/ExamPrep/MindMapViewer.tsx`
  - Tree visualization
  - Expand/collapse nodes
  - Interactive navigation
  - Zoom controls

- [ ] `src/components/ExamPrep/StudyDashboard.tsx`
  - Accessible documents list
  - Study progress
  - Statistics
  - Quick actions
  - Performance metrics

### UI Integration
- [ ] Add "Exam Prep" focus mode to Focus selector
- [ ] Add MCQ/Mind Map buttons to message actions
- [ ] Add study dashboard to sidebar
- [ ] Add role-based UI (Trainer vs Student)
- [ ] Add document browser for students
- [ ] Add upload manager for trainers

---

## Phase 7: Integration & Testing ✅ Ready to Start

### Testing
- [ ] Unit tests for agents
- [ ] API endpoint tests
- [ ] Frontend component tests
- [ ] End-to-end workflow tests

### Integration
- [ ] Test PDF upload flow
- [ ] Test MCQ generation
- [ ] Test Mind Map generation
- [ ] Test web search integration
- [ ] Test database operations

### Performance
- [ ] Optimize PDF chunking
- [ ] Cache embeddings
- [ ] Optimize queries
- [ ] Monitor API response times

### Error Handling
- [ ] Invalid PDF handling
- [ ] Large file handling
- [ ] Network error handling
- [ ] Database error handling

---

## Success Metrics

✅ **Trainer Functionality**
- Trainers can upload PDFs, images, and documents
- Metadata assignment (subject, topic, description)
- Access control management (public/group/private)
- Image management and organization
- Document analytics and usage tracking

✅ **Student Functionality**
- Students can browse trainer-uploaded documents
- Search across all accessible documents
- MCQs auto-generate with explanations
- Mind maps visualize concepts
- Study progress is tracked
- Cannot upload documents (trainer-only)

✅ **Performance**
- Document upload < 5 seconds
- Image upload < 3 seconds
- MCQ generation < 10 seconds
- Mind map generation < 10 seconds
- Search results < 3 seconds
- Document listing < 2 seconds

✅ **User Experience**
- Role-based UI (Trainer vs Student)
- Intuitive document management
- Clear access controls
- Helpful error messages
- Responsive design
- Image preview functionality

---

## Notes & Tips

1. **Reuse existing code** - Leverage existing PDF processing in `src/app/api/uploads/route.ts`
2. **Follow patterns** - Use existing agent patterns from `metaSearchAgent.ts`
3. **Database** - Use Drizzle ORM like existing code
4. **UI** - Follow existing component patterns and Tailwind styling
5. **Testing** - Write tests as you go, not at the end

---

## Estimated Timeline

- Phase 1: 1-2 hours (Database)
- Phase 2: 3-4 hours (PDF RAG)
- Phase 3: 2-3 hours (MCQ Agent)
- Phase 4: 2-3 hours (Mind Map Agent)
- Phase 5: 1-2 hours (Focus Mode)
- Phase 6: 4-5 hours (Frontend)
- Phase 7: 2-3 hours (Testing)

**Total: ~18-22 hours of development**

