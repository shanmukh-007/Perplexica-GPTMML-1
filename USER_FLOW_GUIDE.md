# 🎯 User Flow Guide - Exam Prep Platform

## 📱 Complete User Journey

---

## 🏠 Landing Page (`/`)

**What you see:**
- 🎓 Exam Prep Platform header
- Two role selection cards:
  - 👨‍🏫 **Trainer** - Upload and manage study materials
  - 👨‍🎓 **Student** - Access materials and practice
- Feature showcase:
  - 📄 PDF RAG - AI-powered document search
  - ❓ MCQ Generator - Auto-generate practice questions
  - 🗺️ Mind Maps - Visualize concepts
  - 🌐 Web Search - Current affairs research

**Actions:**
- Click "Trainer" → Go to Trainer Dashboard
- Click "Student" → Go to Student Dashboard

---

## 👨‍🎓 Student Journey

### **Step 1: Student Dashboard** (`/student`)

**What you see:**
- 4 Quick Action Cards:
  - 📚 **Browse Documents** - Access study materials
  - ❓ **Practice MCQs** - Test your knowledge
  - 🗺️ **Mind Maps** - Visualize concepts
  - 🌐 **Web Search** - Current affairs

- 3 Progress Cards:
  - 📖 Documents Studied: 0
  - ✅ MCQs Attempted: 0
  - 🎯 Average Score: 0%

- Available Study Materials section (empty for now)

**Actions:**
- Click "Browse" → Go to Documents Chat
- Click "Start Quiz" → Go to MCQ Chat
- Click "View Maps" → Go to Mind Map Chat
- Click "Search" → Go to Web Search Chat

---

### **Step 2: Student Chat Interface** (`/student/chat?mode=...`)

#### **📚 Documents Mode** (`?mode=documents`)

**What you see:**
- Header: "Browse Documents" with book icon
- Welcome message: "Hi! I'm your study assistant. Ask me anything about your study materials..."
- Chat input: "Ask a question about your study materials..."

**How to use:**
1. Type a question (e.g., "What is the Indus Valley Civilization?")
2. Press Enter
3. See AI response (currently simulated, will be real in Phase 2)

**Example queries:**
- "Explain the concept of democracy"
- "What are the causes of World War II?"
- "Summarize the chapter on photosynthesis"

---

#### **❓ MCQ Mode** (`?mode=mcq`)

**What you see:**
- Header: "Practice MCQs" with brain icon
- Welcome message: "Hi! I'm your MCQ practice assistant. Tell me what topic you'd like to practice..."
- Chat input: "Request MCQs on a topic..."

**How to use:**
1. Type a request (e.g., "Give me 10 MCQs on Ancient India")
2. Press Enter
3. See MCQs generated (Phase 3)

**Example queries:**
- "Give me 5 easy MCQs on the Solar System"
- "Generate 10 hard questions on Indian Constitution"
- "Create a quiz on World Geography"

---

#### **🗺️ Mind Map Mode** (`?mode=mindmap`)

**What you see:**
- Header: "Mind Maps" with map icon
- Welcome message: "Hi! I'm your mind map assistant. Tell me what topic you'd like to visualize..."
- Chat input: "Request a mind map on a topic..."

**How to use:**
1. Type a topic (e.g., "Create a mind map for the Water Cycle")
2. Press Enter
3. See hierarchical mind map (Phase 4)

**Example queries:**
- "Create a mind map for the French Revolution"
- "Visualize the structure of the Indian Government"
- "Show me a concept map for Photosynthesis"

---

#### **🌐 Web Search Mode** (`?mode=websearch`)

**What you see:**
- Header: "Web Search" with globe icon
- Welcome message: "Hi! I'm your current affairs assistant. Ask me about recent news or events..."
- Chat input: "Search for current affairs or any topic..."

**How to use:**
1. Type a search query (e.g., "What are the latest developments in AI?")
2. Press Enter
3. See web search results (Phase 5)

**Example queries:**
- "What happened in the G20 summit?"
- "Latest news on climate change"
- "Current affairs for UPSC preparation"

---

## 👨‍🏫 Trainer Journey

### **Step 1: Trainer Dashboard** (`/trainer`)

**What you see:**
- 3 Quick Action Cards:
  - 📤 **Upload Documents** - Upload PDFs, DOCX, and other materials
  - 🖼️ **Add Images** - Upload diagrams, charts, and visual aids
  - 📊 **View Analytics** - Track student progress (Phase 6)

