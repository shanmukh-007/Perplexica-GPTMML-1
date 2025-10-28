# 🎓 Trainer-Student Workflow Guide

## Overview

The exam prep platform now implements a **trainer-student workflow** where:
- **Trainers** upload and manage study materials (PDFs, images, documents)
- **Students** search and learn from trainer-uploaded materials
- **Access Control** ensures proper document visibility and permissions

---

## 🏗️ Architecture Changes

### Before (Student-Centric)
```
Student → Upload PDF → Store → Search → Generate MCQ/Mind Map
```

### After (Trainer-Student Model)
```
Trainer → Upload Materials → Store with Metadata → Access Control
                                                        ↓
                                                    Student → Search → Generate MCQ/Mind Map
```

---

## 📊 Database Schema Changes

### New Tables

#### 1. **documents** (Updated)
```typescript
{
  id: string,
  trainerId: string,              // ✨ NEW: Who uploaded
  fileName: string,
  fileType: 'pdf' | 'image' | 'document',  // ✨ NEW: Support images
  fileSize: number,
  uploadedAt: string,
  embeddingStatus: 'pending' | 'completed' | 'failed',
  visibility: 'public' | 'group' | 'private',  // ✨ NEW: Access control
  accessGroups: string[],         // ✨ NEW: Group IDs for group access
  subject: string,                // ✨ NEW: e.g., 'History'
  topic: string,                  // ✨ NEW: e.g., 'Ancient India'
  description: string,            // ✨ NEW: Document description
  metadata: JSON,
}
```

#### 2. **document_images** (New)
```typescript
{
  id: string,
  documentId: string,             // FK to documents
  imageUrl: string,               // S3 or local URL
  imageName: string,
  imageSize: number,
  uploadedAt: string,
  pageNumber?: number,            // For PDFs with images
  description: string,            // Alt text
  embeddingStatus: 'pending' | 'completed' | 'failed',
}
```

#### 3. **document_access** (New)
```typescript
{
  id: string,
  documentId: string,             // FK to documents
  studentId: string,              // Student user ID
  accessLevel: 'view' | 'download' | 'comment',
  grantedAt: string,
  grantedBy: string,              // Trainer ID
}
```

#### 4. **document_chunks** (New)
```typescript
{
  id: string,
  documentId: string,             // FK to documents
  chunkIndex: number,
  content: string,                // Chunk text
  embedding: JSON,                // Vector embedding
  metadata: JSON,
  createdAt: string,
}
```

#### 5. **study_sessions** (Updated)
```typescript
{
  id: string,
  studentId: string,              // ✨ CHANGED: From chatId
  documentId: string,
  questionsAttempted: number,
  correctAnswers: number,
  createdAt: string,
}
```

---

## 🔐 Access Control Model

### Visibility Levels

| Level | Access | Use Case |
|-------|--------|----------|
| **public** | All students | General study materials |
| **group** | Specific groups | Class-specific materials |
| **private** | Only trainer | Draft/personal materials |

### Access Levels

| Level | Permission | Use Case |
|-------|-----------|----------|
| **view** | Read only | Standard access |
| **download** | Download files | Offline study |
| **comment** | Add notes/comments | Collaborative learning |

---

## 🚀 API Endpoints

### Trainer Endpoints

#### Upload Documents
```
POST /api/documents/trainer-upload
Headers: x-trainer-id: <trainer-id>
Body: {
  files: File[],
  subject: string,
  topic: string,
  description: string,
  visibility: 'public' | 'group' | 'private',
  accessGroups?: string[]
}
Response: { documents: [...] }
```

#### Upload Images
```
POST /api/documents/upload-image
Headers: x-trainer-id: <trainer-id>
Body: {
  image: File,
  documentId: string,
  pageNumber?: number,
  description: string
}
Response: { image: {...} }
```

#### Manage Access
```
POST /api/documents/manage-access
Headers: x-trainer-id: <trainer-id>
Body: {
  documentId: string,
  studentId: string,
  accessLevel: 'view' | 'download' | 'comment'
}
Response: { success: true }
```

### Student Endpoints

#### Search Documents
```
POST /api/documents/student-search
Headers: x-student-id: <student-id>
Body: {
  query: string,
  subject?: string,
  topic?: string,
  limit?: number
}
Response: { results: [...], total: number }
```

