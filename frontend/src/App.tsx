import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { useAuth } from "./contexts/AuthContext";
import { Agenda } from "./pages/Agenda";
import { AuthPage } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { PatientDetails } from "./pages/PatientDetails";
import { Patients } from "./pages/Patients";
import { Report } from "./pages/Report";

function PrivateRoutes() {
  const { token } = useAuth();
  return token ? <Layout /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/cadastro" element={<AuthPage register />} />
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

