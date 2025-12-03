import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import SuperadminDashboard from './pages/superadmin/Dashboard'
import PendingUsers from './pages/superadmin/PendingUsers'
import TpoDashboard from './pages/tpo/Dashboard'
import CollegeReport from './pages/tpo/CollegeReport'
import CollegeStudents from './pages/tpo/CollegeStudents'
import InstructorDashboard from './pages/instructor/Dashboard'
import TestBuilder from './pages/instructor/TestBuilder'
import InstructorTestList from './pages/instructor/TestList'
import StudentDashboard from './pages/student/Dashboard'
import TestList from './pages/student/TestList'
import TestRunner from './pages/student/TestRunner'
import AttemptHistory from './pages/student/AttemptHistory'

function Protected({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/forbidden" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route path="/" element={<DashboardLayout>
          <ProtectedRoute>
            <div className="p-2">Select a dashboard from the menu</div>
          </ProtectedRoute>
        </DashboardLayout>} />

        <Route path="/superadmin" element={<DashboardLayout><ProtectedRoute role="superadmin"><SuperadminDashboard /></ProtectedRoute></DashboardLayout>} />
        <Route path="/superadmin/pending" element={<DashboardLayout><ProtectedRoute role="superadmin"><PendingUsers /></ProtectedRoute></DashboardLayout>} />
        <Route path="/tpo" element={<DashboardLayout><ProtectedRoute role="tpo"><TpoDashboard /></ProtectedRoute></DashboardLayout>} />
        <Route path="/tpo/students" element={<DashboardLayout><ProtectedRoute role="tpo"><CollegeStudents /></ProtectedRoute></DashboardLayout>} />
        <Route path="/tpo/report" element={<DashboardLayout><ProtectedRoute role="tpo"><CollegeReport /></ProtectedRoute></DashboardLayout>} />
        <Route path="/instructor" element={<DashboardLayout><ProtectedRoute role="instructor"><InstructorDashboard /></ProtectedRoute></DashboardLayout>} />
        <Route path="/instructor/tests" element={<DashboardLayout><ProtectedRoute role="instructor"><InstructorTestList /></ProtectedRoute></DashboardLayout>} />
        <Route path="/instructor/tests/new" element={<DashboardLayout><ProtectedRoute role="instructor"><TestBuilder /></ProtectedRoute></DashboardLayout>} />
        <Route path="/instructor/tests/:id/edit" element={<DashboardLayout><ProtectedRoute role="instructor"><TestBuilder /></ProtectedRoute></DashboardLayout>} />
        <Route path="/student" element={<DashboardLayout><ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute></DashboardLayout>} />
        <Route path="/student/tests" element={<DashboardLayout><ProtectedRoute role="student"><TestList /></ProtectedRoute></DashboardLayout>} />
        <Route path="/student/tests/:id" element={<DashboardLayout><ProtectedRoute role="student"><TestRunner /></ProtectedRoute></DashboardLayout>} />
        <Route path="/student/attempts" element={<DashboardLayout><ProtectedRoute role="student"><AttemptHistory /></ProtectedRoute></DashboardLayout>} />

      </Routes>
    </AuthProvider>
  )
}
