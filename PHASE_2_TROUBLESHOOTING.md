# 🔧 Phase 2 Troubleshooting Guide

## ❌ Error: "Failed to load AI models. Please configure a model provider."

### **Root Cause Analysis**

The error occurred due to **three interconnected issues**:

1. **Incorrect API Key in Config File**
   - The `data/config.json` file had a placeholder API key `"your_gemini_api_key_here"`
   - The config manager should have picked up the API key from `.env`, but the config file was created before the environment variable was properly set

2. **Async/Sync Method Mismatch**
   - The `getActiveProviders()` method in `ModelRegistry` is async and returns a Promise
   - Our document APIs were calling it synchronously without `await`
   - This caused `providers.find is not a function` error

3. **Incorrect Model Name Format**
   - Gemini API returns model names in format: `models/embedding-gecko-001` (for embeddings) and `models/gemini-2.5-flash` (for chat)
   - We were trying to load models with hardcoded names that don't exist: `text-embedding-004` and `gemini-2.0-flash-exp`
   - This caused model loading failures

---

## ✅ Fixes Applied

### **Fix 1: Updated Config File**

**File:** `data/config.json`

**Changed:**
```json
{
  "config": {
    "apiKey": "your_gemini_api_key_here"  // ❌ OLD
  }
}
```

**To:**
```json
{
  "config": {
    "apiKey": "AIzaSyApM5vVIamJEH8Wn6_NaPR77a7JSGxkPfs"  // ✅ NEW (from .env)
  }
}
```

**Why:** The config manager initializes providers from the config file, not directly from environment variables. The config file needs to have the actual API key.

---

### **Fix 2: Added Synchronous Method to ModelRegistry**

**File:** `src/lib/models/registry.ts`

**Added new method:**
```typescript
getRawActiveProviders() {
  return this.activeProviders;
}
```

**Why:** This provides synchronous access to the raw active providers array, avoiding the async/await issue.

---

### **Fix 3: Updated Document Upload API**

**File:** `src/app/api/documents/upload/route.ts`

**Changed:**
```typescript
// ❌ OLD - Async method called synchronously with hardcoded model name
const providers = registry.getActiveProviders();
const geminiProvider = providers.find(p => p.type === 'gemini');

embeddingModel = await registry.loadEmbeddingModel(
  geminiProvider.id,
  'text-embedding-004'  // ❌ Hardcoded, doesn't exist
);
```

**To:**
```typescript
// ✅ NEW - Synchronous method with dynamic model selection
const providers = registry.getRawActiveProviders();
const geminiProvider = providers.find(p => p.type === 'gemini');

// Get available models from the provider
const modelList = await geminiProvider.provider.getModelList();
const embeddingModelKey = modelList.embedding[0].key; // e.g., models/embedding-gecko-001

embeddingModel = await registry.loadEmbeddingModel(
  geminiProvider.id,
  embeddingModelKey  // ✅ Dynamic, uses first available model
);
```

---

### **Fix 4: Updated Document Search API**

**File:** `src/app/api/documents/search/route.ts`

**Changed:**
```typescript
// ❌ OLD - Hardcoded model names
const providers = registry.getActiveProviders();
const geminiProvider = providers.find(p => p.type === 'gemini');

embeddingModel = await registry.loadEmbeddingModel(
  geminiProvider.id,
  'text-embedding-004'  // ❌ Doesn't exist
);
chatModel = await registry.loadChatModel(
  geminiProvider.id,
  'gemini-2.0-flash-exp'  // ❌ Doesn't exist
);
```

**To:**
```typescript
// ✅ NEW - Dynamic model selection
const providers = registry.getRawActiveProviders();
const geminiProvider = providers.find(p => p.type === 'gemini');

// Get available models from the provider
const modelList = await geminiProvider.provider.getModelList();
const embeddingModelKey = modelList.embedding[0].key; // e.g., models/embedding-gecko-001
const chatModelKey = modelList.chat[0].key; // e.g., models/gemini-2.5-flash

embeddingModel = await registry.loadEmbeddingModel(
  geminiProvider.id,
  embeddingModelKey
);
chatModel = await registry.loadChatModel(
  geminiProvider.id,
  chatModelKey
);
```

---

## 🧪 Testing the Fix

### **Test 1: Verify Gemini Provider is Loaded**

**Check server logs on startup:**
```
✓ Ready in 2.4s
Using Neon PostgreSQL with Drizzle Kit migrations
```

