import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Landing from '../pages/public/Landing';

// Layouts
import CustomerLayout from '../layouts/CustomerLayout';
import AgentLayout from '../layouts/AgentLayout';
import AdminLayout from '../layouts/AdminLayout';
import ManagerLayout from '../layouts/ManagerLayout';

// Customer Pages
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import MyTickets from '../pages/customer/MyTickets';
import CreateTicket from '../pages/customer/CreateTicket';
import CustomerProfile from '../pages/customer/CustomerProfile';
import CustomerSettings from '../pages/customer/CustomerSettings';
import CustomerNotifications from '../pages/customer/CustomerNotifications';
import CustomerEmailLogs from '../pages/customer/CustomerEmailLogs';

// Agent Pages
import AgentDashboard from '../pages/agent/AgentDashboard';
import TicketQueue from '../pages/agent/TicketQueue';
import AgentKnowledge from '../pages/agent/AgentKnowledge';
import AgentReports from '../pages/agent/AgentReports';
import AgentSettings from '../pages/agent/AgentSettings';
import TicketDetail from '../pages/agent/TicketDetail';

// Knowledge Base Pages
import ArticleEditor from '../pages/knowledge/ArticleEditor';
import IngestionStatus from '../pages/knowledge/IngestionStatus';
import KBGaps from '../pages/knowledge/KBGaps';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageUsers from '../pages/admin/ManageUsers';
import Categories from '../pages/admin/Categories';
import AdminReports from '../pages/admin/AdminReports';
import AdminSettings from '../pages/admin/AdminSettings';
import AuditLogs from '../pages/admin/AuditLogs';
import AdminTickets from '../pages/admin/AdminTickets';
import MasterData from '../pages/admin/MasterData';

// Manager Pages
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import JiraTicketLogs from '../pages/manager/JiraTicketLogs';
import ManagerAgents from '../pages/manager/ManagerAgents';
import ManagerReports from '../pages/manager/ManagerReports';
import ManagerSettings from '../pages/manager/ManagerSettings';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public / Auth Routes */}
      <Route path="/" element={<Landing />} />
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
          <Route path="email-logs" element={<CustomerEmailLogs />} />
        </Route>
      </Route>

      {/* Agent Routes */}
      <Route element={<ProtectedRoute allowedRoles={['agent', 'admin']} />}>
        <Route path="/agent" element={<AgentLayout />}>
          <Route path="dashboard" element={<AgentDashboard />} />
          <Route path="tickets" element={<TicketQueue />} />
          <Route path="tickets/:id" element={<TicketDetail />} />
          <Route path="knowledge" element={<AgentKnowledge />} />
          <Route path="knowledge/new" element={<ArticleEditor />} />
          <Route path="knowledge/:id/edit" element={<ArticleEditor />} />
          <Route path="knowledge/ingestion" element={<IngestionStatus />} />
          <Route path="knowledge/gaps" element={<KBGaps />} />
          <Route path="reports" element={<AgentReports />} />
          <Route path="settings" element={<AgentSettings />} />
        </Route>
      </Route>

      {/* Manager Routes */}
      <Route element={<ProtectedRoute allowedRoles={['agent_manager', 'admin']} />}>
        <Route path="/manager" element={<ManagerLayout />}>
          <Route index element={<Navigate to="/manager/dashboard" replace />} />
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="unassigned-queue" element={<ManagerDashboard />} />
          <Route path="jira-logs" element={<JiraTicketLogs />} />
          <Route path="agents" element={<ManagerAgents />} />
          <Route path="reports" element={<ManagerReports />} />
          <Route path="settings" element={<ManagerSettings />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="agents" element={<Navigate to="/admin/users" replace />} />
          <Route path="categories" element={<Categories />} />
          <Route path="master-data" element={<MasterData />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="audit-logs" element={<AuditLogs />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