- Document Management section (empty for now)

**Actions:**
- Click "Upload New Document" → Go to Upload Page
- Click "Upload Images" → Go to Upload Page
- Click "View Analytics" → Coming in Phase 6

---

### **Step 2: Upload Interface** (`/trainer/upload`)

**What you see:**
- Header: "Upload Document" with upload icon
- Upload form with fields:
  - **File Upload** - Drag & drop or click to select
  - **Subject** - e.g., History, Geography, Science
  - **Topic** - e.g., Ancient India, World War II
  - **Description** - Brief description of content
  - **Visibility** - Public, Group, or Private

**How to use:**
1. Click the upload area or drag a file
2. Select a PDF, DOCX, or TXT file
3. Fill in Subject (e.g., "History")
4. Fill in Topic (e.g., "Ancient India")
5. Add Description (e.g., "Comprehensive notes on Indus Valley Civilization")
6. Choose Visibility (e.g., "Public - All students can access")
7. Click "Upload Document"
8. See success message

**File types supported:**
- PDF (.pdf)
- Word Documents (.docx)
- Text Files (.txt)
- Max size: 50MB

**Visibility options:**
- **Public** - All students can access
- **Group** - Specific groups only (Phase 2)
- **Private** - No student access (draft mode)

---

## 🎨 Design Features

### **Chat Interface:**
- **User messages:** Colored bubbles (purple for documents, blue for MCQ, green for mind maps, orange for web search)
- **AI messages:** White bubbles with shadow
- **Timestamps:** Shown for each message
- **Typing indicator:** 3 animated dots while AI is "thinking"
- **Scroll to bottom:** Auto-scroll to latest message

### **Responsive Design:**
- Works on desktop, tablet, and mobile
- Touch-friendly buttons
- Adaptive layouts

### **Dark Mode:**
- Full dark mode support
- Automatic theme detection
- Smooth transitions

---

## ⌨️ Keyboard Shortcuts

### **Chat Interface:**
- **Enter** - Send message
- **Shift + Enter** - New line in message
- **Esc** - Clear input (future)

---

## 🔄 Navigation

### **From any page:**
- Click logo → Go to Landing Page
- Click "Back to Home" → Go to Landing Page
- Click "Student Mode" / "Trainer Mode" → Go to respective dashboard

### **From Chat:**
- Click back arrow (←) → Go to Student Dashboard

### **From Upload:**
- Click back arrow (←) → Go to Trainer Dashboard

---

## 📊 Current Status (Phase 1)

### **✅ Working:**
- All navigation
- All page layouts
- Chat interface UI
- Upload interface UI
- Database connection
- Role selection

### **⏳ Coming in Phase 2:**
- Real document upload
- PDF text extraction
- RAG-based search
- Actual AI responses

### **⏳ Coming in Phase 3:**
- MCQ generation
- Interactive quiz interface
- Score tracking

### **⏳ Coming in Phase 4:**
- Mind map generation
- Interactive visualization
- Concept hierarchy

### **⏳ Coming in Phase 5:**
- Web search integration
- Current affairs feed
- News aggregation

---

## 💡 Tips for Testing

### **Student Testing:**
1. Try all 4 chat modes
2. Type different types of queries
3. Test keyboard shortcuts (Enter, Shift+Enter)
4. Check responsive design (resize browser)
5. Toggle dark mode

### **Trainer Testing:**
1. Try uploading different file types
2. Fill in all metadata fields
3. Test different visibility options
4. Check success feedback
5. Test navigation back to dashboard

---

## 🎯 User Experience Goals

### **For Students:**
- **Intuitive:** No learning curve, just type and ask
- **Engaging:** ChatGPT-style interface feels natural
- **Helpful:** Clear guidance on what to ask
- **Fast:** Quick responses (will be optimized in Phase 2)

### **For Trainers:**
- **Simple:** Easy upload workflow
- **Organized:** Clear metadata fields
- **Flexible:** Multiple visibility options
- **Feedback:** Clear success/error messages

---

## 🚀 Next Steps

**Phase 2 will add:**
- Real document upload to Cloudinary/local storage
- PDF text extraction using LangChain
- Document chunking and embedding generation
- Vector similarity search
- Real AI responses in chat interface

**Then you'll be able to:**
- Upload actual PDFs
- Ask questions about uploaded documents
- Get AI-powered answers with source citations
- See relevant excerpts from documents

---

**Ready to test? Start at `http://localhost:3000` and explore! 🎉**

