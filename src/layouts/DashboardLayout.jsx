import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getNavigationLinks = () => {
    switch (user?.role) {
      case 'superadmin':
        return [
          { to: '/superadmin', label: 'Dashboard', icon: '📊' },
          { to: '/superadmin/pending', label: 'Pending Users', icon: '⏳' },
          { to: '/superadmin/colleges', label: 'Colleges', icon: '🏫' },
          { to: '/superadmin/reports', label: 'Global Reports', icon: '📈' },
          { to: '/superadmin/tpo-activity', label: 'TPO Activity', icon: '🕒' },
          { to: '/superadmin/instructor-insights', label: 'Instructor Insights', icon: '👨‍🏫' },
        ];
      case 'tpo':
        return [
          { to: '/tpo', label: 'Dashboard', icon: '📊' },
          { to: '/tpo/students', label: 'Students', icon: '👥' },
          { to: '/tpo/report', label: 'College Report', icon: '📈' },
        ];
      case 'instructor':
        return [
          { to: '/instructor', label: 'Dashboard', icon: '📊' },
          { to: '/instructor/tests/new', label: 'Create Test', icon: '➕' },
          { to: '/instructor/tests', label: 'My Tests', icon: '📝' },
        ];
      case 'student':
        return [
          { to: '/student', label: 'Dashboard', icon: '📊' },
          { to: '/student/tests', label: 'Available Tests', icon: '📝' },
          { to: '/student/attempts', label: 'My Results', icon: '📈' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavigationLinks();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-4 text-gray-600 hover:text-gray-900 lg:hidden"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-blue-600">College Placement</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-sm text-gray-700">
                <span className="font-medium">{user?.name}</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {user?.role?.toUpperCase()}
                </span>
              </div>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } fixed lg:static lg:translate-x-0 z-20 w-64 bg-white h-[calc(100vh-4rem)] border-r border-gray-200 transition-transform duration-300 ease-in-out`}
        >
          <nav className="p-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(link.to)
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

