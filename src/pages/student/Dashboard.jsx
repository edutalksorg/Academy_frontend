import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StatCard } from '../../components/Card';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../api/axiosClient';
import { useAuth } from '../../contexts/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTests, setRecentTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const [statsRes, testsRes] = await Promise.all([
        api.get('/student/stats'),
        api.get('/student/recent-tests')
      ]);

      if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      }

      if (testsRes.data?.data) {
        setRecentTests(testsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name || 'Student'}!</h1>
        <p className="text-gray-600 mt-1">Take tests and track your performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Tests Completed"
          value={stats?.completedTests || 0}
          icon="✅"
        />
        <StatCard
          title="Average Score"
          value={stats?.avgScore ? `${stats.avgScore.toFixed(1)}%` : 'N/A'}
          icon="📊"
        />
        <StatCard
          title="Available Tests"
          value={stats?.availableTests || 0}
          icon="📝"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/student/tests">
            <Button variant="primary" fullWidth>
              Browse Available Tests
            </Button>
          </Link>
          <Link to="/student/attempts">
            <Button variant="secondary" fullWidth>
              View My Results
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent Test Results */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Test Results</h2>
        {recentTests.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No test attempts yet. Start taking tests to see your results here!</p>
        ) : (
          <div className="space-y-3">
            {recentTests.map((attempt) => {
              const totalMaxScore = attempt.Test?.Questions?.length || attempt.Test?.totalMarks || 1;
              const percentage = Math.round((attempt.totalScore / totalMaxScore) * 100);

              return (
                <div key={attempt.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                  <div>
                    <div className="font-medium text-gray-900">{attempt.Test?.title || 'Test'}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(attempt.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${percentage >= 70 ? 'text-green-600' :
                      percentage >= 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                      {percentage}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {percentage >= 70 ? 'Excellent' :
                        percentage >= 50 ? 'Good' :
                          'Needs Improvement'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
