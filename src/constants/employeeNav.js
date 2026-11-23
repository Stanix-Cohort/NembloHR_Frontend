import { Briefcase, CalendarCheck, Home, Users } from "lucide-react";

export const EMPLOYEE_NAV_ITEMS = [
  { id: "home", label: "Home", path: "/employee/dashboard", Icon: Home },
  {
    id: "assets",
    label: "My Assets",
    path: "/employee/assets",
    Icon: Briefcase,
  },
  {
    id: "attendance",
    label: "Attendance",
    path: "/employee/attendance",
    Icon: Users,
  },
  {
    id: "leave-management",
    label: "Leave Management",
    path: "/employee/leave-management",
    Icon: CalendarCheck,
  },
];