#### List Accessible Documents
```
GET /api/documents/list
Headers: x-student-id: <student-id>
Query: ?subject=&topic=&page=1&limit=10
Response: { documents: [...], total: number }
```

#### Get Document Details
```
GET /api/documents/:documentId
Headers: x-student-id: <student-id>
Response: { document: {...}, images: [...] }
```

---

## 🎨 Frontend Components

### Trainer Components

#### TrainerDocumentUploader
- Drag & drop upload
- Metadata form (subject, topic, description)
- Visibility selector
- Group selection
- Progress indicator

#### TrainerImageManager
- Add images to documents
- Image preview
- Alt text/description
- Page number tracking
- Delete/edit

#### TrainerDocumentList
- List uploaded documents
- Edit metadata
- Manage access permissions
- View analytics
- Delete documents

### Student Components

#### StudentDocumentBrowser
- Browse accessible documents
- Filter by subject/topic
- Search functionality
- Document preview
- Download option

#### MCQQuiz
- Question display
- Option selection
- Answer validation
- Score tracking
- Explanation display

#### MindMapViewer
- Tree visualization
- Expand/collapse nodes
- Interactive navigation
- Zoom controls

#### StudyDashboard
- Accessible documents list
- Study progress
- Statistics
- Quick actions
- Performance metrics

---

## 🔄 Workflow Examples

### Trainer Workflow
1. Login as trainer
2. Navigate to "Upload Materials"
3. Select PDF/images/documents
4. Add metadata (subject, topic, description)
5. Set visibility (public/group/private)
6. Upload
7. Manage access permissions
8. View analytics

### Student Workflow
1. Login as student
2. Navigate to "Study Materials"
3. Browse or search documents
4. Select document
5. View content and images
6. Generate MCQs
7. Create mind maps
8. Track progress

---

## 🔍 Search & RAG Flow

### Document Indexing (Trainer Upload)
```
1. Trainer uploads document
2. System chunks document (500 chars, 100 overlap)
3. Generate embeddings for each chunk
4. Store chunks in document_chunks table
5. Mark embeddingStatus as 'completed'
```

### Student Search
```
1. Student enters search query
2. System checks access permissions
3. Generate embedding for query
4. Find similar chunks using vector similarity
5. Retrieve document metadata
6. Return results with document info
```

---

## 🛡️ Security Considerations

### Authentication
- Verify trainer role for upload endpoints
- Verify student ID for search endpoints
- Use JWT tokens or session management

### Authorization
- Check document visibility before returning results
- Validate access level for each operation
- Log all access attempts

### Data Protection
- Validate file types (PDF, images only)
- Limit file sizes
- Scan for malware
- Encrypt sensitive data

---

## 📈 Implementation Phases

### Phase 1: Database (1-2h)
- Create new tables
- Add trainer/student fields
- Set up access control

### Phase 2: Document Management (4-5h)
- Trainer upload API
- Image upload API
- Student search API
- Access control API

### Phase 3-5: MCQ, Mind Map, Focus Mode (5-8h)
- Generate from trainer documents
- Integrate with search results

### Phase 6: Frontend (5-6h)
- Trainer upload UI
- Student browser UI
- Role-based views

### Phase 7: Testing (2-3h)
- API tests
- Access control tests
- End-to-end tests

---

## ✅ Key Features

✨ **Trainer Features**
- Upload PDFs, images, documents
- Add metadata (subject, topic, description)
- Manage access (public/group/private)
- Upload images to documents
- View analytics

✨ **Student Features**
- Browse trainer materials
- Search across documents
- Generate MCQs
- Create mind maps
- Track progress
- Download materials

✨ **System Features**
- Role-based access control
- Vector search with embeddings
- Image management
- Access logging
- Performance tracking

---

## 🚀 Next Steps

1. **Review** this document
2. **Update** database schema (Phase 1)
3. **Implement** trainer upload API (Phase 2)
4. **Implement** student search API (Phase 2)
5. **Build** frontend components (Phase 6)
6. **Test** all workflows (Phase 7)

---

**Ready to implement the trainer-student workflow? Let's go! 🎓**

