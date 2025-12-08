import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StatCard } from '../../components/Card';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../api/axiosClient';
import {
  Building2,
  Users,
  Clock,
  FileText,
  Zap,
  BarChart3,
  GraduationCap,
  UserCheck,
  Briefcase,
  FileCheck
} from 'lucide-react';

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
        const count = pendingRes.data.data.count !== undefined
          ? pendingRes.data.data.count
          : pendingRes.data.data.length;
        setPendingCount(count);
      } else if (statsRes.data?.data?.pendingApprovals !== undefined) {
        setPendingCount(statsRes.data.data.pendingApprovals);
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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">SuperAdmin Dashboard</h1>
          <p className="text-emerald-100 text-lg">Manage the entire College Placement Platform from one place.</p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform translate-x-12"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Colleges"
          value={stats?.totalColleges || 0}
          icon={<Building2 className="w-6 h-6" />}
          color="blue"
          trend={12}
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={<Users className="w-6 h-6" />}
          color="purple"
          trend={5}
        />
        <StatCard
          title="Pending Approvals"
          value={pendingCount}
          icon={<Clock className="w-6 h-6" />}
          color="orange"
          className="border-l-4 border-l-orange-400"
        />
        <StatCard
          title="Active Tests"
          value={stats?.activeTests || 0}
          icon={<FileText className="w-6 h-6" />}
          color="green"
          className="border-l-4 border-l-green-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Quick Actions
              </h2>
              <span className="text-sm text-gray-500">Frequently used</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/superadmin/pending">
                <Button variant="primary" fullWidth className="h-14 text-lg shadow-blue-100" icon={UserCheck}>
                  Approve Users ({pendingCount})
                </Button>
              </Link>
              <Link to="/superadmin/colleges">
                <Button variant="outline" fullWidth className="h-14 text-lg" icon={Building2}>
                  Manage Colleges
                </Button>
              </Link>
              <Link to="/superadmin/reports">
                <Button variant="secondary" fullWidth className="h-14 text-lg" icon={BarChart3}>
                  View Global Reports
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* System Overview */}
        <div>
          <Card className="h-full">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              System Overview
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-gray-600 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                  Total Students
                </span>
                <span className="font-bold text-gray-900 bg-white px-3 py-1 rounded shadow-sm">{stats?.totalStudents || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-gray-600 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-gray-400" />
                  Total Instructors
                </span>
                <span className="font-bold text-gray-900 bg-white px-3 py-1 rounded shadow-sm">{stats?.totalInstructors || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-gray-600 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  Total TPOs
                </span>
                <span className="font-bold text-gray-900 bg-white px-3 py-1 rounded shadow-sm">{stats?.totalTPOs || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-gray-600 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-gray-400" />
                  Total Test Attempts
                </span>
                <span className="font-bold text-gray-900 bg-white px-3 py-1 rounded shadow-sm">{stats?.totalAttempts || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

