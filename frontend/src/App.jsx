import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AssociatesPage from './pages/AssociatesPage';
import CreateAssociatePage from './pages/CreateAssociatePage';
import AssociateLoansPage from './pages/AssociateLoansPage';
import UsersPage from './pages/UsersPage';
import CreateUserPage from './pages/CreateUserPage';
import ClientsViewPage from './pages/ClientsViewPage';
import UserLoansPage from './pages/UserLoansPage';
import LoanDetailsPage from './pages/LoanDetailsPage';
import LoansPage from './pages/LoansPage';
import CreateLoanPage from './pages/CreateLoanPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1, padding: '20px' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/associates" element={<ProtectedRoute><AssociatesPage /></ProtectedRoute>} />
              <Route path="/associates/new" element={<ProtectedRoute><CreateAssociatePage /></ProtectedRoute>} />
              <Route path="/associates/:associateId/loans" element={<ProtectedRoute><AssociateLoansPage /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
              <Route path="/users/new" element={<ProtectedRoute><CreateUserPage /></ProtectedRoute>} />
              <Route path="/clients" element={<ProtectedRoute><ClientsViewPage /></ProtectedRoute>} />
              <Route path="/users/:userId/loans" element={<ProtectedRoute><UserLoansPage /></ProtectedRoute>} />
              <Route path="/loans" element={<ProtectedRoute><LoansPage /></ProtectedRoute>} />
              <Route path="/loans/new" element={<ProtectedRoute><CreateLoanPage /></ProtectedRoute>} />
              <Route path="/loans/:loanId" element={<ProtectedRoute><LoanDetailsPage /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
