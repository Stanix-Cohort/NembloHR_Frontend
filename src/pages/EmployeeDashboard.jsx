import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Activity,
  ArrowRight,
  Box,
  CalendarDays,
  Check,
  Clock,
  FileText,
  LayoutGrid,
  LoaderCircle,
  LogIn,
  LogOut,
  Plane,
} from "lucide-react";

import Sidebar from "../layouts/Sidebar";
import DashboardHeader from "../layouts/DashboardHeader";
import { EMPLOYEE_NAV_ITEMS } from "../constants/employeeNav";
import { useAuth } from "../context/auth-context";
import {
  clockIn,
  clockOut,
  getMyAttendanceHistory,
  getTodayAttendance,
} from "../services/attendanceService";
import { getMyAssets } from "../services/assetService";
import { getApiErrorMessage } from "../utils/apiError";

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

function formatTime(dateString) {
  if (!dateString) return "";
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function formatActivityDateTime(dateString) {
  if (!dateString) return "—";
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return "—";

  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(parsed);
  const day = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
  }).format(parsed);
  const month = new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(parsed);
  const year = parsed.getFullYear();
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);

  return `${weekday}, ${day} ${month} ${year} · ${time}`;
}

function getGreetingPrefix() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function getFirstName(user) {
  const raw = user?.fullName || user?.username || "User";
  const first = raw.trim().split(/[\s@]+/)[0];
  if (!first) return "User";
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function unwrapAttendanceRecord(payload) {
  if (!payload) return null;
  if (payload.attendance && typeof payload.attendance === "object") {
    return payload.attendance;
  }
  return payload;
}

function getClockInTimestamp(record) {
  return (
    record?.clockIn ||
    record?.clockInTime ||
    record?.checkIn ||
    record?.checkInTime ||
    null
  );
}

function getClockOutTimestamp(record) {
  return (
    record?.clockOut ||
    record?.clockOutTime ||
    record?.checkOut ||
    record?.checkOutTime ||
    null
  );
}

function LeaveStatusPill({ status }) {
  const normalized = String(status || "PENDING").toUpperCase();

  if (normalized === "APPROVED") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-[6px] bg-[#DCFCE7] text-[#15803D] text-[11px] font-medium whitespace-nowrap">
        Approved
      </span>
    );
  }

  if (normalized === "DECLINED" || normalized === "REJECTED") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-[6px] bg-[#FEE2E2] text-[#B91C1C] text-[11px] font-medium whitespace-nowrap">
        Declined
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-[6px] bg-[#FEF3C7] text-[#B45309] text-[11px] font-medium whitespace-nowrap">
      Pending
    </span>
  );
}

function ActivityStatusPill({ status }) {
  const normalized = String(status || "").toUpperCase();
  if (!normalized) return null;

  if (normalized === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-[11px] font-medium whitespace-nowrap shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
        Approved
      </span>
    );
  }

  if (normalized === "DECLINED" || normalized === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEE2E2] text-[#B91C1C] text-[11px] font-medium whitespace-nowrap shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
        Declined
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] text-[11px] font-medium whitespace-nowrap shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
      Pending
    </span>
  );
}

