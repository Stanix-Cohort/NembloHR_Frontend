import { Box, CalendarDays, LayoutGrid, Plane } from "lucide-react";

export const EMPLOYEE_NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/employee/dashboard",
    Icon: LayoutGrid,
  },
  {
    id: "attendance",
    label: "Attendance",
    path: "/employee/attendance",
    Icon: CalendarDays,
  },
  {
    id: "assets",
    label: "My Assets",
    path: "/employee/assets",
    Icon: Box,
  },
  {
    id: "leave-management",
    label: "Leave Management",
    path: "/employee/leave-management",
    Icon: Plane,
  },
];