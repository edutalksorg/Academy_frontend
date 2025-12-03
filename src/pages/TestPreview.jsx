import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';

export default function TestPreview() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTest();
    }, [id]);

    const fetchTest = async () => {
        try {
            const response = await api.get(`/tests/${id}`);
            if (response.data.success) {
                setTest(response.data.data);
            }
        } catch (err) {
            setError('Failed to fetch test details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-600">{error}</div>;
    if (!test) return <div className="p-4">Test not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-blue-600 hover:text-blue-800 mb-2"
                    >
                        ← Back
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
                    <p className="text-sm text-gray-500 mt-1">{test.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${test.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {test.status}
                </span>
            </div>

            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="text-lg font-semibold">{test.timeLimit} minutes</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Questions</p>
                        <p className="text-lg font-semibold">{test.Questions?.length || 0}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Start Time</p>
                        <p className="text-lg font-semibold">
                            {test.startTime ? new Date(test.startTime).toLocaleString() : 'Not set'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">End Time</p>
                        <p className="text-lg font-semibold">
                            {test.endTime ? new Date(test.endTime).toLocaleString() : 'Not set'}
                        </p>
                    </div>
                </div>

                <h2 className="text-lg font-semibold mb-4">Questions</h2>
                <div className="space-y-4">
                    {test.Questions && test.Questions.length > 0 ? (
                        test.Questions.map((question, index) => (
                            <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-medium mb-2">
                                    {index + 1}. {question.text}
                                </h3>
                                <div className="space-y-2 ml-4">
                                    {question.Options && question.Options.map((option) => (
                                        <div
                                            key={option.id}
                                            className={`p-2 rounded ${option.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                                                }`}
                                        >
                                            {option.text}
                                            {option.isCorrect && (
                                                <span className="ml-2 text-green-600 text-xs font-medium">✓ Correct</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 italic">No questions added yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}
