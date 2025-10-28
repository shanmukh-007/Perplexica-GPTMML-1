# How to Test Phase 3: MCQ Auto-Generation Feature

## 🎯 Quick Summary

The MCQ feature you saw in the chat window is just a **placeholder message**. The actual MCQ practice functionality is on a **different page**.

---

## ✅ What's Been Fixed

1. **Updated StudentChatWindow.tsx** - Now shows correct instructions for MCQ mode
2. **All Phase 3 code is complete and pushed to GitHub**
3. **MCQ generation API is fully functional**

---

## 🚀 How to Test MCQs (Step-by-Step)

### Step 1: Make Sure Dev Server is Running

```bash
npm run dev
```

The server should be running on `http://localhost:3000` (or 3001 if 3000 is busy)

### Step 2: Upload a Document (if you haven't already)

You need a document in the database first. You can either:

**Option A: Use the upload page**
- Visit: `http://localhost:3000/trainer/upload`
- Upload a PDF, DOCX, or TXT file
- Fill in the metadata (subject, topic, description)
- Note the document ID from the response

**Option B: Use the test script**
```bash
chmod +x test-mcq-phase3.sh
./test-mcq-phase3.sh
```

This will:
- Upload the sample document (`test-sample.txt`)
- Generate MCQs automatically
- Test the complete flow
- Show you the results

### Step 3: Visit the MCQ Practice Page

Once you have a document ID (let's say it's `1`), visit:

```
http://localhost:3000/student/mcq/1?studentId=student-guest
```

Replace `1` with your actual document ID.

### Step 4: What Should Happen

1. **First Visit (No MCQs exist yet)**
   - The page will automatically call `/api/mcqs/generate`
   - MCQs will be generated from the document chunks
   - You'll see a loading state, then the MCQs appear

2. **Subsequent Visits (MCQs already exist)**
   - The page will load existing MCQs from the database
   - No regeneration needed

3. **Practice Flow**
   - Select answers for each question (radio buttons)
   - Click "Submit Answers"
   - See your score and correct answers with explanations

---

## 🔍 Troubleshooting

### Issue: "No chunks found for this document"

**Cause:** The document hasn't been processed yet (chunks not created)

**Solution:** 
- Wait a few seconds after upload for processing to complete
- Check the database to ensure chunks exist:
  ```sql
  SELECT COUNT(*) FROM document_chunks WHERE "documentId" = 1;
  ```

### Issue: "Failed to load AI chat model"

**Cause:** No AI provider is configured or API key is missing

**Solution:**
- Check your `.env` file has `GEMINI_API_KEY`
- Verify the API key is valid
- Check the Settings page to ensure Gemini is enabled

### Issue: "Document not found"

**Cause:** The document ID doesn't exist in the database

**Solution:**
- Upload a document first
- Check available documents:
  ```bash
  curl http://localhost:3000/api/documents/list?trainerId=trainer-demo
  ```

---

## 📊 API Endpoints Reference

### 1. Generate MCQs
```bash
curl -X POST http://localhost:3000/api/mcqs/generate \
  -H 'Content-Type: application/json' \
  -d '{"documentId": 1, "count": 10, "maxChunks": 20}'
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "mcqs": [
    {
      "id": 1,
      "documentId": 1,
      "question": "Who founded the Mughal Empire?",
      "options": ["Babur", "Akbar", "Humayun", "Shah Jahan"],
      "correctAnswer": 0,
      "explanation": "Babur founded the Mughal Empire in 1526...",
      "difficulty": "easy",
      "createdAt": "2025-10-28T..."
    }
  ]
}
```

### 2. Fetch Existing MCQs
```bash
curl http://localhost:3000/api/mcqs/1
```

### 3. Start Practice Session
```bash
curl -X POST http://localhost:3000/api/mcqs/session/start \
  -H 'Content-Type: application/json' \
  -d '{"studentId": "student-guest", "documentId": 1}'
```

### 4. Submit Answers
```bash
curl -X POST http://localhost:3000/api/mcqs/session/submit \
  -H 'Content-Type: application/json' \
  -d '{
    "sessionId": 1,
    "answers": [
      {"mcqId": 1, "selectedIndex": 0},
      {"mcqId": 2, "selectedIndex": 2}
    ]
  }'
```

