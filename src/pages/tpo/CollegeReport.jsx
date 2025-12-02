import React, { useEffect, useState } from 'react';
import { StatCard } from '../../components/Card';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../api/axiosClient';

export default function CollegeReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setDateFrom(thirtyDaysAgo.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);

    loadReport();
  }, []);

  async function loadReport() {
    setLoading(true);
    try {
      const params = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const res = await api.get('/tpo/college-report', { params });
      if (res.data?.data) {
        setReport(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load report:', err);
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
        <h1 className="text-3xl font-bold text-gray-900">College Report</h1>
        <p className="text-gray-600 mt-1">Comprehensive analytics for your college's performance</p>
      </div>

      {/* Date Range Filter */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by Date Range</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button onClick={loadReport} variant="primary">
            Generate Report
          </Button>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={report?.totalStudents || 0}
          icon="👥"
        />
        <StatCard
          title="Tests Taken"
          value={report?.totalTests || 0}
          icon="📝"
        />
        <StatCard
          title="Avg Score"
          value={report?.avgScore ? `${report.avgScore.toFixed(1)}%` : 'N/A'}
          icon="📊"
        />
        <StatCard
          title="Pass Rate"
          value={report?.passRate ? `${report.passRate.toFixed(1)}%` : 'N/A'}
          icon="✅"
        />
      </div>

      {/* Performance Breakdown */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Breakdown</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Excellent (80%+)</span>
              <span className="font-semibold text-green-600">{report?.excellent || 0} students</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full"
                style={{ width: `${((report?.excellent || 0) / (report?.totalStudents || 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Good (60-80%)</span>
              <span className="font-semibold text-blue-600">{report?.good || 0} students</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full"
                style={{ width: `${((report?.good || 0) / (report?.totalStudents || 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Average (40-60%)</span>
              <span className="font-semibold text-yellow-600">{report?.average || 0} students</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-yellow-500 h-3 rounded-full"
                style={{ width: `${((report?.average || 0) / (report?.totalStudents || 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Below Average (&lt;40%)</span>
              <span className="font-semibold text-red-600">{report?.belowAverage || 0} students</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-red-500 h-3 rounded-full"
                style={{ width: `${((report?.belowAverage || 0) / (report?.totalStudents || 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Test-wise Performance */}
      {report?.testStats && report.testStats.length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test-wise Performance</h2>
          <div className="space-y-3">
            {report.testStats.map((test, idx) => (
              <div key={idx} className="flex justify-between items-center py-3 border-b last:border-b-0">
                <div>
                  <div className="font-medium text-gray-900">{test.testName}</div>
                  <div className="text-sm text-gray-500">{test.attempts} attempts</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{test.avgScore.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">Average Score</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

