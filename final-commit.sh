#!/bin/bash
cd "/Users/shanmukh/Desktop/Perplexica copy/Perplexica"

# Add all Phase 3 files
git add src/app/api/mcqs/ src/app/student/mcq/ src/components/MCQQuestion.tsx src/components/MCQPractice.tsx scripts/verify-database.ts test-mcq-phase3.sh test-sample.txt PHASE_3_COMPLETION_SUMMARY.md commit-phase3.sh git-add-phase3.sh commit_phase3.py do-commit.sh final-commit.sh > /tmp/git-add.log 2>&1

# Commit
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
- Build passes successfully with all Phase 3 features" > /tmp/git-commit.log 2>&1

# Push
git push origin main > /tmp/git-push.log 2>&1

# Output results
echo "=== GIT ADD ===" > /tmp/phase3-final.log
cat /tmp/git-add.log >> /tmp/phase3-final.log
echo "" >> /tmp/phase3-final.log
echo "=== GIT COMMIT ===" >> /tmp/phase3-final.log
cat /tmp/git-commit.log >> /tmp/phase3-final.log
echo "" >> /tmp/phase3-final.log
echo "=== GIT PUSH ===" >> /tmp/phase3-final.log
cat /tmp/git-push.log >> /tmp/phase3-final.log
echo "" >> /tmp/phase3-final.log
echo "=== GIT LOG ===" >> /tmp/phase3-final.log
git log --oneline -n 3 >> /tmp/phase3-final.log 2>&1

cat /tmp/phase3-final.log