---

## 🎨 What the UI Looks Like

### MCQ Practice Page (`/student/mcq/[documentId]`)

```
┌─────────────────────────────────────────┐
│ MCQ Practice                            │
│ Document ID: 1                          │
├─────────────────────────────────────────┤
│                                         │
│ Question 1:                             │
│ Who founded the Mughal Empire?          │
│                                         │
│ ○ Babur                                 │
│ ○ Akbar                                 │
│ ○ Humayun                               │
│ ○ Shah Jahan                            │
│                                         │
├─────────────────────────────────────────┤
│ Question 2:                             │
│ ...                                     │
├─────────────────────────────────────────┤
│                                         │
│ [Submit Answers]  Answered: 2 / 10     │
│                                         │
└─────────────────────────────────────────┘
```

### After Submission

```
┌─────────────────────────────────────────┐
│ Your Result                             │
│ Attempted: 10                           │
│ Correct: 8                              │
│ Incorrect: 2                            │
│ Score: 80%                              │
└─────────────────────────────────────────┘

Questions show:
✅ Correct answers in green
❌ Wrong answers in red
📝 Explanations for each question
```

---

## 🗄️ Database Tables Used

### `mcqs` Table
```sql
SELECT * FROM mcqs WHERE "documentId" = 1;
```

Columns:
- `id` - MCQ ID
- `documentId` - Reference to document
- `question` - Question text
- `options` - JSON array of 4 options
- `correctAnswer` - Index (0-3) of correct option
- `explanation` - Explanation text
- `difficulty` - 'easy' | 'medium' | 'hard'
- `createdAt` - Timestamp

### `study_sessions` Table
```sql
SELECT * FROM study_sessions WHERE "sessionType" = 'mcq';
```

Columns:
- `id` - Session ID
- `studentId` - Student identifier
- `documentId` - Document practiced
- `sessionType` - 'mcq'
- `score` - Percentage score
- `attempted` - Number of questions attempted
- `correct` - Number correct
- `incorrect` - Number incorrect
- `startedAt` - Session start time
- `completedAt` - Session end time

---

## 🎯 Expected Behavior

### ✅ Correct Flow

1. Visit `/student/mcq/1?studentId=alice`
2. See "Loading MCQs…" (2-5 seconds)
3. MCQs appear with radio buttons
4. Select answers
5. Click "Submit Answers"
6. See results with score
7. See correct answers highlighted
8. See explanations for each question

### ❌ What You Were Seeing (Chat Window)

The chat window at `/student/chat?mode=mcq` is a **different feature** - it's for conversational AI assistance. It now shows instructions to navigate to the actual MCQ practice page.

---

## 📝 Quick Test Checklist

- [ ] Dev server is running
- [ ] Document is uploaded and processed
- [ ] Visit `/student/mcq/[documentId]`
- [ ] MCQs load successfully
- [ ] Can select answers
- [ ] Can submit answers
- [ ] See score and results
- [ ] See correct answers and explanations

---

## 🚀 Next Steps

After testing MCQs successfully:

1. **Test with different documents** - Upload PDFs, DOCX files
2. **Test with different difficulty levels** - Check if easy/medium/hard are balanced
3. **Test regeneration** - Delete MCQs and regenerate
4. **Test multiple students** - Use different studentId values
5. **Check session tracking** - Verify study_sessions table

---

## 📞 Need Help?

If you encounter any issues:

1. Check the browser console for errors
2. Check the terminal where `npm run dev` is running
3. Check the database to verify data exists
4. Try the test script: `./test-mcq-phase3.sh`

---

## ✅ Phase 3 Status

**Phase 3 is 100% complete!**

- ✅ MCQ generation API
- ✅ MCQ fetch API
- ✅ Session tracking APIs
- ✅ Frontend components
- ✅ Student practice page
- ✅ Integration with RAG pipeline
- ✅ All code pushed to GitHub

**GitHub Repository:** https://github.com/shanmukh-007/Perplexica-GPTMML-1

**Latest Commits:**
- `c7f41a1` - Phase 3: MCQ auto-generation feature
- `c8bb55b` - Update StudentChatWindow to reflect Phase 3 completion

---

**Happy Testing! 🎉**

