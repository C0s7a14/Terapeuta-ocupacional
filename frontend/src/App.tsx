import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { useAuth } from "./contexts/AuthContext";
import { Agenda } from "./pages/Agenda";
import { AuthPage } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { PatientDetails } from "./pages/PatientDetails";
import { Patients } from "./pages/Patients";
import { Report } from "./pages/Report";
import { PortalLayout } from "./components/PortalLayout";
import { usePortalAuth } from "./contexts/PortalAuthContext";
import { PortalDashboard } from "./pages/portal/PortalDashboard";
import { PortalDiaryHistory } from "./pages/portal/PortalDiaryHistory";
import { PortalLogin } from "./pages/portal/PortalLogin";
import { PortalNewEntry } from "./pages/portal/PortalNewEntry";

function PrivateRoutes() {
  const { token } = useAuth();
  return token ? <Layout /> : <Navigate to="/login" replace />;
}

function PrivatePortalRoutes() {
  const { token } = usePortalAuth();
  return token ? <PortalLayout /> : <Navigate to="/portal/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/cadastro" element={<AuthPage register />} />
      <Route path="/portal/login" element={<PortalLogin />} />
      <Route element={<PrivatePortalRoutes />}>
        <Route path="/portal" element={<PortalDashboard />} />
        <Route path="/portal/novo-registro" element={<PortalNewEntry />} />
        <Route path="/portal/diario" element={<PortalDiaryHistory />} />
      </Route>
      <Route element={<PrivateRoutes />}>
        <Route index element={<Dashboard />} />
        <Route path="/pacientes" element={<Patients />} />
        <Route path="/pacientes/:id" element={<PatientDetails />} />
        <Route path="/pacientes/:id/relatorio" element={<Report />} />
        <Route path="/agenda" element={<Agenda />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
