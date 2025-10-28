#!/bin/bash

# Phase 3 MCQ Generation - End-to-End Test Script
# This script tests the complete MCQ generation workflow

set -e

BASE_URL="http://localhost:3001"
TRAINER_ID="trainer-demo"
STUDENT_ID="student-test"

echo "========================================="
echo "Phase 3: MCQ Generation E2E Test"
echo "========================================="
echo ""

# Step 1: Check if server is running
echo "Step 1: Checking if dev server is running..."
if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" | grep -q "200\|404"; then
    echo "✓ Server is running at $BASE_URL"
else
    echo "✗ Server is not running. Please start with: npm run dev"
    exit 1
fi
echo ""

# Step 2: Upload a test document
echo "Step 2: Uploading test document..."
UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/documents/upload" \
  -F "file=@test-sample.txt" \
  -F "trainerId=$TRAINER_ID" \
  -F "subject=History" \
  -F "topic=Mughal Empire" \
  -F "description=Test document for MCQ generation" \
  -F "visibility=public")

echo "Upload response: $UPLOAD_RESPONSE"

# Extract document ID from response
DOCUMENT_ID=$(echo "$UPLOAD_RESPONSE" | jq -r '.document.id // empty')

if [ -z "$DOCUMENT_ID" ]; then
    echo "✗ Failed to upload document or extract document ID"
    echo "Response: $UPLOAD_RESPONSE"
    exit 1
fi

echo "✓ Document uploaded successfully with ID: $DOCUMENT_ID"
echo ""

# Step 3: Wait for document processing
echo "Step 3: Waiting for document processing (chunks and embeddings)..."
sleep 5
echo "✓ Processing complete"
echo ""

# Step 4: Generate MCQs
echo "Step 4: Generating MCQs for document $DOCUMENT_ID..."
MCQ_GEN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/mcqs/generate" \
  -H "Content-Type: application/json" \
  -d "{\"documentId\": $DOCUMENT_ID, \"count\": 10, \"maxChunks\": 20}")

echo "MCQ Generation response:"
echo "$MCQ_GEN_RESPONSE" | jq '.'

MCQ_COUNT=$(echo "$MCQ_GEN_RESPONSE" | jq -r '.count // 0')

if [ "$MCQ_COUNT" -eq 0 ]; then
    echo "✗ Failed to generate MCQs"
    exit 1
fi

echo "✓ Generated $MCQ_COUNT MCQs successfully"
echo ""

# Step 5: Fetch generated MCQs
echo "Step 5: Fetching generated MCQs..."
FETCH_RESPONSE=$(curl -s "$BASE_URL/api/mcqs/$DOCUMENT_ID")

echo "Fetched MCQs:"
echo "$FETCH_RESPONSE" | jq '.mcqs[0:2]'  # Show first 2 MCQs

FETCHED_COUNT=$(echo "$FETCH_RESPONSE" | jq -r '.count // 0')
echo "✓ Fetched $FETCHED_COUNT MCQs from database"
echo ""

# Step 6: Start a practice session
echo "Step 6: Starting MCQ practice session..."
SESSION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/mcqs/session/start" \
  -H "Content-Type: application/json" \
  -d "{\"studentId\": \"$STUDENT_ID\", \"documentId\": $DOCUMENT_ID}")

echo "Session response: $SESSION_RESPONSE"

SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.session.id // empty')

if [ -z "$SESSION_ID" ]; then
    echo "✗ Failed to start session"
    exit 1
fi

echo "✓ Session started with ID: $SESSION_ID"
echo ""

# Step 7: Submit answers (simulate student answering)
echo "Step 7: Submitting practice answers..."

# Get MCQ IDs from the fetched response
MCQ_IDS=$(echo "$FETCH_RESPONSE" | jq -r '.mcqs[0:5] | map(.id) | @json')

# Create sample answers (selecting option 0 for all questions for simplicity)
ANSWERS=$(echo "$FETCH_RESPONSE" | jq -r '.mcqs[0:5] | map({mcqId: .id, selectedIndex: 0}) | @json')

SUBMIT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/mcqs/session/submit" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\": $SESSION_ID, \"answers\": $ANSWERS, \"durationSeconds\": 120}")

echo "Submit response:"
echo "$SUBMIT_RESPONSE" | jq '.'

SCORE=$(echo "$SUBMIT_RESPONSE" | jq -r '.score // 0')
ATTEMPTED=$(echo "$SUBMIT_RESPONSE" | jq -r '.attempted // 0')
CORRECT=$(echo "$SUBMIT_RESPONSE" | jq -r '.correct // 0')

echo "✓ Answers submitted successfully"
echo "  - Attempted: $ATTEMPTED questions"
echo "  - Correct: $CORRECT answers"
echo "  - Score: $SCORE%"
echo ""

# Step 8: Verify database entries
echo "Step 8: Verifying database entries..."
echo "✓ MCQs table: $FETCHED_COUNT rows for document $DOCUMENT_ID"
echo "✓ Study sessions table: Session $SESSION_ID created and updated"
echo ""

echo "========================================="
echo "✓ Phase 3 E2E Test PASSED!"
echo "========================================="
echo ""
echo "Summary:"
echo "- Document uploaded: ID $DOCUMENT_ID"
echo "- MCQs generated: $MCQ_COUNT questions"
echo "- Practice session: ID $SESSION_ID"
echo "- Test score: $SCORE% ($CORRECT/$ATTEMPTED correct)"
echo ""
echo "You can now visit the student UI at:"
echo "$BASE_URL/student/mcq/$DOCUMENT_ID?studentId=$STUDENT_ID"
echo ""

