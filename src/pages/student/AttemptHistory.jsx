import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Table from '../../components/Table';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../api/axiosClient';

export default function AttemptHistory() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadAttempts();
  }, []);

  async function loadAttempts() {
    setLoading(true);
    try {
      const res = await api.get('/student/attempts');
      if (res.data?.data) {
        // Handle both array (legacy) and paginated object { count, rows }
        const attemptsData = res.data.data.rows || res.data.data;
        setAttempts(attemptsData);
        calculateStats(attemptsData);
      }
    } catch (err) {
      console.error('Failed to load attempts:', err);
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(data) {
    if (data.length === 0) {
      setStats(null);
      return;
    }
    const totalScore = data.reduce((sum, a) => sum + (a.totalScore || 0), 0);
    const avgScore = totalScore / data.length;
    const highestScore = Math.max(...data.map(a => a.totalScore || 0));
    const lowestScore = Math.min(...data.map(a => a.totalScore || 0));

    setStats({ avgScore, highestScore, lowestScore, totalAttempts: data.length });
  }

  const columns = [
    {
      header: 'Test Name',
      accessor: 'Test',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.Test?.title || 'N/A'}</div>
          <div className="text-sm text-gray-500">
            {new Date(row.completedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      )
    },
    {
      header: 'Score',
      accessor: 'totalScore',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${row.totalScore >= 70 ? 'text-green-600' :
            row.totalScore >= 50 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
            {row.totalScore}%
          </span>
        </div>
      )
    },
    {
      header: 'Performance',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${row.totalScore >= 70 ? 'bg-green-100 text-green-800' :
          row.totalScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
          {row.totalScore >= 70 ? 'Excellent' :
            row.totalScore >= 50 ? 'Good' :
              'Needs Improvement'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium uppercase">
          {row.status}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Test Results</h1>
        <p className="text-gray-600 mt-1">View your test attempt history and performance</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card variant="stat">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalAttempts}</div>
            <div className="text-sm text-gray-600 mt-1">Total Attempts</div>
          </Card>
          <Card variant="stat">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-2xl font-bold text-blue-600">{stats.avgScore.toFixed(1)}%</div>
            <div className="text-sm text-gray-600 mt-1">Average Score</div>
          </Card>
          <Card variant="stat">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-green-600">{stats.highestScore}%</div>
            <div className="text-sm text-gray-600 mt-1">Highest Score</div>
          </Card>
          <Card variant="stat">
            <div className="text-3xl mb-2">📉</div>
            <div className="text-2xl font-bold text-red-600">{stats.lowestScore}%</div>
            <div className="text-sm text-gray-600 mt-1">Lowest Score</div>
          </Card>
        </div>
      )}

      {/* Attempts Table */}
      {loading ? (
        <LoadingSpinner size="lg" className="py-12" />
      ) : attempts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 text-lg mb-4">No test attempts yet</p>
            <Link to="/student/tests">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Take Your First Test
              </button>
            </Link>
          </div>
        </Card>
      ) : (
        <Table
          columns={columns}
          data={attempts}
          emptyMessage="No test attempts found"
        />
      )}
    </div>
  );
}
