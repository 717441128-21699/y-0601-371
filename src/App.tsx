import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Scheduling from "@/pages/Scheduling";
import Devices from "@/pages/Devices";
import WorkOrders from "@/pages/WorkOrders";
import Inventory from "@/pages/Inventory";
import Statistics from "@/pages/Statistics";
import PlantLayout from "@/pages/Layout";
import AppLayout from "@/components/layout/Layout";
import { useAppStore } from "@/store";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAppStore((state) => state.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/scheduling"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Scheduling />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/devices"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Devices />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workorders"
        element={
          <ProtectedRoute>
            <AppLayout>
              <WorkOrders />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Inventory />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/statistics"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Statistics />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/layout"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PlantLayout />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
