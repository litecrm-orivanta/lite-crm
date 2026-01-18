import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Dashboard from "./pages/Dashboard";
import LeadDetail from "./pages/LeadDetail";
import GoogleCallback from "./pages/GoogleCallback";
import Upgrade from "./pages/Upgrade";
import AcceptInvite from "./pages/AcceptInvite";
import Team from "./pages/Team";
import Workflows from "./pages/Workflows";
import WorkflowEditor from "./pages/WorkflowEditor";
import WorkflowSetupGuide from "./pages/WorkflowSetupGuide";
import WorkflowConfiguration from "./pages/WorkflowConfiguration";
import DocsPage from "./pages/DocsPage";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/AdminDashboard";
import WorkspaceAdminDashboard from "./pages/WorkspaceAdminDashboard";
import BillingPage from "./pages/BillingPage";
import Reports from "./pages/Reports";
import Calendar from "./pages/Calendar";
import Kanban from "./pages/Kanban";
import SuspensionModal from "./components/SuspensionModal";
import { useAuth } from "./auth/AuthContext";

export default function App() {
  const { token } = useAuth();
  const [isSuspended, setIsSuspended] = useState(false);
  const [suspensionMessage, setSuspensionMessage] = useState<string>();

  useEffect(() => {
    const handleSuspension = (event: CustomEvent) => {
      setIsSuspended(true);
      setSuspensionMessage(event.detail?.message);
    };

    window.addEventListener('workspace-suspended', handleSuspension as EventListener);

    return () => {
      window.removeEventListener('workspace-suspended', handleSuspension as EventListener);
    };
  }, []);

  return (
    <>
      <SuspensionModal isOpen={isSuspended} message={suspensionMessage} />
      <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />

      {/* Invite acceptance (no auth required) */}
      <Route path="/accept-invite/:inviteId" element={<AcceptInvite />} />

      <Route
        path="/"
        element={token ? <Dashboard /> : <Navigate to="/login" />}
      />

      <Route
        path="/team"
        element={token ? <Team /> : <Navigate to="/login" />}
      />

      <Route
        path="/leads/:id"
        element={token ? <LeadDetail /> : <Navigate to="/login" />}
      />

      <Route
        path="/upgrade"
        element={token ? <Upgrade /> : <Navigate to="/login" />}
      />

      <Route
        path="/workflows"
        element={token ? <Workflows /> : <Navigate to="/login" />}
      />

      <Route
        path="/workflows/editor"
        element={token ? <WorkflowEditor /> : <Navigate to="/login" />}
      />
      <Route
        path="/workflows/editor/:id"
        element={token ? <WorkflowEditor /> : <Navigate to="/login" />}
      />

      <Route
        path="/workflows/setup-guide"
        element={token ? <WorkflowSetupGuide /> : <Navigate to="/login" />}
      />

      <Route
        path="/workflows/configuration"
        element={token ? <WorkflowConfiguration /> : <Navigate to="/login" />}
      />

      <Route
        path="/docs"
        element={<DocsPage />}
      />

      <Route
        path="/settings"
        element={token ? <Settings /> : <Navigate to="/login" />}
      />

      <Route
        path="/notifications"
        element={token ? <Notifications /> : <Navigate to="/login" />}
      />

      <Route
        path="/admin"
        element={token ? <AdminDashboard /> : <Navigate to="/login" />}
      />

      <Route
        path="/workspace-admin"
        element={token ? <WorkspaceAdminDashboard /> : <Navigate to="/login" />}
      />

      <Route
        path="/billing"
        element={token ? <BillingPage /> : <Navigate to="/login" />}
      />

      <Route
        path="/reports"
        element={token ? <Reports /> : <Navigate to="/login" />}
      />

      <Route
        path="/calendar"
        element={token ? <Calendar /> : <Navigate to="/login" />}
      />

      <Route
        path="/kanban"
        element={token ? <Kanban /> : <Navigate to="/login" />}
      />
    </Routes>
    </>
  );
}
