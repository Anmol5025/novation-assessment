'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../store/authStore';
import Navbar from '../../components/Navbar';
import { Calendar, Clock, FileText, AlertCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { deadlinesAPI } from '../../lib/api';
import Link from 'next/link';

export default function DeadlinesPage() {
  const { isAuthenticated, checkAuth, isLoading: authLoading } = useAuthStore();
  const [deadlines, setDeadlines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [daysFilter, setDaysFilter] = useState(30);
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
      loadDeadlines();
    }
  }, [isAuthenticated, daysFilter]);

  const loadDeadlines = async () => {
    setIsLoading(true);
    try {
      const response = await deadlinesAPI.getAll({ upcoming: daysFilter });
      setDeadlines(response.data.deadlines);
    } catch (error) {
      console.error('Failed to load deadlines:', error);
    }
    setIsLoading(false);
  };

  const getUrgencyColor = (date) => {
    const days = differenceInDays(new Date(date), new Date());
    if (days <= 7) return 'bg-red-100 border-red-300 text-red-800';
    if (days <= 14) return 'bg-orange-100 border-orange-300 text-orange-800';
    return 'bg-green-100 border-green-300 text-green-800';
  };

  const getUrgencyLabel = (date) => {
    const days = differenceInDays(new Date(date), new Date());
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days <= 7) return `${days} days`;
    return `${days} days`;
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deadlines</h1>
            <p className="text-gray-600 mt-1">Track important dates and obligations</p>
          </div>
          <div>
            <select
              value={daysFilter}
              onChange={(e) => setDaysFilter(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={7}>Next 7 days</option>
              <option value={14}>Next 14 days</option>
              <option value={30}>Next 30 days</option>
              <option value={60}>Next 60 days</option>
              <option value={90}>Next 90 days</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading deadlines...</p>
          </div>
        ) : deadlines.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming deadlines</h3>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deadlines.map((deadline, index) => (
              <Link key={index} href={`/documents/${deadline.documentId}`}>
                <div className={`bg-white rounded-lg shadow-sm border-2 p-6 hover:shadow-md transition-shadow cursor-pointer ${getUrgencyColor(deadline.date)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="bg-white p-3 rounded-lg">
                        <Calendar className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {deadline.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <FileText className="h-4 w-4" />
                            <span>{deadline.documentTitle}</span>
                          </div>
                          <span className="px-2 py-1 bg-white text-xs font-medium rounded">
                            {deadline.documentType}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center space-x-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">
                            {format(new Date(deadline.date), 'MMMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-bold text-lg">
                        {getUrgencyLabel(deadline.date)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
