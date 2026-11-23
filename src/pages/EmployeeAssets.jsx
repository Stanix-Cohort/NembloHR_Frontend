import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../layouts/Sidebar";
import DashboardHeader from "../layouts/DashboardHeader";
import AssetsEmptyState from "../components/employee/AssetsEmptyState";
import { EMPLOYEE_NAV_ITEMS } from "../constants/employeeNav";
import { useAuth } from "../context/auth-context";

function EmployeeAssets() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] overflow-x-hidden">
      <Sidebar
        portalLabel="Employee Portal"
        navItems={EMPLOYEE_NAV_ITEMS}
        activeRoute="assets"
        onNavigate={(item) => navigate(item.path)}
        onLogout={handleLogout}
        user={user}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardHeader
          breadcrumbs={[{ label: "Employee" }, { label: "Assets" }]}
          user={user}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-9 lg:py-7">
          <div className="w-full">
            <div>
              <h1 className="text-[28px] sm:text-[32px] font-bold tracking-[-0.02em] text-[#0F172A] leading-tight">
                My Assets
              </h1>
              <p className="mt-1 text-[13px] font-normal text-[#64748B]">
                View and manage the assets assigned to you.
              </p>
            </div>

            <div className="mt-6">
              <AssetsEmptyState />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default EmployeeAssets;