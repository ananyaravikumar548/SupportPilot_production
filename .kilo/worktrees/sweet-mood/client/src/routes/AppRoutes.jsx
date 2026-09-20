import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Layouts
import CustomerLayout from '../layouts/CustomerLayout';
import AgentLayout from '../layouts/AgentLayout';
import AdminLayout from '../layouts/AdminLayout';

// Customer Pages
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import MyTickets from '../pages/customer/MyTickets';
import CreateTicket from '../pages/customer/CreateTicket';
import CustomerProfile from '../pages/customer/CustomerProfile';
import CustomerSettings from '../pages/customer/CustomerSettings';
import CustomerNotifications from '../pages/customer/CustomerNotifications';

// Agent Pages
import AgentDashboard from '../pages/agent/AgentDashboard';
import TicketQueue from '../pages/agent/TicketQueue';
import AgentKnowledge from '../pages/agent/AgentKnowledge';
import AgentReports from '../pages/agent/AgentReports';
import AgentSettings from '../pages/agent/AgentSettings';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageUsers from '../pages/admin/ManageUsers';
import ManageAgents from '../pages/admin/ManageAgents';
import Categories from '../pages/admin/Categories';
import AdminReports from '../pages/admin/AdminReports';
import AdminSettings from '../pages/admin/AdminSettings';
import AuditLogs from '../pages/admin/AuditLogs';
import AdminTickets from '../pages/admin/AdminTickets';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public / Auth Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Customer Routes */}
      <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
        <Route path="/customer" element={<CustomerLayout />}>
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="tickets" element={<MyTickets />} />
          <Route path="create-ticket" element={<CreateTicket />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route path="settings" element={<CustomerSettings />} />
          <Route path="notifications" element={<CustomerNotifications />} />
        </Route>
      </Route>

      {/* Agent Routes */}
      <Route element={<ProtectedRoute allowedRoles={['agent']} />}>
        <Route path="/agent" element={<AgentLayout />}>
          <Route path="dashboard" element={<AgentDashboard />} />
          <Route path="tickets" element={<TicketQueue />} />
          <Route path="knowledge" element={<AgentKnowledge />} />
          <Route path="reports" element={<AgentReports />} />
          <Route path="settings" element={<AgentSettings />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="agents" element={<ManageAgents />} />
          <Route path="categories" element={<Categories />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="audit-logs" element={<AuditLogs />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
