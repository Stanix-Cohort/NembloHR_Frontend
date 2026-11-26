import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Briefcase,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  Copy,
  LoaderCircle,
  UserCheck,
} from "lucide-react";

import Sidebar from "../layouts/Sidebar";
import DashboardHeader from "../layouts/DashboardHeader";
import { useAuth } from "../context/auth-context";
import { assignAsset, getAssets } from "../services/assetService";
import { getEmployees } from "../services/employeeService";
import { getApiErrorMessage } from "../utils/apiError";

const CONDITION_LABELS = {
  NEW: "New",
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
  DAMAGED: "Damaged",
};

function formatCondition(condition) {
  if (!condition) return "—";
  const key = String(condition).toUpperCase();
  return CONDITION_LABELS[key] || condition;
}

function formatDate(dateString) {
  if (!dateString) return "—";
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function AssetStatusPill({ status }) {
  const normalized = String(status || "AVAILABLE").toUpperCase();

  if (normalized === "AVAILABLE") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-[12px] font-medium whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
        Available
      </span>
    );
  }

  if (normalized === "ASSIGNED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8] text-[12px] font-medium whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
        Assigned
      </span>
    );
  }

  if (normalized === "UNDER_REPAIR") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] text-[12px] font-medium whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
        Under Repair
      </span>
    );
  }

  if (normalized === "RETIRED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEE2E2] text-[#B91C1C] text-[12px] font-medium whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
        Retired
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E2E8F0] text-[#475569] text-[12px] font-medium capitalize whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
      {normalized.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}

function EmployeeSelect({
  id = "assign-employee",
  value = "",
  onChange,
  employees = [],
  loading = false,
  disabled = false,
  hasError = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectedEmployee = employees.find((emp) => emp.id === value);
  const selectedLabel = selectedEmployee
    ? selectedEmployee.fullName ||
      `${selectedEmployee.firstName || ""} ${selectedEmployee.lastName || ""}`.trim() ||
      selectedEmployee.workEmail ||
      selectedEmployee.username
    : "";

  const triggerLabel = loading
    ? "Loading employees..."
    : selectedLabel || "e.g Sarah Williams";

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled || loading}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={hasError}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-[46px] pl-4 pr-10 rounded-[8px] border bg-white text-[14px] text-left flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
          hasError
            ? "border-[#DC2626] focus:ring-[#DC2626]/20 focus:border-[#DC2626]"
            : "border-[#CBD5E1] focus:ring-[#1E3247]/20 focus:border-[#1E3247]"
        } ${selectedLabel ? "text-[#0F172A]" : "text-[#64748B]"}`}
      >
        <span className="truncate">{triggerLabel}</span>
        <ChevronDown
          className={`w-4 h-4 text-[#0F172A] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-labelledby={id}
          className="absolute right-0 left-0 mt-1.5 z-30 bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0_8px_24px_rgba(15,23,42,0.08)] overflow-hidden"
        >
          <div className="max-h-[220px] overflow-y-auto divide-y divide-[#E2E8F0]">
            {employees.length === 0 ? (
              <p className="px-4 py-2.5 text-[13px] text-[#64748B]">
                No active employees found
              </p>
            ) : (
              employees.map((emp) => {
                const label =
                  emp.fullName ||
                  `${emp.firstName || ""} ${emp.lastName || ""}`.trim() ||
                  emp.workEmail ||
                  emp.username;
                const isSelected = emp.id === value;

                return (
                  <button
                    key={emp.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange?.(emp.id);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-[13px] text-left flex items-center justify-between cursor-pointer hover:bg-[#F8FAFC] ${
                      isSelected
                        ? "bg-[#F1F5F9] font-medium text-[#0F172A]"
                        : "text-[#0F172A]"
                    }`}
                  >
                    <span className="truncate">{label}</span>
                    {isSelected && (
                      <Check
                        className="w-4 h-4 text-[#1E3247] shrink-0"
                        strokeWidth={2}
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AssignAsset() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [asset, setAsset] = useState(() => location.state?.asset || null);
  const [isLoadingAsset, setIsLoadingAsset] = useState(
    () => !location.state?.asset && Boolean(id),
  );
  const [loadError, setLoadError] = useState("");

  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (asset || !id) return;

    let isMounted = true;

    getAssets()
      .then((list) => {
        if (!isMounted) return;
        const found = (Array.isArray(list) ? list : []).find(
          (item) => item.id === id,
        );
        if (!found) {
          setLoadError("Asset not found.");
        } else {
          setAsset(found);
          setLoadError("");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setLoadError(getApiErrorMessage(err, "Unable to load asset details."));
      })
      .finally(() => {
        if (isMounted) setIsLoadingAsset(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, asset]);

  useEffect(() => {
    let isMounted = true;

    getEmployees({ status: "active", page: 1, limit: 100 })
      .then((data) => {
        if (!isMounted) return;
        const list = Array.isArray(data)
          ? data
          : data?.employees ?? data?.items ?? data?.records ?? [];
        const activeOnly = list.filter(
          (emp) =>
            String(
              emp.employmentStatus ??
                emp.status ??
                (emp.isActive === false ? "inactive" : "active"),
            ).toLowerCase() === "active",
        );
        setEmployees(activeOnly);
      })
      .catch(() => {
        // Leave dropdown empty gracefully on error
      })
      .finally(() => {
        if (isMounted) setEmployeesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleBack = () => {
    navigate("/admin/assets");
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const handleSidebarNavigate = (item) => {
    if (item.id === "employees" || item.id === "assets") {
      navigate(item.path);
    }
  };

const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!selectedEmployeeId) {
      setValidationError("Please select an employee.");
      return;
    }

    setIsSubmitting(true);
    try {
      await assignAsset(asset?.id || id, selectedEmployeeId);
      toast.success("Asset assigned successfully.");
      navigate("/admin/assets", { replace: true });
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, "Unable to assign asset. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const assignedName =
    asset?.assignedTo?.fullName ||
    asset?.currentAssignment?.employee?.fullName ||
    asset?.assignedEmployee?.fullName ||
    asset?.employee?.fullName ||
    asset?.assignedToName ||
    "";

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] overflow-x-hidden">
      <Sidebar
        activeRoute="assets"
        onNavigate={handleSidebarNavigate}
        onLogout={handleLogout}
        user={user}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardHeader
          breadcrumbs={[
            { label: "Admin" },
            { label: "Assets", onClick: handleBack },
            { label: "Assign Asset" },
          ]}
          user={user}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-9 lg:py-7">
          <div className="w-full">
            {/* Page Title & Back Button */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[28px] sm:text-[32px] font-bold tracking-[-0.02em] text-[#0F172A] leading-tight">
                  Assign Asset
                </h1>
                <p className="mt-1 text-[13px] font-normal text-[#64748B]">
                  Assign an available asset to an employee
                </p>
              </div>

              <button
                type="button"
                onClick={handleBack}
                className="h-[38px] px-4 rounded-[8px] border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[13px] font-medium text-[#1E293B] inline-flex items-center gap-1.5 shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
                <span>Back</span>
              </button>
            </div>

            {/* Content */}
            <div className="mt-6">
              {isLoadingAsset ? (
                <div className="bg-white border border-[#E2E8F0] rounded-[12px] py-20 flex flex-col items-center justify-center text-[#64748B]">
                  <LoaderCircle className="w-6 h-6 animate-spin mb-2" />
                  <p className="text-[13px]">Loading asset details...</p>
                </div>
              ) : loadError ? (
                <div
                  role="alert"
                  className="bg-white border border-red-200 rounded-[12px] p-6 text-[13px] text-red-700"
                >
                  {loadError}
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  aria-busy={isSubmitting}
                  className="bg-white border border-[#E2E8F0] rounded-[12px] p-6 sm:p-8"
                >
                  {/* Asset Summary Row */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Image + Name + ID/Serial */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5 min-w-0">
                      <div className="w-[180px] h-[138px] rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] overflow-hidden flex items-center justify-center shrink-0">
                        {asset?.imageUrl ? (
                          <img
                            src={asset.imageUrl}
                            alt={asset.name || asset.type || "Asset"}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Briefcase
                            className="w-8 h-8 text-[#94A3B8]"
                            strokeWidth={1.5}
                            aria-hidden="true"
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-[20px] font-bold text-[#0F172A] leading-snug">
                            {asset?.name || asset?.type || "Asset"}
                          </h2>
                          <AssetStatusPill status={asset?.status} />
                        </div>

                        <p className="mt-1.5 text-[13px] text-[#475569]">
                          {asset?.assetId || "—"}
                          {"  ·  "}
                          {asset?.serialNumber || "No serial number"}
                        </p>
                      </div>
                    </div>

                    {/* Right: Metadata */}
                    <div className="space-y-2.5 text-[13px] lg:min-w-[290px]">
                      <div className="flex items-center gap-2.5">
                        <Copy
                          className="w-4 h-4 text-[#475569] shrink-0"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                        <span className="text-[#475569]">Condition:</span>
                        <span className="font-medium text-[#0F172A]">
                          {formatCondition(asset?.condition)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Briefcase
                          className="w-4 h-4 text-[#475569] shrink-0"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                        <span className="text-[#475569]">Asset Type:</span>
                        <span className="font-medium text-[#0F172A]">
                          {asset?.type || "—"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Calendar
                          className="w-4 h-4 text-[#475569] shrink-0"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                        <span className="text-[#475569]">Date Acquired:</span>
                        <span className="font-medium text-[#0F172A]">
                          {formatDate(asset?.dateAcquired || asset?.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <UserCheck
                          className="w-4 h-4 text-[#475569] shrink-0"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                        <span className="text-[#475569]">Assigned To:</span>
                        <span className="font-medium text-[#0F172A]">
                          {assignedName || "Not Assigned"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Select Employee */}
                  <div className="mt-8 max-w-[520px]">
                    <label
                      htmlFor="assign-employee"
                      className="block text-[14px] font-medium text-[#0F172A] mb-2"
                    >
                      Select Employee <span className="text-[#DC2626]">*</span>
                    </label>

                    <EmployeeSelect
                      id="assign-employee"
                      value={selectedEmployeeId}
                      onChange={(empId) => {
                        setSelectedEmployeeId(empId);
                        if (validationError) setValidationError("");
                      }}
                      employees={employees}
                      loading={employeesLoading}
                      disabled={isSubmitting}
                      hasError={Boolean(validationError)}
                    />

                    {validationError && (
                      <p className="mt-1.5 text-[12px] text-[#DC2626]">
                        {validationError}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-10 flex items-center justify-end gap-3.5">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={isSubmitting}
                      className="h-[42px] px-5 rounded-[8px] border border-[#94A3B8] bg-white hover:bg-[#F8FAFC] text-[13px] font-medium text-[#1E293B] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-[42px] px-5 rounded-[8px] bg-[#1E3247] hover:bg-[#162638] active:bg-[#101D2B] text-[13px] font-medium text-white inline-flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/40 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting && (
                        <LoaderCircle className="w-4 h-4 animate-spin" />
                      )}
                      <span>
                        {isSubmitting ? "Assigning..." : "Assign Asset"}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AssignAsset;