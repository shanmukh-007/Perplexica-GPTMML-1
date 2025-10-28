import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Exam Prep Platform - Home',
  description: 'Prepare for competitive exams like UPSC, SSC with AI-powered study tools',
};

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎓 Exam Prep Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Prepare for competitive exams like UPSC, SSC with AI-powered study tools
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Trainer Card */}
          <Link href="/trainer">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="text-6xl mb-4">👨‍🏫</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Trainer</h2>
              <p className="text-gray-600 mb-6">
                Upload study materials, manage documents, and create learning resources for students
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="mr-2">📤</span> Upload PDFs & Documents
                </li>
                <li className="flex items-center">
                  <span className="mr-2">🖼️</span> Add Images & Diagrams
                </li>
                <li className="flex items-center">
                  <span className="mr-2">🔐</span> Manage Access Control
                </li>
                <li className="flex items-center">
                  <span className="mr-2">📊</span> Track Student Progress
                </li>
              </ul>
              <button className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Enter as Trainer
              </button>
            </div>
          </Link>

          {/* Student Card */}
          <Link href="/student">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-500">
              <div className="text-6xl mb-4">👨‍🎓</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Student</h2>
              <p className="text-gray-600 mb-6">
                Access study materials, practice MCQs, and visualize concepts with mind maps
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="mr-2">📚</span> Browse Study Materials
                </li>
                <li className="flex items-center">
                  <span className="mr-2">❓</span> Practice MCQs
                </li>
                <li className="flex items-center">
                  <span className="mr-2">🗺️</span> View Mind Maps
                </li>
                <li className="flex items-center">
                  <span className="mr-2">🌐</span> Search Current Affairs
                </li>
              </ul>
              <button className="mt-6 w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                Enter as Student
              </button>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Platform Features
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-4xl mb-3">📄</div>
              <h3 className="font-bold text-lg mb-2">PDF RAG</h3>
              <p className="text-sm text-gray-600">
                AI-powered document search and retrieval
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-4xl mb-3">❓</div>
              <h3 className="font-bold text-lg mb-2">MCQ Generator</h3>
              <p className="text-sm text-gray-600">
                Auto-generate practice questions from documents
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-4xl mb-3">🗺️</div>
              <h3 className="font-bold text-lg mb-2">Mind Maps</h3>
              <p className="text-sm text-gray-600">
                Visualize concepts in hierarchical structures
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-4xl mb-3">🌐</div>
              <h3 className="font-bold text-lg mb-2">Web Search</h3>
              <p className="text-sm text-gray-600">
                Stay updated with current affairs and news
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 text-sm">
          <p>Powered by AI • Built for Competitive Exam Success</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
