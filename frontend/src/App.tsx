import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
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
import { useAuth } from "./auth/AuthContext";

export default function App() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
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
    </Routes>
  );
}