function ActivityIcon({ type }) {
  if (type === "attendance") {
    return (
      <div className="w-9 h-9 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
        <Check className="w-4 h-4" strokeWidth={2.2} aria-hidden="true" />
      </div>
    );
  }

  if (type === "asset") {
    return (
      <div className="w-9 h-9 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
        <Box className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="w-9 h-9 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
      <Plane className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
    </div>
  );
}

function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [todayRecord, setTodayRecord] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [rawAssets, setRawAssets] = useState([]);
  const [isClockSubmitting, setIsClockSubmitting] = useState(false);

  // Leave endpoints are not on the backend yet
  const leaveSummary = null;

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      getTodayAttendance(),
      getMyAttendanceHistory(),
      getMyAssets(),
    ]).then(([todayResult, historyResult, assetsResult]) => {
      if (!isMounted) return;

      if (todayResult.status === "fulfilled") {
        setTodayRecord(unwrapAttendanceRecord(todayResult.value));
      }

      if (
        historyResult.status === "fulfilled" &&
        Array.isArray(historyResult.value)
      ) {
        setAttendanceHistory(historyResult.value);
      }

      if (
        assetsResult.status === "fulfilled" &&
        Array.isArray(assetsResult.value)
      ) {
        setRawAssets(assetsResult.value);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const assignedAssets = useMemo(
    () =>
      rawAssets.map((item) => ({
        ...(item.asset ?? item),
        assignedAt: item.assignedAt || item.createdAt || item.updatedAt,
      })),
    [rawAssets],
  );

  const recentActivities = useMemo(() => {
    const items = [];

    for (const rec of attendanceHistory) {
      const clockOutTs = getClockOutTimestamp(rec);
      const clockInTs = getClockInTimestamp(rec);
      const eventTs = clockOutTs || clockInTs || rec.date || rec.createdAt;
      if (!eventTs) continue;

      items.push({
        id: `att-${rec.id || eventTs}`,
        type: "attendance",
        title: clockOutTs
          ? "Your attendance for the day has been completed"
          : "Your attendance for today has been recorded",
        timestamp: formatActivityDateTime(eventTs),
        sortTime: new Date(eventTs).getTime() || 0,
      });
    }

    for (const asset of assignedAssets) {
      const eventTs = asset.assignedAt;
      if (!eventTs) continue;

      items.push({
        id: `asset-${asset.id || asset.assetId}`,
        type: "asset",
        title: `New asset assigned: ${asset.name || asset.type || asset.assetId}`,
        timestamp: formatActivityDateTime(eventTs),
        sortTime: new Date(eventTs).getTime() || 0,
      });
    }

    return items.sort((a, b) => b.sortTime - a.sortTime).slice(0, 5);
  }, [attendanceHistory, assignedAssets]);

  const clockInTs = getClockInTimestamp(todayRecord);
  const clockOutTs = getClockOutTimestamp(todayRecord);

  const attendanceStatus = clockOutTs
    ? "CLOCKED_OUT"
    : clockInTs
      ? "CLOCKED_IN"
      : "NOT_CLOCKED_IN";

  const isClockedIn = attendanceStatus === "CLOCKED_IN";
  const isClockedOut = attendanceStatus === "CLOCKED_OUT";

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const handleClockAction = async () => {
    if (isClockSubmitting || isClockedOut) return;

    setIsClockSubmitting(true);

    try {
      const response = isClockedIn ? await clockOut() : await clockIn();
      const updated = unwrapAttendanceRecord(response);
      setTodayRecord(updated);

      toast.success(
        isClockedIn
          ? "Clocked out successfully."
          : "Clocked in successfully.",
      );

      getMyAttendanceHistory()
        .then((history) => {
          if (Array.isArray(history)) {
            setAttendanceHistory(history);
          }
        })
        .catch(() => {
          // Keep existing history if background refresh fails
        });
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, "Unable to record attendance. Please try again."),
      );
    } finally {
      setIsClockSubmitting(false);
    }
  };

  const firstName = getFirstName(user);
  const greetingPrefix = getGreetingPrefix();
  const formattedToday = formatHeaderDate();

  const quickActions = [
    {
      id: "request-leave",
      label: "Request Leave",
      Icon: Plane,
      onClick: () => navigate("/employee/leave-management"),
    },
    {
      id: "view-attendance",
      label: "View Attendance",
      Icon: CalendarDays,
      onClick: () => navigate("/employee/attendance"),
    },
    {
      id: "view-assets",
      label: "View Assets",
      Icon: Box,
      onClick: () => navigate("/employee/assets"),
    },
    {
      id: "hr-policies",
      label: "HR Policies",
      Icon: FileText,
      onClick: () =>
        toast.info("HR Policies page will be added in an upcoming update."),
    },
  ];

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] overflow-x-hidden">
      <Sidebar
        portalLabel="Employee Portal"
        navItems={EMPLOYEE_NAV_ITEMS}
        activeRoute="dashboard"
        onNavigate={(item) => navigate(item.path)}
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
                  {greetingPrefix}, {firstName}!
                </h1>
                <p className="mt-1 text-[13px] font-normal text-[#64748B]">
                  Here’s an overview of your attendance, leave.
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

            {/* Top 3 Summary Cards */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr] gap-5">
              {/* Today's Attendance Card */}
              <section
                aria-label="Today's Attendance"
                className="relative overflow-hidden bg-white border border-[#E2E8F0] rounded-[12px] p-6 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-[#EFF6FF]"
                />

                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                      <Clock
                        className="w-5 h-5"
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </div>
                    <h2 className="text-[14px] font-medium text-[#0F172A] truncate">
                      Today’s Attendance
                    </h2>
                  </div>

                  {isClockedIn ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-[11px] font-medium whitespace-nowrap shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                      Clocked In
                    </span>
                  ) : isClockedOut ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E2E8F0] text-[#475569] text-[11px] font-medium whitespace-nowrap shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
                      Clocked Out
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEE2E2] text-[#B91C1C] text-[11px] font-medium whitespace-nowrap shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                      Not Clocked In
                    </span>
                  )}
                </div>

                <div className="relative z-10 mt-6">
                  <p className="text-[22px] font-bold text-[#0F172A] leading-snug">
                    {isClockedIn
                      ? "Clocked In"
                      : isClockedOut
                        ? "Clocked Out"
                        : "Not Clocked In"}
                  </p>
                  <p className="mt-1 text-[13px] text-[#64748B]">
                    {isClockedIn
                      ? clockInTs
                        ? `Clocked in at ${formatTime(clockInTs)}.`
                        : "Your workday is currently active."
                      : isClockedOut
                        ? clockOutTs
                          ? `Clocked out at ${formatTime(clockOutTs)}.`
                          : "You have completed today’s workday."
                        : "Clock in to start your workday."}
                  </p>
                </div>

                <div className="relative z-10 mt-6">
                  <button
                    type="button"
                    disabled={isClockedOut || isClockSubmitting}
                    onClick={handleClockAction}
                    className="w-full h-[44px] rounded-[8px] bg-[#1E3247] hover:bg-[#162638] active:bg-[#101D2B] text-white text-[14px] font-medium inline-flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/40 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isClockSubmitting ? (
                      <>
                        <LoaderCircle className="w-4 h-4 animate-spin" />
                        <span>
                          {isClockedIn ? "Clocking Out..." : "Clocking In..."}
                        </span>
                      </>
                    ) : isClockedIn ? (
                      <>
                        <LogOut className="w-4 h-4" strokeWidth={1.8} />
                        <span>Clock Out</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" strokeWidth={1.8} />
                        <span>
                          {isClockedOut ? "Completed Today" : "Clock In"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </section>

              {/* Leave Summary Card */}
              <section
                aria-label="Leave Summary"
                className="bg-white border border-[#E2E8F0] rounded-[12px] p-6 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                    <Plane
                      className="w-5 h-5"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </div>
                  <h2 className="text-[14px] font-medium text-[#0F172A]">
                    Leave Summary
                  </h2>
                </div>

                {leaveSummary ? (
                  <div className="mt-5">
                    <p className="text-[26px] font-bold text-[#0F172A] leading-tight">
                      {leaveSummary.availableDays} days
                    </p>
                    <p className="mt-0.5 text-[12px] text-[#64748B]">
                      Available
                    </p>

                    {leaveSummary.latestRequest && (
                      <div className="mt-4">
                        <p className="text-[11px] text-[#64748B]">
                          Latest Request
                        </p>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <span className="text-[14px] font-medium text-[#0F172A] truncate">
                            {leaveSummary.latestRequest.type}
                          </span>
                          <LeaveStatusPill
                            status={leaveSummary.latestRequest.status}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="my-6 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full bg-[#DCE1E7] text-[#1E3247] flex items-center justify-center">
                      <Plane
                        className="w-4 h-4"
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-3 text-[13px] font-medium text-[#475569] leading-snug max-w-[140px]">
                      No Leave Request Yet.
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => navigate("/employee/leave-management")}
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#0F766E] hover:text-[#115E59] cursor-pointer focus:outline-none focus-visible:underline"
                  >
                    <span>View Leave</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>
              </section>

              {/* My Assigned Assets Card */}
              <section
                aria-label="My Assigned Assets"
                className="bg-white border border-[#E2E8F0] rounded-[12px] p-6 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                    <Box
                      className="w-5 h-5"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </div>
                  <h2 className="text-[14px] font-medium text-[#0F172A]">
                    My Assigned Assets
                  </h2>
                </div>

                {assignedAssets.length > 0 ? (
                  <div className="mt-5 space-y-3">
                    {assignedAssets.slice(0, 2).map((asset) => (
                      <div
                        key={asset.id || asset.assetId}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center overflow-hidden shrink-0">
                            {asset.imageUrl ? (
                              <img
                                src={asset.imageUrl}
                                alt={asset.name || asset.type || "Asset"}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Box
                                className="w-4 h-4 text-[#64748B]"
                                strokeWidth={1.7}
                                aria-hidden="true"
                              />
                            )}
                          </div>
                          <span className="text-[13px] font-medium text-[#0F172A] truncate">
                            {asset.name || asset.type || asset.assetId}
                          </span>
                        </div>

                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-[6px] bg-[#DCFCE7] text-[#15803D] text-[11px] font-medium shrink-0">
                          Assigned
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="my-6 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full bg-[#DCE1E7] text-[#1E3247] flex items-center justify-center">
                      <Box
                        className="w-4 h-4"
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-3 text-[13px] font-medium text-[#475569] leading-snug max-w-[140px]">
                      No Assets Assigned Yet.
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => navigate("/employee/assets")}
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#0F766E] hover:text-[#115E59] cursor-pointer focus:outline-none focus-visible:underline"
                  >
                    <span>View My Assets</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>
              </section>
            </div>

            {/* Bottom Row: Recent Activity & Quick Access */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Recent Activity */}
              <section
                aria-label="Recent Activity"
                className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-[12px] flex flex-col"
              >
                <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Activity
                      className="w-4 h-4 text-[#0F172A]"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    <h2 className="text-[16px] font-bold text-[#0F172A] leading-snug">
                      Recent Activity
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/employee/attendance")}
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-[#0F766E] hover:text-[#115E59] shrink-0 cursor-pointer focus:outline-none focus-visible:underline"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>

                {recentActivities.length > 0 ? (
                  <div className="divide-y divide-[#E2E8F0]">
                    {recentActivities.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="px-6 py-4 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <ActivityIcon type={item.type} />
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-[#0F172A] truncate">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-[#64748B] mt-0.5">
                              {item.timestamp}
                            </p>
                          </div>
                        </div>

                        <ActivityStatusPill status={item.status} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 px-6 py-16 flex flex-col items-center justify-center text-center min-h-[250px]">
                    <div className="w-11 h-11 rounded-full bg-[#DCE1E7] text-[#1E3247] flex items-center justify-center">
                      <Activity
                        className="w-5 h-5"
                        strokeWidth={1.6}
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-3 text-[13px] font-medium text-[#475569] leading-snug max-w-[140px]">
                      No Recent Activity Yet.
                    </p>
                  </div>
                )}
              </section>

              {/* Quick Access */}
              <section
                aria-label="Quick Access"
                className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-[12px] p-6 self-start"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F1F5F9] text-[#1E3247] flex items-center justify-center shrink-0">
                    <LayoutGrid
                      className="w-5 h-5"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <h2 className="text-[16px] font-bold text-[#0F172A] leading-snug">
                      Quick Access
                    </h2>
                    <p className="mt-0.5 text-[12px] text-[#64748B]">
                      Get started with common HR services.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {quickActions.map(({ id, label, Icon, onClick }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={onClick}
                      className="rounded-[10px] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#F1F5F9] hover:border-[#E2E8F0] px-2 py-5 flex flex-col items-center justify-center text-center gap-2.5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30"
                    >
                      <Icon
                        className="w-5 h-5 text-[#1E293B]"
                        strokeWidth={1.6}
                        aria-hidden="true"
                      />
                      <span className="text-[12px] font-medium text-[#0F172A] leading-tight">
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default EmployeeDashboard;