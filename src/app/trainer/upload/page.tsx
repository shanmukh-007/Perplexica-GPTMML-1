'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, Image as ImageIcon, CheckCircle } from 'lucide-react';

const TrainerUploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('trainerId', 'trainer-001'); // TODO: Replace with actual trainer ID from auth
      formData.append('subject', subject);
      formData.append('topic', topic);
      formData.append('description', description);
      formData.append('visibility', visibility);

      // Call upload API
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      console.log('Upload successful:', data);
      setIsUploading(false);
      setUploadSuccess(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setSelectedFile(null);
        setSubject('');
        setTopic('');
        setDescription('');
        setVisibility('public');
        setUploadSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/trainer"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Upload className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Upload Document</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add study materials for students
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Error Message */}
          {uploadError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <p className="text-red-700 dark:text-red-300 text-sm">
                <strong>Error:</strong> {uploadError}
              </p>
            </div>
          )}

          {uploadSuccess ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
                Upload Successful!
              </h2>
              <p className="text-green-700 dark:text-green-300">
                Your document has been processed and is now available to students.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select File
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 dark:hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {selectedFile ? (
                      <>
                        <FileText className="w-12 h-12 text-purple-600 dark:text-purple-400 mb-2" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PDF, DOCX, or TXT (max 50MB)
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Subject */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., History, Geography, Science"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                />
              </div>

              {/* Topic */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Ancient India, World War II"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the document content..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                />
              </div>

              {/* Visibility */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Visibility
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                >
                  <option value="public">Public - All students can access</option>
                  <option value="group">Group - Specific groups only</option>
                  <option value="private">Private - No student access</option>
                </select>
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload Document
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                Documents are processed with AI embeddings for intelligent search
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TrainerUploadPage;

