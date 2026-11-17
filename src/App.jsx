import { Navigate, Route, Routes } from "react-router-dom";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<AdminLogin />} />

      {/* Protected Admin routes */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin/employees" element={<AdminDashboard />} />

        <Route
          path="/dashboard"
          element={<Navigate to="/admin/employees" replace />}
        />
      </Route>

      {/* Temporary destination while we implement password change */}
      <Route
        path="/change-password"
        element={
          <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
            <p className="text-[#64748B]">
              Password change page is being configured.
            </p>
          </div>
        }
      />

      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
            <p className="text-[#64748B]">
              You are not authorised to access this page.
            </p>
          </div>
        }
      />

      {/* Default route */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
