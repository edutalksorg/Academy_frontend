import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileBarChart,
  Clock,
  GraduationCap,
  Menu,
  X,
  LogOut,
  ChevronRight,
  FileText,
  Shield,
  PieChart
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getNavigationLinks = () => {
    switch (user?.role) {
      case 'superadmin':
        return [
          { to: '/superadmin', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/superadmin/pending', label: 'Pending Users', icon: Clock },
          { to: '/superadmin/colleges', label: 'Colleges', icon: Building2 },
          { to: '/superadmin/reports', label: 'Global Reports', icon: FileBarChart },
          { to: '/superadmin/tpo-activity', label: 'TPO Activity', icon: Shield },
          { to: '/superadmin/instructor-insights', label: 'Instructor Insights', icon: GraduationCap },
        ];
      case 'tpo':
        return [
          { to: '/tpo', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/tpo/students', label: 'Students', icon: Users },
          { to: '/tpo/manage-students', label: 'Manage Access', icon: Shield },
          { to: '/tpo/report', label: 'College Report', icon: FileBarChart },
        ];
      case 'instructor':
        return [
          { to: '/instructor', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/instructor/tests/new', label: 'Create Test', icon: FileText },
          { to: '/instructor/tests', label: 'My Tests', icon: PieChart },
        ];
      case 'student':
        return [
          { to: '/student', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/student/tests', label: 'Available Tests', icon: FileText },
          { to: '/student/attempts', label: 'My Results', icon: FileBarChart },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavigationLinks();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed lg:relative lg:translate-x-0 z-30 w-72 bg-gradient-to-b from-white to-red-50 h-full transition-transform duration-300 ease-in-out flex flex-col shadow-xl border-r border-gray-200`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 bg-transparent border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Edutalks Assess</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto text-slate-500 hover:text-slate-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="mb-6 px-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu</p>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`group flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 mb-1 ${active
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                    : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-500 group-hover:text-emerald-600'}`} />
                    <span className="font-medium">{link.label}</span>
                  </div>
                  {active && <ChevronRight className="w-4 h-4 text-emerald-100" />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 bg-transparent border-t border-gray-200">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-white/50 border border-gray-200">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white h-16 border-b border-gray-200 flex items-center px-4 justify-between z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-gray-900">Edutalks Assess</span>
          <div className="w-6"></div> {/* Spacer for alignment */}
        </header>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

