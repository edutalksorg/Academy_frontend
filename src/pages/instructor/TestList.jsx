import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../api/axiosClient';

export default function InstructorTestList() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTests();
    }, []);

    async function loadTests() {
        try {
            const res = await api.get('/tests/my-tests');
            if (res.data.success) {
                setTests(res.data.data);
            }
        } catch (err) {
            console.error('Failed to load tests', err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <LoadingSpinner size="lg" className="py-12" />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Tests</h1>
                    <p className="text-gray-600 mt-1">Manage your created tests</p>
                </div>
                <Link to="/instructor/tests/new">
                    <Button variant="primary">➕ Create New Test</Button>
                </Link>
            </div>

            {tests.length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg mb-4">You haven't created any tests yet.</p>
                        <Link to="/instructor/tests/new">
                            <Button variant="primary">Create Your First Test</Button>
                        </Link>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {tests.map(test => (
                        <Card key={test.id} className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{test.title}</h3>
                                <div className="text-sm text-gray-500 mt-1">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium mr-2 ${test.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {test.status.toUpperCase()}
                                    </span>
                                    <span>{test.Questions?.length || 0} questions</span>
                                    <span className="mx-2">•</span>
                                    <span>{test.timeLimit} mins</span>
                                    {test.startTime && (
                                        <>
                                            <span className="mx-2">•</span>
                                            <span>Starts: {new Date(test.startTime).toLocaleString()}</span>
                                            <span className="mx-2">•</span>
                                            <span>Ends: {new Date(new Date(test.startTime).getTime() + test.timeLimit * 60000).toLocaleString()}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link to={`/instructor/tests/${test.id}/edit`}>
                                    <Button variant="outline" size="sm">Edit</Button>
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
