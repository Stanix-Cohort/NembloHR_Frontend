import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  UserCheck,
  UserX,
} from "lucide-react";

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatDate(dateString) {
  if (!dateString) return "—";
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(parsed);
}

function StatusBadge({ status }) {
  const normalized = String(status || "ACTIVE").toLowerCase();

  if (normalized === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-[12px] font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
        Active
      </span>
    );
  }

  if (normalized === "deactivated") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEE2E2] text-[#B91C1C] text-[12px] font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
        Deactivated
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E2E8F0] text-[#475569] text-[12px] font-medium capitalize">
      <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
      {normalized}
    </span>
  );
}

function buildPageNumbers(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage, "...", totalPages];
}

function EmployeeTable({
  employees = [],
  totalItems = 0,
  currentPage = 1,
  pageSize = 7,
  onPageChange,
  onEditEmployee,
  onToggleStatus,
}) {
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!openMenu) return;

    const handleOutsideClick = (event) => {
      const clickedInsideMenu = menuRef.current?.contains(event.target);
      const clickedTrigger = event.target.closest("[data-action-trigger]");
      if (!clickedInsideMenu && !clickedTrigger) {
        setOpenMenu(null);
      }
    };

    const handleClose = () => setOpenMenu(null);

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
    };
  }, [openMenu]);

  const handleToggleMenu = (event, employee) => {
    if (openMenu?.employee?.id === employee.id) {
      setOpenMenu(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const openUpward = window.innerHeight - rect.bottom < 120;

    setOpenMenu({
      employee,
      top: openUpward ? rect.top - 6 : rect.bottom + 6,
      right: window.innerWidth - rect.right,
      openUpward,
    });
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const pages = buildPageNumbers(currentPage, totalPages);

  const activeMenuEmployee = openMenu?.employee;
  const activeMenuStatus = String(
    activeMenuEmployee?.status ||
      (activeMenuEmployee?.isActive === false ? "inactive" : "active"),
  ).toLowerCase();
  const isActiveMenuInactive =
    activeMenuStatus === "inactive" || activeMenuStatus === "deactivated";

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[820px]">
          <thead>
            <tr className="text-left text-[13px] font-semibold text-[#1E293B]">
              <th className="py-3.5 px-4">Employee</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4">Job Title</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Date Added</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee, index) => {
              const name =
                employee.fullName ||
                `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
                employee.username ||
                "—";
              const email = employee.workEmail || employee.email || "—";
              const departmentName =
                employee.department?.name || employee.departmentName || "—";
              const jobTitle = employee.jobTitle || "—";
              const status =
                employee.status ||
                (employee.isActive === false ? "inactive" : "active");
              const dateAdded = formatDate(
                employee.createdAt || employee.startDate,
              );
              const isMenuOpen = activeMenuEmployee?.id === employee.id;

              return (
                <tr
                  key={employee.id || email}
                  className={index % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#DCE1E7] text-[#334155] text-[12px] font-semibold flex items-center justify-center shrink-0">
                        {getInitials(name)}
                      </div>
                      <span className="text-[14px] font-medium text-[#0F172A] whitespace-nowrap">
                        {name}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-[13px] text-[#334155]">
                    {email}
                  </td>

                  <td className="py-3.5 px-4 text-[13px] text-[#334155]">
                    {departmentName}
                  </td>

                  <td className="py-3.5 px-4 text-[13px] text-[#334155]">
                    {jobTitle}
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusBadge status={status} />
                  </td>

                  <td className="py-3.5 px-4 text-[13px] text-[#334155] whitespace-nowrap">
                    {dateAdded}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      data-action-trigger="true"
                      onClick={(e) => handleToggleMenu(e, employee)}
                      aria-label={`Actions for ${name}`}
                      aria-expanded={isMenuOpen}
                      className="w-10 h-8 rounded-[6px] border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] inline-flex items-center justify-center text-[#1E293B] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Action Dropdown Portal/Fixed Menu */}
      {openMenu && (
        <div
          ref={menuRef}
          style={{ top: openMenu.top, right: openMenu.right }}
          className={`fixed z-50 w-48 bg-white border border-[#E2E8F0] rounded-[10px] shadow-md py-1.5 text-left ${
            openMenu.openUpward ? "-translate-y-full" : ""
          }`}
        >
          <button
            type="button"
            onClick={() => {
              const target = activeMenuEmployee;
              setOpenMenu(null);
              if (onEditEmployee) onEditEmployee(target);
            }}
            className="w-full px-3.5 py-2 text-[13px] text-[#1E293B] hover:bg-[#F8FAFC] flex items-center gap-2.5 cursor-pointer"
          >
            <Pencil className="w-4 h-4" strokeWidth={1.75} />
            <span>Edit Employee</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const target = activeMenuEmployee;
              setOpenMenu(null);
              if (onToggleStatus) onToggleStatus(target);
            }}
            className={`w-full px-3.5 py-2 text-[13px] hover:bg-[#F8FAFC] flex items-center gap-2.5 cursor-pointer ${
              isActiveMenuInactive ? "text-[#15803D]" : "text-[#DC2626]"
            }`}
          >
            {isActiveMenuInactive ? (
              <UserCheck className="w-4 h-4" strokeWidth={1.75} />
            ) : (
              <UserX className="w-4 h-4" strokeWidth={1.75} />
            )}
            <span>
              {isActiveMenuInactive
                ? "Reactivate Employee"
                : "Deactivate Employee"}
            </span>
          </button>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-[13px] text-[#475569]">
          Showing {startItem}-{endItem} of {totalItems} employees
        </p>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            aria-label="Previous page"
            className="w-8 h-8 rounded-[6px] border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] flex items-center justify-center text-[#334155] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pages.map((page, index) =>
            page === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="w-8 h-8 flex items-center justify-center text-[13px] text-[#64748B]"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange && onPageChange(page)}
                className={`w-8 h-8 rounded-[6px] text-[13px] font-medium flex items-center justify-center cursor-pointer ${
                  page === currentPage
                    ? "bg-[#1E3247] text-white"
                    : "border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#334155]"
                }`}
              >
                {page}
              </button>
            ),
          )}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            aria-label="Next page"
            className="w-8 h-8 rounded-[6px] border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] flex items-center justify-center text-[#334155] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmployeeTable;