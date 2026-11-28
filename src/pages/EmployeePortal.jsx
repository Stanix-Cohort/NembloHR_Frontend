import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Construction } from "lucide-react";
import Sidebar from "../layouts/Sidebar";
import DashboardHeader from "../layouts/DashboardHeader";
import { EMPLOYEE_NAV_ITEMS } from "../constants/employeeNav";
import { useAuth } from "../context/auth-context";

function EmployeePortal({
  activeRoute = "dashboard",
  sectionLabel = "Dashboard",
  pageTitle = "Dashboard",
}) {
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
        activeRoute={activeRoute}
        onNavigate={(item) => navigate(item.path)}
        onLogout={handleLogout}
        user={user}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardHeader
          breadcrumbs={[{ label: "Employee" }, { label: sectionLabel }]}
          user={user}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-9 lg:py-7">
          <div className="w-full">
            <div>
              <h1 className="text-[28px] sm:text-[32px] font-bold tracking-[-0.02em] text-[#0F172A] leading-tight">
                {pageTitle}
              </h1>
              <p className="mt-1 text-[13px] font-normal text-[#64748B]">
                This section of the Employee Portal is currently under
                development.
              </p>
            </div>

            <div className="mt-6 bg-white border border-[#E2E8F0] rounded-[12px] px-6 py-20 sm:py-28 flex flex-col items-center justify-center text-center min-h-[480px] sm:min-h-[520px]">
              <div className="w-16 h-16 rounded-full bg-[#DCE1E7] flex items-center justify-center text-[#1E3247]">
                <Construction
                  className="w-7 h-7"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </div>

              <h2 className="mt-5 text-[20px] font-bold text-[#0F172A] leading-snug">
                {pageTitle} Coming Soon
              </h2>

              <p className="mt-2 text-[14px] leading-[1.55] text-[#64748B] max-w-[380px]">
                This module is still being developed. You can check your assigned
                company items in the My Assets tab.
              </p>

              <button
                type="button"
                onClick={() => navigate("/employee/assets")}
                className="mt-6 h-[42px] px-5 rounded-[8px] bg-[#1E3247] hover:bg-[#162638] active:bg-[#101D2B] text-white text-[13px] font-medium cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/40"
              >
                Go to My Assets
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default EmployeePortal;