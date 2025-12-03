import React, { useState, useEffect } from 'react';
import api from '../../api/axiosClient';

export default function TpoActivity() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await api.get('/admin/tpo-activity');
            if (response.data.success) {
                const logs = response.data.data;
                const groupedSessions = processLogs(logs);
                setSessions(groupedSessions);
            }
        } catch (err) {
            setError('Failed to fetch activity logs');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const processLogs = (logs) => {
        // Sort logs by time ascending to process them in order
        const sortedLogs = [...logs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const sessions = [];
        const userSessions = {}; // Map userId -> current open session

        sortedLogs.forEach(log => {
            const userId = log.userId;

            if (log.action === 'LOGIN') {
                // If there's already an open session for this user, it means they logged in again without logging out.
                // We push the previous session as "incomplete" (Active/Unknown) or we could ignore the new login if it's very close.
                // For now, let's close the previous one as incomplete.
                if (userSessions[userId]) {
                    sessions.push(userSessions[userId]);
                }
                // Start new session
                userSessions[userId] = {
                    id: log.id,
                    user: log.User,
                    loginTime: log.createdAt,
                    logoutTime: null
                };
            } else if (log.action === 'LOGOUT') {
                if (userSessions[userId]) {
                    // Close current session
                    userSessions[userId].logoutTime = log.createdAt;
                    sessions.push(userSessions[userId]);
                    delete userSessions[userId];
                } else {
                    // Orphaned logout (login missing or from before tracking started)
                    // We ignore these to keep the table clean
                }
            }
        });

        // Push any remaining open sessions (users currently logged in)
        Object.values(userSessions).forEach(session => {
            sessions.push(session);
        });

        // Sort sessions by login time descending for display (newest first)
        return sessions.sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime));
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-600">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">TPO Activity Logs</h1>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TPO Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logout Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sessions.map((session, index) => (
                                <tr key={session.id || index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{session.user?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.user?.College?.name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(session.loginTime).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {session.logoutTime ? new Date(session.logoutTime).toLocaleString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${session.logoutTime ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {session.logoutTime ? 'Completed' : 'Active'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {sessions.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No activity found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
