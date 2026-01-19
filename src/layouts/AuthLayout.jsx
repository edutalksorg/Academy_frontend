import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50 px-4">
      <div className="max-w-md w-full">
        <Link
          to="/"
          className="fixed top-6 left-6 inline-flex items-center text-sm font-medium text-emerald-800 hover:text-emerald-600 transition-colors group z-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-emerald-600 rounded-full mb-3">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Edutalks Assess
          </h1>
          <p className="text-gray-600 mt-2">Student Management & Testing Platform</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <Link
              to="/login"
              className={`flex-1 text-center pb-3 font-medium transition-colors ${isLogin
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Login
            </Link>
            <Link
              to="/register"
              className={`flex-1 text-center pb-3 font-medium transition-colors ${!isLogin
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Register
            </Link>
          </div>

          {/* Form Content */}
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          © 2025 Edutalks Assess. A product of Edutalks. All rights reserved.
        </p>
      </div>
    </div>
  );
}

