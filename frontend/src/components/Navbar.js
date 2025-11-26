'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuthStore from '../store/authStore';
import { FileText, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="glass border-b border-white/20 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-br from-purple-600 to-blue-500 p-2 rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">LegalDocs</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-2">
              <Link href="/dashboard" className="text-gray-700 hover:text-purple-600 px-4 py-2 text-sm font-medium rounded-lg hover:bg-purple-50 transition-all duration-200">
                Dashboard
              </Link>
              <Link href="/documents" className="text-gray-700 hover:text-purple-600 px-4 py-2 text-sm font-medium rounded-lg hover:bg-purple-50 transition-all duration-200">
                Documents
              </Link>
              <Link href="/deadlines" className="text-gray-700 hover:text-purple-600 px-4 py-2 text-sm font-medium rounded-lg hover:bg-purple-50 transition-all duration-200">
                Deadlines
              </Link>
              <Link href="/analytics" className="text-gray-700 hover:text-purple-600 px-4 py-2 text-sm font-medium rounded-lg hover:bg-purple-50 transition-all duration-200">
                Analytics
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-2 rounded-full">
              <div className="bg-gradient-to-br from-purple-600 to-blue-500 p-1.5 rounded-full">
                <User className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">{user?.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium rounded-lg hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
