'use client';
import { FileText, Calendar, User, Tag } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function DocumentCard({ document }) {
  const getTypeColor = (type) => {
    const colors = {
      contract: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
      nda: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      agreement: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
      other: 'bg-gradient-to-r from-gray-500 to-slate-500 text-white',
    };
    return colors[type] || colors.other;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
      expired: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
      archived: 'bg-gradient-to-r from-gray-500 to-slate-500 text-white',
    };
    return colors[status] || colors.active;
  };

  return (
    <Link href={`/documents/${document._id}`}>
      <div className="group glass rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-purple-600 to-blue-500 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{document.title}</h3>
                <p className="text-sm text-gray-500 font-medium">
                  {document.fileSize ? `${(document.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${getTypeColor(document.type)}`}>
                {document.type}
              </span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${getStatusColor(document.status)}`}>
                {document.status}
              </span>
            </div>
          </div>

          {document.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{document.description}</p>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4 text-purple-500" />
                <span className="font-medium">{document.uploadedBy?.name || 'Unknown'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="font-medium">{format(new Date(document.createdAt), 'MMM dd, yyyy')}</span>
              </div>
            </div>
            {document.tags && document.tags.length > 0 && (
              <div className="flex items-center space-x-1 bg-purple-50 px-2 py-1 rounded-full">
                <Tag className="h-3.5 w-3.5 text-purple-600" />
                <span className="text-xs font-semibold text-purple-600">{document.tags.length}</span>
              </div>
            )}
          </div>

          {document.aiInsights?.summary && (
            <div className="mt-4 pt-4 border-t border-purple-100">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3">
                <p className="text-xs text-gray-700 italic line-clamp-2 font-medium">
                  <span className="text-purple-600 font-bold">AI:</span> {document.aiInsights.summary}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
