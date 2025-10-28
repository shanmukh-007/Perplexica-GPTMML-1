#!/bin/bash
set -x
cd "/Users/shanmukh/Desktop/Perplexica copy/Perplexica"

echo "Adding Phase 3 files..."
git add src/app/api/mcqs/
git add src/app/student/mcq/
git add src/components/MCQQuestion.tsx
git add src/components/MCQPractice.tsx
git add scripts/verify-database.ts
git add test-mcq-phase3.sh
git add test-sample.txt
git add PHASE_3_COMPLETION_SUMMARY.md

echo "Checking status..."
git status --short

echo "Creating commit..."
git commit -m "Phase 3: Implement MCQ auto-generation feature

- Add MCQ generation API endpoint (POST /api/mcqs/generate)
- Add MCQ fetch endpoint (GET /api/mcqs/[documentId])
- Add session tracking APIs (start and submit)
- Create MCQQuestion and MCQPractice frontend components
- Add student MCQ practice page (/student/mcq/[documentId])
- Integrate with existing RAG pipeline using document chunks
- Generate MCQs using Gemini flash models with strict JSON validation
- Track practice sessions with scoring in study_sessions table
- Include test script and sample document for E2E testing
- Fix Next.js 15 type issues in dynamic routes
- Build passes successfully with all Phase 3 features"

echo "Pushing to GitHub..."
git push origin main

echo "Done!"
git log --oneline -n 2

