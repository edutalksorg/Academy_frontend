import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../api/axiosClient';

export default function TestList() {
  const [tests, setTests] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/tests', { params: { q, status: 'published' } });
      const d = res.data.data;
      if (d && d.rows) {
        setTests(d.rows);
      } else {
        setTests(d || []);
      }
    } catch (err) {
      console.error('Failed to load tests:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Available Tests</h1>
        <p className="text-gray-600 mt-1">Browse and take tests to improve your skills</p>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tests by title..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button onClick={load} variant="primary">
          Search
        </Button>
      </div>

      {/* Tests Grid */}
      {loading ? (
        <LoadingSpinner size="lg" className="py-12" />
      ) : tests.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 text-lg">No tests available at the moment</p>
            <p className="text-gray-400 text-sm mt-2">Check back later for new tests</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tests.map((test) => {
            const now = new Date();
            const start = test.startTime ? new Date(test.startTime) : null;
            const end = test.endTime ? new Date(test.endTime) : null;

            let status = 'active';
            let statusText = 'Active';
            let statusColor = 'bg-green-100 text-green-800';

            if (start && now < start) {
              status = 'upcoming';
              statusText = `Starts: ${start.toLocaleString()}`;
              statusColor = 'bg-yellow-100 text-yellow-800';
            } else if (end && now > end) {
              status = 'ended';
              statusText = 'Ended';
              statusColor = 'bg-red-100 text-red-800';
            } else if (end) {
              statusText = `Ends: ${end.toLocaleString()}`;
            }

            return (
              <Card key={test.id} hover className="flex flex-col">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{test.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                      {statusText}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{test.description || 'No description provided'}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <span>📋</span>
                      <span>{test.Questions?.length || 0} questions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>⏱️</span>
                      <span>{test.timeLimit} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🎯</span>
                      <span>{test.totalMarks > 0 ? test.totalMarks : (test.Questions?.length || 0)} marks</span>
                    </div>
                  </div>
                </div>
                {status === 'active' ? (
                  <Link to={`/student/tests/${test.id}`} className="w-full">
                    <Button variant="primary" fullWidth>
                      Start Test
                    </Button>
                  </Link>
                ) : (
                  <Button variant="secondary" fullWidth disabled>
                    {status === 'upcoming' ? 'Not Started Yet' : 'Test Ended'}
                  </Button>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}

