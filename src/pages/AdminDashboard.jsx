import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LoaderCircle, Plus } from "lucide-react";
import Sidebar from "../layouts/Sidebar";
import DashboardHeader from "../layouts/DashboardHeader";
import StatCards from "../components/dashboard/StatCards";
import DirectoryFilters from "../components/dashboard/DirectoryFilters";
import EmptyState from "../components/dashboard/EmptyState";
import EmployeeTable from "../components/dashboard/EmployeeTable";
import DeactivateAccountModal from "../components/dashboard/DeactivateAccountModal";
import { useAuth } from "../context/auth-context";
import { getDepartments, getEmployees } from "../services/employeeService";
import { getApiErrorMessage } from "../utils/apiError";

const PAGE_SIZE = 7;

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeRoute, setActiveRoute] = useState("employees");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [counts, setCounts] = useState({ total: 0, active: 0, inactive: 0 });
  const [totalFiltered, setTotalFiltered] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [sortBy, setSortBy] = useState("name-asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [employeeToDeactivate, setEmployeeToDeactivate] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState("");

  useEffect(() => {
    let isMounted = true;

    getDepartments()
      .then((list) => {
        if (isMounted) setDepartments(list);
      })
      .catch(() => {
        // Department filter falls back gracefully
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchDirectory = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await getEmployees({
        search: searchQuery.trim(),
        departmentId: department,
        status,
        page: currentPage,
        limit: PAGE_SIZE,
      });

      console.log("GET /employees response:", data);

      const list = Array.isArray(data)
        ? data
        : data?.employees ?? data?.items ?? data?.records ?? [];

      const activeFromList = list.filter(
        (emp) => String(emp.status || "active").toLowerCase() === "active",
      ).length;
      const inactiveFromList = list.length - activeFromList;

      const totalCount =
        data?.summary?.total ??
        data?.counts?.total ??
        data?.total ??
        data?.pagination?.total ??
        list.length;

      const activeCount =
        data?.summary?.active ?? data?.counts?.active ?? activeFromList;
      const inactiveCount =
        data?.summary?.inactive ?? data?.counts?.inactive ?? inactiveFromList;

      setEmployees(list);
      setTotalFiltered(data?.pagination?.total ?? data?.total ?? list.length);
      setCounts({
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount,
      });
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Unable to load employee directory."),
      );
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, department, status, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDirectory();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchDirectory]);

  const sortedEmployees = useMemo(() => {
    const copy = [...employees];
    copy.sort((a, b) => {
      const nameA = (a.fullName || a.username || "").toLowerCase();
      const nameB = (b.fullName || b.username || "").toLowerCase();
      return sortBy === "name-desc"
        ? nameB.localeCompare(nameA)
        : nameA.localeCompare(nameB);
    });
    return copy;
  }, [employees, sortBy]);

  const hasActiveFilters = Boolean(searchQuery.trim() || department || status);

  const handleClearFilters = () => {
    setSearchQuery("");
    setDepartment("");
    setStatus("");
    setCurrentPage(1);
  };

  const handleAddEmployee = () => {
    navigate("/admin/employees/new");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleConfirmDeactivate = async (employee) => {
    if (!employee) return;
    setDeactivateError("");
    setIsDeactivating(true);

    try {
      // Ready to connect to the backend deactivate endpoint once confirmed
      console.log("Deactivate employee:", employee.id);
      setEmployeeToDeactivate(null);
    } catch (err) {
      setDeactivateError(
        getApiErrorMessage(err, "Unable to deactivate employee account."),
      );
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] overflow-x-hidden">
      <Sidebar
        activeRoute={activeRoute}
        onNavigate={(item) => setActiveRoute(item.id)}
        onLogout={handleLogout}
        user={user}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardHeader
          sectionLabel="Employees"
          user={user}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-9 lg:py-7">
          <div className="w-full">
            {/* Page Title & Action Controls */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-[28px] sm:text-[32px] font-bold tracking-[-0.02em] text-[#0F172A] leading-tight">
                  Employee Directory
                </h1>
                <p className="mt-1 text-[13px] font-normal text-[#64748B]">
                  Manage your organisation’s employee records.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:pt-1">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort employees"
                    className="h-[42px] pl-4 pr-9 rounded-[10px] border border-[#64748B] bg-white text-[13px] font-medium text-[#0F172A] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E3247]/20 focus:border-[#1E3247]"
                  >
                    <option value="name-asc">Sort by: Name (A-Z)</option>
                    <option value="name-desc">Sort by: Name (Z-A)</option>
                  </select>
                  <ChevronDown
                    className="w-4 h-4 text-[#0F172A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddEmployee}
                  className="h-[42px] px-5 rounded-[10px] bg-[#1E3247] hover:bg-[#162638] active:bg-[#101D2B] text-white text-[13px] font-medium inline-flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/40"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  <span>Add Employee</span>
                </button>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="mt-6">
              <StatCards
                totalCount={counts.total}
                activeCount={counts.active}
                inactiveCount={counts.inactive}
              />
            </div>

            {/* Search & Filter Row */}
            <div className="mt-5">
              <DirectoryFilters
                searchQuery={searchQuery}
                onSearchChange={(val) => {
                  setSearchQuery(val);
                  setCurrentPage(1);
                }}
                department={department}
                onDepartmentChange={(val) => {
                  setDepartment(val);
                  setCurrentPage(1);
                }}
                departments={departments}
                status={status}
                onStatusChange={(val) => {
                  setStatus(val);
                  setCurrentPage(1);
                }}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Directory Content */}
            <div className="mt-6">
              {error && (
                <div
                  role="alert"
                  className="mb-4 rounded-[8px] bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700"
                >
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="bg-white border border-[#E2E8F0] rounded-[12px] py-20 flex flex-col items-center justify-center text-[#64748B]">
                  <LoaderCircle className="w-6 h-6 animate-spin mb-2" />
                  <p className="text-[13px]">Loading employees...</p>
                </div>
              ) : sortedEmployees.length === 0 && !hasActiveFilters ? (
                <EmptyState onAddEmployee={handleAddEmployee} />
              ) : sortedEmployees.length === 0 ? (
                <div className="bg-white border border-[#E2E8F0] rounded-[12px] py-16 px-6 text-center">
                  <p className="text-[16px] font-semibold text-[#0F172A]">
                    No matching employees found
                  </p>
                  <p className="mt-1 text-[13px] text-[#64748B]">
                    Try adjusting your search or filter criteria.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="mt-4 h-[38px] px-4 rounded-[8px] border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[13px] font-medium text-[#1E3247] cursor-pointer"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <EmployeeTable
                  employees={sortedEmployees}
                  totalItems={totalFiltered}
                  currentPage={currentPage}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCurrentPage}
                  onEditEmployee={(employee) =>
                    navigate(`/admin/employees/${employee.id}/edit`, {
                      state: { employee },
                    })
                  }
                  onToggleStatus={(employee) => {
                    setDeactivateError("");
                    setEmployeeToDeactivate(employee);
                  }}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      <DeactivateAccountModal
        isOpen={Boolean(employeeToDeactivate)}
        employee={employeeToDeactivate}
        isSubmitting={isDeactivating}
        error={deactivateError}
        onCancel={() => {
          if (!isDeactivating) {
            setDeactivateError("");
            setEmployeeToDeactivate(null);
          }
        }}
        onConfirm={handleConfirmDeactivate}
      />
    </div>
  );
}

export default AdminDashboard;