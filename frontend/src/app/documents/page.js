'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuthStore from '../../store/authStore';
import useDocumentStore from '../../store/documentStore';
import Navbar from '../../components/Navbar';
import DocumentCard from '../../components/DocumentCard';
import UploadModal from '../../components/UploadModal';
import { Upload, Filter, FileText } from 'lucide-react';

export default function DocumentsPage() {
  const { isAuthenticated, checkAuth, isLoading: authLoading } = useAuthStore();
  const { documents, fetchDocuments, isLoading, totalPages, currentPage } = useDocumentStore();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filters, setFilters] = useState({ type: '', status: '', search: '' });
  const router = useRouter();
  const searchParams = useSearchParams();

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
      const search = searchParams.get('search') || '';
      setFilters(prev => ({ ...prev, search }));
      fetchDocuments({ ...filters, search, page: 1 });
    }
  }, [isAuthenticated, searchParams]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchDocuments({ ...newFilters, page: 1 });
  };

  const handlePageChange = (page) => {
    fetchDocuments({ ...filters, page });
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Documents</h1>
            <p className="text-gray-600 mt-2 font-medium">Browse and manage all your documents</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold"
          >
            <Upload className="h-5 w-5" />
            <span>Upload</span>
          </button>
        </div>

        <div className="glass rounded-xl shadow-lg border border-white/20 p-6 mb-6 animate-slide-up">
          <div className="flex items-center space-x-2 mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-lg">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Types</option>
                <option value="contract">Contract</option>
                <option value="nda">NDA</option>
                <option value="agreement">Agreement</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search documents..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16 glass rounded-2xl border border-white/20 shadow-lg">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-4 rounded-2xl w-fit mx-auto mb-4">
              <FileText className="h-16 w-16 text-white" />
            </div>
            <p className="text-gray-600 font-semibold text-lg">No documents found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {documents.map((doc) => (
                <DocumentCard key={doc._id} document={doc} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                      page === currentPage
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105'
                        : 'glass text-gray-700 border border-white/20 hover:border-purple-300 hover:scale-105'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <UploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} />
    </div>
  );
}
