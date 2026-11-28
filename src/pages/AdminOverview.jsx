import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, Plane } from "lucide-react";

import Sidebar from "../layouts/Sidebar";
import DashboardHeader from "../layouts/DashboardHeader";
import { useAuth } from "../context/auth-context";
import { getEmployees } from "../services/employeeService";
import { getAssets } from "../services/assetService";

import totalEmployeesIcon from "../assets/icon-total-employees.png";
import presentTodayIcon from "../assets/icon-present-today.png";
import pendingLeaveIcon from "../assets/icon-pending-leave.png";
import assignedAssetsIcon from "../assets/icon-dashboard-assigned-assets.png";

function formatHeaderDate(date = new Date()) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(date);
  const day = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
  }).format(date);
  const month = new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(date);
  const year = date.getFullYear();

  return `${weekday}, ${day} ${month} ${year}`;
}

function getFirstName(user) {
  const raw = user?.fullName || user?.username || "Admin";
  const first = raw.trim().split(/[\s@]+/)[0];
  if (!first) return "Admin";
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function AdminOverview() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [assignedAssets, setAssignedAssets] = useState(0);

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      getEmployees({ page: 1, limit: 100 }),
      getAssets(),
    ]).then(([empResult, assetResult]) => {
      if (!isMounted) return;

      if (empResult.status === "fulfilled" && empResult.value) {
        const data = empResult.value;
        const list = Array.isArray(data)
          ? data
          : data?.employees ?? data?.items ?? data?.records ?? [];
        const total =
          data?.summary?.total ??
          data?.counts?.total ??
          data?.total ??
          data?.pagination?.total ??
          list.length;
        setTotalEmployees(total);
      }

      if (
        assetResult.status === "fulfilled" &&
        Array.isArray(assetResult.value)
      ) {
        const assignedCount = assetResult.value.filter(
          (asset) => String(asset?.status || "").toUpperCase() === "ASSIGNED",
        ).length;
        setAssignedAssets(assignedCount);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const handleSidebarNavigate = (item) => {
    if (
      item.id === "dashboard" ||
      item.id === "employees" ||
      item.id === "assets"
    ) {
      navigate(item.path);
    }
  };

  const statCards = [
    {
      id: "total-employees",
      label: "Total Employees",
      value: totalEmployees,
      iconSrc: totalEmployeesIcon,
      iconAlt: "Total employees icon",
      actionLabel: "View Employees",
      onAction: () => navigate("/admin/employees"),
    },
    {
      id: "present-today",
      label: "Present Today",
      value: 0,
      iconSrc: presentTodayIcon,
      iconAlt: "Present today icon",
      actionLabel: "View Attendance",
      onAction: null,
    },
    {
      id: "pending-leave",
      label: "Pending Leave Request",
      value: 0,
      iconSrc: pendingLeaveIcon,
      iconAlt: "Pending leave request icon",
      actionLabel: "Review Requests",
      onAction: null,
    },
    {
      id: "assigned-assets",
      label: "Assigned Assets",
      value: assignedAssets,
      iconSrc: assignedAssetsIcon,
      iconAlt: "Assigned assets icon",
      actionLabel: "Manage Assets",
      onAction: () => navigate("/admin/assets"),
    },
  ];

  const firstName = getFirstName(user);
  const formattedToday = formatHeaderDate();

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] overflow-x-hidden">
      <Sidebar
        activeRoute="dashboard"
        onNavigate={handleSidebarNavigate}
        onLogout={handleLogout}
        user={user}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardHeader
          breadcrumbs={[]}
          user={user}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-9 lg:py-7">
          <div className="w-full">
            {/* Greeting & Date Pill */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-[28px] sm:text-[32px] font-bold tracking-[-0.02em] text-[#0F172A] leading-tight">
                  Welcome Back, {firstName}!
                </h1>
                <p className="mt-1 text-[13px] font-normal text-[#64748B]">
                  Here’s an overview of your organization’s workforce and HR
                  activities.
                </p>
              </div>

              <div className="inline-flex items-center gap-2.5 h-[40px] px-4 rounded-[8px] border border-[#CBD5E1] bg-white text-[13px] font-medium text-[#0F172A] self-start sm:self-auto shrink-0">
                <CalendarDays
                  className="w-4 h-4 text-[#0F172A]"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span>{formattedToday}</span>
              </div>
            </div>

            {/* 4 Overview Stat Cards */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {statCards.map(
                ({
                  id,
                  label,
                  value,
                  iconSrc,
                  iconAlt,
                  actionLabel,
                  onAction,
                }) => (
                  <div
                    key={id}
                    className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={iconSrc}
                        alt={iconAlt}
                        className="w-11 h-11 rounded-full object-contain shrink-0 select-none"
                      />

                      <div className="min-w-0">
                        <p className="text-[12px] font-medium text-[#475569] truncate">
                          {label}
                        </p>
                        <p className="text-[22px] font-bold text-[#0F172A] leading-tight mt-0.5">
                          {value}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-1">
                      <button
                        type="button"
                        onClick={onAction || undefined}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#0F766E] hover:text-[#115E59] cursor-pointer focus:outline-none focus-visible:underline"
                      >
                        <span>{actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>

            {/* Bottom 2-Column Panels */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Recent Attendance Records */}
              <section
                aria-label="Recent Attendance Records"
                className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-[12px] flex flex-col"
              >
                <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[16px] font-bold text-[#0F172A] leading-snug">
                      Recent Attendance Records
                    </h2>
                    <p className="mt-1 text-[12px] text-[#64748B]">
                      Employee &bull; Clock In &bull; Clock Out &bull; Status
                    </p>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-[#0F766E] hover:text-[#115E59] shrink-0 cursor-pointer focus:outline-none focus-visible:underline"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>

                <div className="flex-1 px-6 py-16 flex flex-col items-center justify-center text-center min-h-[280px]">
                  <div className="w-12 h-12 rounded-full bg-[#DCE1E7] flex items-center justify-center text-[#1E3247]">
                    <CalendarDays
                      className="w-5 h-5"
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-3.5 text-[14px] font-medium text-[#475569] leading-snug max-w-[200px]">
                    No attendance records available yet.
                  </p>
                </div>
              </section>

              {/* Pending Leave Requests */}
              <section
                aria-label="Pending Leave Requests"
                className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-[12px] flex flex-col"
              >
                <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[16px] font-bold text-[#0F172A] leading-snug">
                      Pending Leave Requests
                    </h2>
                    <p className="mt-1 text-[12px] text-[#64748B]">
                      Requests waiting for admin review
                    </p>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-[#0F766E] hover:text-[#115E59] shrink-0 cursor-pointer focus:outline-none focus-visible:underline"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>

                <div className="flex-1 px-6 py-16 flex flex-col items-center justify-center text-center min-h-[280px]">
                  <div className="w-12 h-12 rounded-full bg-[#DCE1E7] flex items-center justify-center text-[#1E3247]">
                    <Plane
                      className="w-5 h-5"
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-3.5 text-[14px] font-medium text-[#475569] leading-snug max-w-[210px]">
                    There are no pending leave requests.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminOverview;