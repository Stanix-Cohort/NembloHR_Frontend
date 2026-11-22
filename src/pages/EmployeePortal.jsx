import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Construction, LoaderCircle, LogOut } from "lucide-react";
import { useAuth } from "../context/auth-context";

function EmployeePortal() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName = user?.fullName || user?.username || "Employee";

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[520px] bg-white border border-[#E2E8F0] rounded-[14px] px-6 py-10 sm:px-12 sm:py-12 text-center shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="w-12 h-12 rounded-full bg-[#E2E8F0] flex items-center justify-center mx-auto text-[#1E3247]">
          <Construction className="w-6 h-6" strokeWidth={1.75} aria-hidden="true" />
        </div>

        <h1 className="mt-5 text-[24px] sm:text-[28px] font-bold tracking-[-0.02em] text-[#0F172A] leading-tight">
          Employee Portal Under Development
        </h1>

        <p className="mt-2.5 text-[14px] leading-[1.55] text-[#64748B] max-w-[380px] mx-auto">
          Welcome, <span className="font-medium text-[#0F172A]">{displayName}</span>.
          Your password is up to date, and the Employee Portal is currently
          being developed.
        </p>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="mt-7 h-[42px] px-5 rounded-[8px] bg-[#1E3247] hover:bg-[#162638] active:bg-[#101D2B] text-white text-[13px] font-medium inline-flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/40 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <LoaderCircle className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" strokeWidth={1.75} />
          )}
          <span>{isLoggingOut ? "Signing out..." : "Logout"}</span>
        </button>
      </div>
    </main>
  );
}

export default EmployeePortal;