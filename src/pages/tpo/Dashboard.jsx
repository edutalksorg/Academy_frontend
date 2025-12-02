import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StatCard } from '../../components/Card';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../api/axiosClient';

export default function TpoDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const res = await api.get('/tpo/stats');
      if (res.data?.data) {
        setStats(res.data.data);
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
        <h1 className="text-3xl font-bold text-gray-900">TPO Dashboard</h1>
        <p className="text-gray-600 mt-1">Training & Placement Officer - Manage your college's placement activities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon="👥"
        />
        <StatCard
          title="Active Tests"
          value={stats?.activeTests || 0}
          icon="📝"
        />
        <StatCard
          title="Test Completion Rate"
          value={stats?.completionRate ? `${stats.completionRate.toFixed(1)}%` : 'N/A'}
          icon="✅"
        />
        <StatCard
          title="Average Score"
          value={stats?.avgScore ? `${stats.avgScore.toFixed(1)}%` : 'N/A'}
          icon="📊"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/tpo/students">
            <Button variant="primary" fullWidth>
              View All Students
            </Button>
          </Link>
          <Link to="/tpo/report">
            <Button variant="secondary" fullWidth>
              College Reports
            </Button>
          </Link>
          <Button variant="secondary" fullWidth onClick={() => window.location.reload()}>
            Refresh Stats
          </Button>
        </div>
      </Card>

      {/* Performance Overview */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Overview</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-700">Students with 80%+ Average</span>
            <span className="font-semibold text-green-600">{stats?.highPerformers || 0}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-700">Students with 50-80% Average</span>
            <span className="font-semibold text-yellow-600">{stats?.mediumPerformers || 0}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-700">Students Below 50%</span>
            <span className="font-semibold text-red-600">{stats?.lowPerformers || 0}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700">Total Test Attempts</span>
            <span className="font-semibold">{stats?.totalAttempts || 0}</span>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">College Information</h2>
        <div className="space-y-2">
          <div className="flex justify-between py-2">
            <span className="text-gray-700">College Name</span>
            <span className="font-medium">{stats?.collegeName || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-700">Total Instructors</span>
            <span className="font-medium">{stats?.totalInstructors || 0}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-700">Tests Created</span>
            <span className="font-medium">{stats?.testsCreated || 0}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

