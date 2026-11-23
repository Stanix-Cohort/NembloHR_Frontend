import { Navigate, Route, Routes } from "react-router-dom";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import CreateEmployee from "./pages/CreateEmployee";
import EditEmployee from "./pages/EditEmployee";
import ChangePassword from "./pages/ChangePassword";
import EmployeeAssets from "./pages/EmployeeAssets";
import EmployeePortal from "./pages/EmployeePortal";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<AdminLogin />} />

      {/* Protected Admin routes */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin/employees" element={<AdminDashboard />} />
        <Route path="/admin/employees/new" element={<CreateEmployee />} />
        <Route path="/admin/employees/:id/edit" element={<EditEmployee />} />

        <Route
          path="/dashboard"
          element={<Navigate to="/admin/employees" replace />}
        />
      </Route>

      {/* Protected Employee routes */}
      <Route element={<ProtectedRoute allowedRoles={["EMPLOYEE"]} />}>
        <Route path="/employee/assets" element={<EmployeeAssets />} />
        <Route
          path="/employee/dashboard"
          element={
            <EmployeePortal
              activeRoute="home"
              sectionLabel="Home"
              pageTitle="Home"
            />
          }
        />
        <Route
          path="/employee/attendance"
          element={
            <EmployeePortal
              activeRoute="attendance"
              sectionLabel="Attendance"
              pageTitle="Attendance"
            />
          }
        />
        <Route
          path="/employee/leave-management"
          element={
            <EmployeePortal
              activeRoute="leave-management"
              sectionLabel="Leave Management"
              pageTitle="Leave Management"
            />
          }
        />
      </Route>

      {/* First-login password change */}
      <Route path="/change-password" element={<ChangePassword />} />

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

      {/* Default routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;