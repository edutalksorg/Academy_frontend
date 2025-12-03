import React, { useEffect, useState } from 'react';
import Table from '../../components/Table';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../api/axiosClient';

export default function CollegeStudents() {
  const [students, setStudents] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/tpo/students', { params: { q } });
      if (res.data?.data) {
        // Handle findAndCountAll response format
        const data = res.data.data.rows || res.data.data;
        setStudents(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    {
      header: 'Student Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      )
    },
    {
      header: 'Tests Taken',
      accessor: 'testsTaken',
      render: (row) => (
        <span className="font-semibold">{row.Attempts?.length || 0}</span>
      )
    },
    {
      header: 'Average Score',
      render: (row) => {
        const attempts = row.Attempts || [];
        if (attempts.length === 0) return <span className="text-gray-400">N/A</span>;
        const avg = attempts.reduce((sum, a) => sum + (a.totalScore || 0), 0) / attempts.length;
        return (
          <span className={`font-semibold ${avg >= 70 ? 'text-green-600' :
            avg >= 50 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
            {avg.toFixed(1)}%
          </span>
        );
      }
    },
    {
      header: 'Tab Switches',
      render: (row) => {
        const attempts = row.Attempts || [];
        const totalSwitches = attempts.reduce((sum, a) => sum + (a.tabSwitchCount || 0), 0);

        if (totalSwitches === 0) return <span className="text-green-600 font-medium">0 ✓</span>;

        return (
          <div className="flex items-center gap-1">
            <span className={`font-bold ${totalSwitches > 2 ? 'text-red-600' : 'text-yellow-600'}`}>
              {totalSwitches}
            </span>
            {totalSwitches > 0 && <span title="Tab switching detected">⚠️</span>}
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'active'
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800'
          }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Joined',
      accessor: 'createdAt',
      render: (row) => (
        <span className="text-sm text-gray-600">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">College Students</h1>
        <p className="text-gray-600 mt-1">View and manage students in your college</p>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button onClick={load} variant="primary">
          Search
        </Button>
      </div>

      {/* Summary Card */}
      {!loading && students.length > 0 && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">{students.length}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {students.filter(s => s.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active Students</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {students.reduce((sum, s) => sum + (s.Attempts?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Test Attempts</div>
            </div>
          </div>
        </Card>
      )}

      {/* Students Table */}
      {loading ? (
        <LoadingSpinner size="lg" className="py-12" />
      ) : (
        <Table
          columns={columns}
          data={students}
          emptyMessage="No students found in your college"
        />
      )}
    </div>
  );
}