**Should NOT see:**
```
Failed to get model list. Type: gemini, ID: ..., Error: Cannot read properties of undefined
```

---

### **Test 2: Upload a Document**

**Steps:**
1. Go to `http://localhost:3000/trainer/upload`
2. Upload a small text file
3. Fill in metadata
4. Click "Upload Document"

**Expected Server Logs:**
```
File saved: /path/to/uploads/documents/...
Extracted X document(s)
Created X chunks
Generated X embeddings
Document inserted with ID: X
Inserted X chunks into database
```

**Should NOT see:**
```
Error loading embedding model: TypeError: providers.find is not a function
```

---

### **Test 3: Ask a Question**

**Steps:**
1. Go to `http://localhost:3000/student/chat?mode=documents`
2. Type a question related to your uploaded document
3. Press Enter

**Expected Server Logs:**
```
Processing query: "..." for student: student-001
Generated query embedding (dimension: 768)
Found X accessible documents
Retrieved X chunks from accessible documents
Found X similar chunks
```

**Expected Response:**
- AI-generated answer based on document content
- Source citations at the bottom
- No error messages

**Should NOT see:**
```
Error loading models: TypeError: providers.find is not a function
Failed to load AI models. Please configure a model provider.
```

---

## 🔍 Debugging Tips

### **Check Config File:**
```bash
cat data/config.json | grep -A 5 "gemini"
```

**Should show:**
```json
{
  "name": "Google Gemini",
  "type": "gemini",
  "config": {
    "apiKey": "AIzaSy..."  // Should be your actual API key
  }
}
```

---

### **Check Environment Variables:**
```bash
grep GEMINI_API_KEY .env
```

**Should show:**
```
GEMINI_API_KEY=AIzaSyApM5vVIamJEH8Wn6_NaPR77a7JSGxkPfs
```

---

### **Test Gemini API Key:**
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY"
```

**Should return:**
```json
{
  "models": [
    {
      "name": "models/text-embedding-004",
      "displayName": "Text Embedding 004",
      ...
    },
    ...
  ]
}
```

---

## 🚨 Common Issues

### **Issue 1: "Cannot read properties of undefined (reading 'forEach')"**

**Cause:** Invalid or expired Gemini API key

**Solution:**
1. Verify API key in `.env` is correct
2. Check if API key is active in Google AI Studio
3. Update `data/config.json` with correct API key
4. Restart server

---

### **Issue 2: "Error Loading Gemini Chat Model. Invalid Model Selected"**

**Cause:** Hardcoded model names don't exist in the Gemini API

**Solution:**
- Don't hardcode model names
- Dynamically fetch available models using `provider.getModelList()`
- Use the first available model from the list
- Available models: `models/embedding-gecko-001` (embedding), `models/gemini-2.5-flash` (chat)

---

### **Issue 3: "No model provider available"**

**Cause:** Gemini provider not initialized or no providers configured

**Solution:**
1. Check `data/config.json` has Gemini provider entry
2. Verify API key is set in config
3. Restart server to reinitialize providers

---

## 📝 Summary of Changes

### **Files Modified:**
1. `data/config.json` - Updated Gemini API key
2. `src/lib/models/registry.ts` - Added `getRawActiveProviders()` method
3. `src/app/api/documents/upload/route.ts` - Fixed provider access and model names
4. `src/app/api/documents/search/route.ts` - Fixed provider access and model names

### **Key Learnings:**
1. **Config file takes precedence** over environment variables for provider initialization
2. **Model names must include the `models/` prefix** for Gemini API
3. **Async methods must be awaited** or use synchronous alternatives
4. **Provider initialization happens at server startup**, not on-demand

---

## ✅ Verification Checklist

- [x] Config file has correct Gemini API key
- [x] `getRawActiveProviders()` method added to ModelRegistry
- [x] Document upload API uses correct method and model names
- [x] Document search API uses correct method and model names
- [x] Server starts without errors
- [x] No "Failed to get model list" errors in logs
- [x] Document upload works without errors
- [x] Student chat returns AI responses
- [x] Source citations are displayed

---

## 🎉 Success Criteria

**Phase 2 is complete when:**
1. ✅ Documents can be uploaded successfully
2. ✅ Text is extracted and chunked
3. ✅ Embeddings are generated with Gemini
4. ✅ Students can ask questions
5. ✅ AI responses are generated with source citations
6. ✅ No errors in server logs
7. ✅ All RAG workflow steps execute correctly

---

**🚀 Phase 2 RAG Implementation is now fully functional!**

