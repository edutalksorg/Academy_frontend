import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StatCard } from '../../components/Card';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../api/axiosClient';

export default function InstructorDashboard() {
  const [stats, setStats] = useState(null);
  const [myTests, setMyTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const [statsRes, testsRes] = await Promise.all([
        api.get('/instructor/stats'),
        api.get('/tests/my-tests')
      ]);

      if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      }

      if (testsRes.data?.data) {
        setMyTests(testsRes.data.data.slice(0, 5)); // Show only 5 recent tests
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
        <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
        <p className="text-gray-600 mt-1">Create and manage tests for students</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Tests"
          value={stats?.totalTests || 0}
          icon="📝"
        />
        <StatCard
          title="Published Tests"
          value={stats?.publishedTests || 0}
          icon="✅"
        />
        <StatCard
          title="Total Attempts"
          value={stats?.totalAttempts || 0}
          icon="📊"
        />
        <StatCard
          title="Avg Score"
          value={stats?.avgScore ? `${stats.avgScore.toFixed(1)}%` : 'N/A'}
          icon="🎯"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/instructor/tests/new">
            <Button variant="primary" fullWidth>
              ➕ Create New Test
            </Button>
          </Link>
          <Link to="/instructor/tests">
            <Button variant="secondary" fullWidth>
              View All My Tests
            </Button>
          </Link>
          <Button variant="secondary" fullWidth onClick={() => window.location.reload()}>
            Refresh Stats
          </Button>
        </div>
      </Card>

      {/* My Recent Tests */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">My Recent Tests</h2>
          <Link to="/instructor/tests" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All →
          </Link>
        </div>
        {myTests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't created any tests yet.</p>
            <Link to="/instructor/tests/new">
              <Button variant="primary">Create Your First Test</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myTests.map((test) => (
              <div key={test.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{test.title}</div>
                  <div className="text-sm text-gray-500">
                    {test.Questions?.length || 0} questions • {test.timeLimit} minutes
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${test.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                    }`}>
                    {test.status}
                  </span>
                  <Link to={`/instructor/tests/${test.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

