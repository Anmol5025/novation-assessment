'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../store/authStore';
import Navbar from '../../components/Navbar';
import { FileText, TrendingUp, Clock, Activity } from 'lucide-react';
import { analyticsAPI } from '../../lib/api';
import { format } from 'date-fns';

export default function AnalyticsPage() {
  const { isAuthenticated, checkAuth, isLoading: authLoading } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState(30);
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
      loadAnalytics();
    }
  }, [isAuthenticated, period]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await analyticsAPI.getStats({ period });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
    setIsLoading(false);
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
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">Insights and statistics</p>
          </div>
          <div>
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        ) : stats ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Documents</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalDocuments}</p>
                  </div>
                  <FileText className="h-12 w-12 text-primary-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Recent Uploads</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.recentDocuments}</p>
                    <p className="text-xs text-gray-500 mt-1">Last {period} days</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Upcoming Deadlines</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.upcomingDeadlines}</p>
                  </div>
                  <Clock className="h-12 w-12 text-orange-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Recent Activity</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.recentActivity?.length || 0}</p>
                  </div>
                  <Activity className="h-12 w-12 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents by Type</h2>
                <div className="space-y-3">
                  {stats.documentsByType?.map((item) => (
                    <div key={item._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                        <span className="text-gray-700 capitalize">{item._id}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents by Status</h2>
                <div className="space-y-3">
                  {stats.documentsByStatus?.map((item) => (
                    <div key={item._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          item._id === 'active' ? 'bg-green-600' :
                          item._id === 'expired' ? 'bg-red-600' : 'bg-gray-600'
                        }`}></div>
                        <span className="text-gray-700 capitalize">{item._id}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {stats.recentActivity && stats.recentActivity.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center space-x-3">
                        <Activity className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.documentId?.title || 'Document'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">No analytics data available</p>
          </div>
        )}
      </main>
    </div>
  );
}
