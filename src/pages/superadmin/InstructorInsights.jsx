import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosClient';

export default function InstructorInsights() {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get('/admin/instructor-data');
            if (response.data.success) {
                setInstructors(response.data.data);
            }
        } catch (err) {
            setError('Failed to fetch instructor data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewTest = (testId) => {
        navigate(`/test/${testId}/preview`);
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-600">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Instructor Insights</h1>
            </div>

            <div className="space-y-4">
                {instructors.map((instructor) => (
                    <div key={instructor.id} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">{instructor.name}</h2>
                                <p className="text-sm text-gray-500">{instructor.email}</p>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                {instructor.Tests?.length || 0} Tests
                            </span>
                        </div>

                        {instructor.Tests && instructor.Tests.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Test Title</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {instructor.Tests.map((test) => (
                                            <tr key={test.id}>
                                                <td className="px-4 py-2 text-sm text-gray-900">{test.title}</td>
                                                <td className="px-4 py-2 text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${test.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {test.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-500">
                                                    {new Date(test.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-2 text-sm">
                                                    <button
                                                        onClick={() => handleViewTest(test.id)}
                                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        View Test
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">No tests created yet.</p>
                        )}
                    </div>
                ))}

                {instructors.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <p className="text-gray-500">No instructors found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
