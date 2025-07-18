import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ClientsPage from './pages/ClientsPage'
import AssociatesPage from './pages/AssociatesPage'
import AssociateLoansPage from './pages/AssociateLoansPage';
import ClientLoansPage from './pages/ClientLoansPage';
import RegisterPage from './pages/RegisterPage';
import UsersPage from './pages/UsersPage';
import UserDetailsPage from './pages/UserDetailsPage';
import UserLoansPage from './pages/UserLoansPage';
import PaymentsPage from './pages/PaymentsPage';
import LoanPaymentsPage from './pages/LoanPaymentsPage';
import PaymentDetailsPage from './pages/PaymentDetailsPage';
import LoanDetailsPage from './pages/LoanDetailsPage';
import LoansWithPaymentsPage from './pages/LoansWithPaymentsPage';
import LoansPage from './pages/LoansPage'; // Importar la nueva página
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import Navbar from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1, padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients"
              element={
                <ProtectedRoute>
                  <ClientsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients/:clientId/loans"
              element={
                <ProtectedRoute>
                  <ClientLoansPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/associates"
              element={
                <ProtectedRoute>
                  <AssociatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/associates/:associateId/loans"
              element={
                <ProtectedRoute>
                  <AssociateLoansPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:userId"
              element={
                <ProtectedRoute>
                  <UserDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:userId/loans"
              element={
                <ProtectedRoute>
                  <UserLoansPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <PaymentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loans/:loanId/payments"
              element={
                <ProtectedRoute>
                  <LoanPaymentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments/:paymentId"
              element={
                <ProtectedRoute>
                  <PaymentDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loans/:loanId"
              element={
                <ProtectedRoute>
                  <LoanDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loans_with_payments"
              element={
                <ProtectedRoute>
                  <LoansWithPaymentsPage />
                </ProtectedRoute>
              }
            />
            {/* Nueva ruta para la gestión de préstamos */}
            <Route
              path="/loans"
              element={
                <ProtectedRoute>
                  <LoansPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App
