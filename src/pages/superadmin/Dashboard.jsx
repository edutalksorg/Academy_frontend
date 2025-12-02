import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StatCard } from '../../components/Card';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../api/axiosClient';

export default function SuperadminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/pending-users')
      ]);

      if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      }

      if (pendingRes.data?.data) {
        setPendingCount(pendingRes.data.data.length);
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
        <h1 className="text-3xl font-bold text-gray-900">SuperAdmin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage the entire College Placement Platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Colleges"
          value={stats?.totalColleges || 0}
          icon="🏫"
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon="👥"
        />
        <StatCard
          title="Pending Approvals"
          value={pendingCount}
          icon="⏳"
        />
        <StatCard
          title="Active Tests"
          value={stats?.activeTests || 0}
          icon="📝"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/superadmin/pending">
            <Button variant="primary" fullWidth>
              Approve Users ({pendingCount})
            </Button>
          </Link>
          <Link to="/superadmin/colleges">
            <Button variant="secondary" fullWidth>
              Manage Colleges
            </Button>
          </Link>
          <Link to="/superadmin/reports">
            <Button variant="secondary" fullWidth>
              View Global Reports
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Overview</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-700">Total Students</span>
            <span className="font-semibold">{stats?.totalStudents || 0}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-700">Total Instructors</span>
            <span className="font-semibold">{stats?.totalInstructors || 0}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-700">Total TPOs</span>
            <span className="font-semibold">{stats?.totalTPOs || 0}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700">Total Test Attempts</span>
            <span className="font-semibold">{stats?.totalAttempts || 0}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

