import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { Doctors } from './pages/Doctors';
import { Departments } from './pages/Departments';
import { Appointments } from './pages/Appointments';
import { MedicalRecords } from './pages/MedicalRecords';
import { Laboratory } from './pages/Laboratory';
import { Pharmacy } from './pages/Pharmacy';
import { Billing } from './pages/Billing';
import { Admissions } from './pages/Admissions';
import { AuditLogs } from './pages/AuditLogs';
import { StaffManagement } from './pages/StaffManagement';
import { DoctorPortal } from './pages/DoctorPortal';
import { Employees } from './pages/Employees';
import { Reports } from './pages/Reports';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Root URL redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Authenticated Application Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/medical-records" element={<MedicalRecords />} />
            <Route path="/laboratory" element={<Laboratory />} />
            <Route path="/pharmacy" element={<Pharmacy />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/admissions" element={<Admissions />} />
            <Route path="/doctor-portal" element={<DoctorPortal />} />
            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;