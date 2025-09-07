import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, useMemo } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardLayout from './pages/DashboardLayout'
import CustomersPage from './pages/CustomersPage'
import CustomerDetailPage from './pages/CustomerDetailPage'
import ReportingPage from './pages/ReportingPage'
import { useAuth } from './store/auth'
import React from 'react'

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  const fallback = useMemo(() => <div className="loading-container">Loading...</div>, [])
  return (
    <Suspense fallback={fallback}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<CustomersPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route path="reporting" element={<ReportingPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
