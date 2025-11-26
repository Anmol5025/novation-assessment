'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../store/authStore';
import useDocumentStore from '../../store/documentStore';
import Navbar from '../../components/Navbar';
import DocumentCard from '../../components/DocumentCard';
import UploadModal from '../../components/UploadModal';
import { Upload, FileText, Clock, TrendingUp, Search } from 'lucide-react';
import { analyticsAPI } from '../../lib/api';

export default function DashboardPage() {
  const { isAuthenticated, checkAuth, isLoading: authLoading } = useAuthStore();
  const { documents, fetchDocuments, isLoading } = useDocumentStore();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDocuments({ limit: 6 });
      loadStats();
    }
  }, [isAuthenticated]);

  const loadStats = async () => {
    try {
      const response = await analyticsAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/documents?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Dashboard</h1>
            <p className="text-gray-600 mt-2 font-medium">Manage your legal documents with ease</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold"
          >
            <Upload className="h-5 w-5" />
            <span>Upload Document</span>
          </button>
        </div>

        <div className="mb-8 animate-slide-up">
          <div className="relative glass rounded-xl shadow-lg border border-white/20">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search documents..."
              className="w-full px-4 py-4 pl-14 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400 font-medium"
            />
            <Search className="absolute left-4 top-4 h-6 w-6 text-purple-500" />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            >
              Search
            </button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-slide-up">
            <div className="glass rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Total Documents</p>
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mt-2">{stats.totalDocuments}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <FileText className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="glass rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Recent (30 days)</p>
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-2">{stats.recentDocuments}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="glass rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Upcoming Deadlines</p>
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mt-2">{stats.upcomingDeadlines}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <Clock className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="glass rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Active Documents</p>
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mt-2">
                    {stats.documentsByStatus?.find(s => s._id === 'active')?.count || 0}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-cyan-500 to-blue-500 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <FileText className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Recent Documents</h2>
          <button
            onClick={() => router.push('/documents')}
            className="text-purple-600 hover:text-purple-700 text-sm font-bold flex items-center space-x-1 hover:scale-105 transition-transform"
          >
            <span>View All</span>
            <span>→</span>
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16 glass rounded-2xl border border-white/20 shadow-lg">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-4 rounded-2xl w-fit mx-auto mb-6">
              <FileText className="h-16 w-16 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No documents yet</h3>
            <p className="text-gray-600 mb-6 font-medium">Upload your first document to get started</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Upload Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <DocumentCard key={doc._id} document={doc} />
            ))}
          </div>
        )}
      </main>

      <UploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} />
    </div>
  );
}
