import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trainer Dashboard - Exam Prep Platform',
  description: 'Upload and manage study materials for students',
};

export default function TrainerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            🎓 Exam Prep Platform
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">👨‍🏫 Trainer Mode</span>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Trainer Dashboard
          </h1>
          <p className="text-gray-600">
            Upload and manage study materials for your students
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📤</div>
            <h3 className="text-xl font-bold mb-2">Upload Documents</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Upload PDFs, DOCX, and other study materials
            </p>
            <Link
              href="/trainer/upload"
              className="block w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Upload New Document
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🖼️</div>
            <h3 className="text-xl font-bold mb-2">Add Images</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Upload diagrams, charts, and visual aids
            </p>
            <Link
              href="/trainer/upload"
              className="block w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-center"
            >
              Upload Images
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">View Analytics</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Track student progress and engagement
            </p>
            <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
              View Analytics
            </button>
          </div>
        </div>

        {/* Document Management */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Your Documents</h2>
          
          {/* Placeholder for document list */}
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📁</div>
            <p className="text-lg mb-2">No documents uploaded yet</p>
            <p className="text-sm">Upload your first document to get started</p>
          </div>
        </div>

        {/* Features Info */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-3 text-blue-900">
              📝 Document Features
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Add metadata (subject, topic, description)</li>
              <li>• Set visibility (public, group, private)</li>
              <li>• Manage access control for students</li>
              <li>• Automatic text extraction and chunking</li>
              <li>• AI-powered embeddings for search</li>
            </ul>
          </div>

          <div className="bg-purple-50 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-3 text-purple-900">
              🎯 Student Tools
            </h3>
            <ul className="space-y-2 text-sm text-purple-800">
              <li>• Auto-generate MCQs from your documents</li>
              <li>• Create mind maps for visual learning</li>
              <li>• Enable RAG-based document search</li>
              <li>• Track student quiz performance</li>
              <li>• Monitor study session analytics</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

