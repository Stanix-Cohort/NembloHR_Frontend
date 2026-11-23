import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronRight, LogOut, Menu, Pencil } from "lucide-react";
import { useAuth } from "../context/auth-context";

function HeaderAvatar() {
  return (
    <div
      className="w-8 h-8 rounded-full bg-[#E5D3C0] flex items-center justify-center shrink-0 overflow-hidden"
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <rect width="32" height="32" fill="#E8D8C8" />
        <circle cx="16" cy="12" r="5.5" fill="#C98A63" />
        <path
          d="M10.5 11.2c0-3.3 2.4-5.7 5.5-5.7s5.5 2.4 5.5 5.7c-.6-1.4-2.1-2.2-5.5-2.2s-4.9.8-5.5 2.2z"
          fill="#2B2118"
        />
        <path
          d="M6 31c1-5.8 5-8.5 10-8.5s9 2.7 10 8.5H6z"
          fill="#2B3D52"
        />
      </svg>
    </div>
  );
}

function DashboardHeader({
  sectionLabel = "Employees",
  breadcrumbs,
  user,
  onOpenMobileNav,
  onEditProfile,
  onLogout,
}) {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (!isProfileOpen) return;

    const handleOutsideClick = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileOpen]);

  const activeUser = user ?? authUser;
  const items = breadcrumbs ?? [
    { label: "Admin" },
    { label: sectionLabel },
  ];

  const defaultName =
    activeUser?.role === "EMPLOYEE" ? "User" : "Admin User";
  const displayName =
    activeUser?.fullName || activeUser?.username || defaultName;
  const displayRole =
    activeUser?.role === "ADMIN"
      ? "Administrator"
      : activeUser?.role === "EMPLOYEE"
        ? "Employee"
        : activeUser?.role || "Administrator";

  const handleEditProfile = () => {
    setIsProfileOpen(false);
    if (onEditProfile) {
      onEditProfile();
    }
  };

  const handleLogoutClick = async () => {
    setIsProfileOpen(false);
    if (onLogout) {
      await onLogout();
      return;
    }

    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-[64px] bg-white border-b border-[#E5E7EB] px-4 sm:px-6 lg:px-9 flex items-center justify-between gap-4 shrink-0">
      {/* Left: Mobile Menu Trigger + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
          className="lg:hidden p-1.5 rounded-[6px] text-[#1E293B] hover:bg-[#F1F5F9] cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav
          aria-label="Breadcrumb"
          className="flex items-center text-[14px] whitespace-nowrap overflow-x-auto"
        >
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <div key={item.label} className="flex items-center">
                {index > 0 && (
                  <ChevronRight
                    className="w-4 h-4 text-[#64748B] mx-2 shrink-0"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                )}

                {isLast ? (
                  <span className="text-[#0F172A] font-medium">
                    {item.label}
                  </span>
                ) : item.onClick ? (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="text-[#64748B] hover:text-[#0F172A] font-normal cursor-pointer focus:outline-none focus-visible:underline"
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className="text-[#64748B] font-normal">
                    {item.label}
                  </span>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Right: Notifications & Profile Menu */}
      <div className="flex items-center gap-4 sm:gap-5 shrink-0">
        <button
          type="button"
          aria-label="Notifications"
          className="p-1.5 rounded-[8px] text-[#1E293B] hover:bg-[#F1F5F9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30 cursor-pointer"
        >
          <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
        </button>

        <div ref={profileMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={isProfileOpen}
            className="flex items-center gap-2.5 text-left rounded-[8px] py-1 px-1.5 hover:bg-[#F8FAFC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30 cursor-pointer"
          >
            <HeaderAvatar />
            <div className="hidden sm:block leading-tight">
              <p className="text-[13px] font-medium text-[#0F172A]">
                {displayName}
              </p>
              <p className="text-[10px] text-[#64748B] mt-0.5">{displayRole}</p>
            </div>
            <ChevronRight
              className="w-4 h-4 text-[#1E293B] ml-1"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </button>

          {isProfileOpen && (
            <div
              role="menu"
              aria-label="Profile options"
              className="absolute right-0 sm:right-auto sm:left-[22px] sm:-translate-x-[72%] mt-2 w-[172px] bg-white border border-[#94A3B8] rounded-[10px] shadow-[0_6px_20px_rgba(15,23,42,0.08)] z-40"
            >
              {/* Top Pointer Arrow */}
              <span
                aria-hidden="true"
                className="absolute -top-[6px] right-[38px] sm:right-auto sm:left-[72%] sm:-translate-x-1/2 w-[11px] h-[11px] bg-white border-l border-t border-[#94A3B8] rotate-45"
              />

              <div className="relative bg-white rounded-[10px] overflow-hidden">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleEditProfile}
                  className="w-full px-3.5 py-2.5 text-[13px] font-medium text-[#1E293B] hover:bg-[#F8FAFC] flex items-center gap-2.5 cursor-pointer"
                >
                  <Pencil
                    className="w-4 h-4 text-[#1E3247]"
                    strokeWidth={1.75}
                  />
                  <span>Edit Profile</span>
                </button>

                <div className="border-t border-[#E2E8F0]" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogoutClick}
                  className="w-full px-3.5 py-2.5 text-[13px] font-medium text-[#B91C1C] hover:bg-[#FEF2F2] flex items-center gap-2.5 cursor-pointer"
                >
                  <LogOut
                    className="w-4 h-4 text-[#B91C1C]"
                    strokeWidth={1.75}
                  />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;