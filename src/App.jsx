import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import SuperadminDashboard from './pages/superadmin/Dashboard'
import PendingUsers from './pages/superadmin/PendingUsers'
import Colleges from './pages/superadmin/Colleges'
import GlobalReports from './pages/superadmin/GlobalReports'
import TpoActivity from './pages/superadmin/TpoActivity'
import InstructorInsights from './pages/superadmin/InstructorInsights'
import TpoDashboard from './pages/tpo/Dashboard'
import CollegeReport from './pages/tpo/CollegeReport'
import CollegeStudents from './pages/tpo/CollegeStudents'
import ManageStudents from './pages/tpo/ManageStudents'
import InstructorDashboard from './pages/instructor/Dashboard'
import InstructorTestList from './pages/instructor/TestList'
import TestBuilder from './pages/instructor/TestBuilder'
import TestPreview from './pages/TestPreview'
import StudentDashboard from './pages/student/Dashboard'
import TestList from './pages/student/TestList'
import TestRunner from './pages/student/TestRunner'
import AttemptHistory from './pages/student/AttemptHistory'

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
        <Route path="/superadmin/colleges" element={<DashboardLayout><ProtectedRoute role="superadmin"><Colleges /></ProtectedRoute></DashboardLayout>} />
        <Route path="/superadmin/reports" element={<DashboardLayout><ProtectedRoute role="superadmin"><GlobalReports /></ProtectedRoute></DashboardLayout>} />
        <Route path="/superadmin/tpo-activity" element={<DashboardLayout><ProtectedRoute role="superadmin"><TpoActivity /></ProtectedRoute></DashboardLayout>} />
        <Route path="/superadmin/instructor-insights" element={<DashboardLayout><ProtectedRoute role="superadmin"><InstructorInsights /></ProtectedRoute></DashboardLayout>} />
        <Route path="/tpo" element={<DashboardLayout><ProtectedRoute role="tpo"><TpoDashboard /></ProtectedRoute></DashboardLayout>} />
        <Route path="/tpo/students" element={<DashboardLayout><ProtectedRoute role="tpo"><CollegeStudents /></ProtectedRoute></DashboardLayout>} />
        <Route path="/tpo/manage-students" element={<DashboardLayout><ProtectedRoute role="tpo"><ManageStudents /></ProtectedRoute></DashboardLayout>} />
        <Route path="/tpo/report" element={<DashboardLayout><ProtectedRoute role="tpo"><CollegeReport /></ProtectedRoute></DashboardLayout>} />
        <Route path="/instructor" element={<DashboardLayout><ProtectedRoute role="instructor"><InstructorDashboard /></ProtectedRoute></DashboardLayout>} />
        <Route path="/instructor/tests" element={<DashboardLayout><ProtectedRoute role="instructor"><InstructorTestList /></ProtectedRoute></DashboardLayout>} />
        <Route path="/instructor/tests/new" element={<DashboardLayout><ProtectedRoute role="instructor"><TestBuilder /></ProtectedRoute></DashboardLayout>} />
        <Route path="/instructor/tests/:id/edit" element={<DashboardLayout><ProtectedRoute role="instructor"><TestBuilder /></ProtectedRoute></DashboardLayout>} />
        <Route path="/student" element={<DashboardLayout><ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute></DashboardLayout>} />
        <Route path="/student/tests" element={<DashboardLayout><ProtectedRoute role="student"><TestList /></ProtectedRoute></DashboardLayout>} />
        <Route path="/student/tests/:id" element={<DashboardLayout><ProtectedRoute role="student"><TestRunner /></ProtectedRoute></DashboardLayout>} />
        <Route path="/student/attempts" element={<DashboardLayout><ProtectedRoute role="student"><AttemptHistory /></ProtectedRoute></DashboardLayout>} />
        <Route path="/test/:id/preview" element={<DashboardLayout><ProtectedRoute><TestPreview /></ProtectedRoute></DashboardLayout>} />

      </Routes>
    </AuthProvider>
  )
}
