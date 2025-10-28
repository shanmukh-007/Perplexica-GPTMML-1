import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Dashboard - Exam Prep Platform',
  description: 'Access study materials and practice for competitive exams',
};

export default function StudentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-purple-600">
            🎓 Exam Prep Platform
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">👨‍🎓 Student Mode</span>
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
            Student Dashboard
          </h1>
          <p className="text-gray-600">
            Access study materials and practice for your exams
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-lg font-bold mb-2">Browse Documents</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Access study materials
            </p>
            <Link
              href="/student/chat?mode=documents"
              className="block w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm text-center"
            >
              Browse
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">❓</div>
            <h3 className="text-lg font-bold mb-2">Practice MCQs</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Test your knowledge
            </p>
            <Link
              href="/student/chat?mode=mcq"
              className="block w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm text-center"
            >
              Start Quiz
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-lg font-bold mb-2">Mind Maps</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Visualize concepts
            </p>
            <Link
              href="/student/chat?mode=mindmap"
              className="block w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm text-center"
            >
              View Maps
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-lg font-bold mb-2">Web Search</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Current affairs
            </p>
            <Link
              href="/student/chat?mode=websearch"
              className="block w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm text-center"
            >
              Search
            </Link>
          </div>
        </div>

        {/* Study Progress */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="text-3xl mb-2">📖</div>
            <div className="text-3xl font-bold mb-1">0</div>
            <div className="text-purple-100">Documents Studied</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-3xl font-bold mb-1">0</div>
            <div className="text-blue-100">MCQs Attempted</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-3xl font-bold mb-1">0%</div>
            <div className="text-green-100">Average Score</div>
          </div>
        </div>

        {/* Available Documents */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
          <h2 className="text-2xl font-bold mb-6">Available Study Materials</h2>
          
          {/* Placeholder for document list */}
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-lg mb-2">No documents available yet</p>
            <p className="text-sm">Check back later for study materials</p>
          </div>
        </div>

        {/* Features Info */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-purple-50 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-3 text-purple-900">
              📄 Document Search
            </h3>
            <p className="text-sm text-purple-800">
              Use AI-powered RAG to search across all study materials and find relevant information instantly
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-3 text-blue-900">
              ❓ Smart MCQs
            </h3>
            <p className="text-sm text-blue-800">
              Practice with auto-generated MCQs from documents. Get instant feedback and explanations
            </p>
          </div>

          <div className="bg-green-50 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-3 text-green-900">
              🗺️ Visual Learning
            </h3>
            <p className="text-sm text-green-800">
              Understand complex topics with AI-generated mind maps and hierarchical concept visualization
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

