'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import useAuthStore from '../../../store/authStore';
import useDocumentStore from '../../../store/documentStore';
import Navbar from '../../../components/Navbar';
import { FileText, Calendar, User, Tag, Brain, Trash2, Edit, Download, Share2 } from 'lucide-react';
import { format } from 'date-fns';

export default function DocumentDetailPage() {
  const { isAuthenticated, checkAuth, user } = useAuthStore();
  const { currentDocument, fetchDocument, analyzeDocument, deleteDocument, isLoading } = useDocumentStore();
  const [analyzing, setAnalyzing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated && params.id) {
      fetchDocument(params.id);
    }
  }, [isAuthenticated, params.id]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    await analyzeDocument(params.id);
    setAnalyzing(false);
  };

  const handleDelete = async () => {
    const result = await deleteDocument(params.id);
    if (result.success) {
      router.push('/documents');
    }
  };

  if (!isAuthenticated || isLoading || !currentDocument) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const doc = currentDocument;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4">
              <FileText className="h-12 w-12 text-primary-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{doc.title}</h1>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{doc.uploadedBy?.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(doc.createdAt), 'MMM dd, yyyy')}</span>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    {doc.type}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                    {doc.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                <Brain className="h-4 w-4" />
                <span>{analyzing ? 'Analyzing...' : 'AI Analysis'}</span>
              </button>
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </a>
              {(user?.role === 'admin' || user?.role === 'lawyer') && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {doc.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700">{doc.description}</p>
            </div>
          )}

          {doc.tags && doc.tags.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {doc.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {doc.aiInsights && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Brain className="h-6 w-6 text-purple-600" />
                <span>AI Insights</span>
              </h2>

              {doc.aiInsights.summary && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-md">{doc.aiInsights.summary}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {doc.aiInsights.keyTerms && doc.aiInsights.keyTerms.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Key Terms</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {doc.aiInsights.keyTerms.map((term, index) => (
                        <li key={index}>{term}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {doc.aiInsights.parties && doc.aiInsights.parties.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Parties Involved</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {doc.aiInsights.parties.map((party, index) => (
                        <li key={index}>{party}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {doc.aiInsights.obligations && doc.aiInsights.obligations.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Obligations</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {doc.aiInsights.obligations.map((obligation, index) => (
                        <li key={index}>{obligation}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {doc.aiInsights.risks && doc.aiInsights.risks.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Potential Risks</h3>
                    <ul className="list-disc list-inside text-red-700 space-y-1">
                      {doc.aiInsights.risks.map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {doc.deadlines && doc.deadlines.length > 0 && (
            <div className="border-t pt-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Deadlines</h2>
              <div className="space-y-3">
                {doc.deadlines.map((deadline, index) => (
                  <div key={index} className="flex items-center justify-between bg-orange-50 p-4 rounded-md">
                    <div>
                      <p className="font-medium text-gray-900">{deadline.title}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(deadline.date), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
