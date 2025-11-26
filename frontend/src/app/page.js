'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../store/authStore';
import { FileText, Brain, Users, Shield } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router, checkAuth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <nav className="glass-dark border-b border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">LegalDocs</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/login" className="px-4 py-2 text-white hover:text-white/80 font-medium transition-colors">
                Login
              </Link>
              <Link href="/register" className="px-6 py-2 bg-white text-purple-600 rounded-lg hover:bg-white/90 font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="text-center mb-20 animate-fade-in">
          <h1 className="text-6xl font-extrabold text-white mb-6 leading-tight">
            Smart Legal Document
            <br />
            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Management Platform</span>
          </h1>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto font-medium">
            Upload, analyze, and manage your legal documents with AI-powered insights. Streamline your workflow today.
          </p>
          <Link href="/register" className="inline-block px-10 py-4 bg-white text-purple-600 text-lg font-bold rounded-xl hover:bg-white/90 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
            Start Free Trial →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 animate-slide-up">
          <div className="glass-dark p-8 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 group">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-3 rounded-xl w-fit mb-4 group-hover:shadow-lg transition-shadow">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Document Storage</h3>
            <p className="text-white/80">Securely store and organize all your legal documents in one centralized place</p>
          </div>

          <div className="glass-dark p-8 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 group" style={{animationDelay: '0.1s'}}>
            <div className="bg-gradient-to-br from-purple-400 to-pink-500 p-3 rounded-xl w-fit mb-4 group-hover:shadow-lg transition-shadow">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI Analysis</h3>
            <p className="text-white/80">Get instant insights, key terms, and comprehensive risk analysis powered by AI</p>
          </div>

          <div className="glass-dark p-8 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 group" style={{animationDelay: '0.2s'}}>
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-3 rounded-xl w-fit mb-4 group-hover:shadow-lg transition-shadow">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Team Collaboration</h3>
            <p className="text-white/80">Share documents and collaborate with your team seamlessly in real-time</p>
          </div>

          <div className="glass-dark p-8 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 group" style={{animationDelay: '0.3s'}}>
            <div className="bg-gradient-to-br from-orange-400 to-red-500 p-3 rounded-xl w-fit mb-4 group-hover:shadow-lg transition-shadow">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Enterprise Security</h3>
            <p className="text-white/80">Bank-level encryption and role-based access control for maximum protection</p>
          </div>
        </div>
      </main>
    </div>
  );
}
