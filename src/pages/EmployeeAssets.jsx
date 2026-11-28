import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  ChevronDown,
  ChevronRight,
  LoaderCircle,
  RotateCw,
  Search,
} from "lucide-react";

import Sidebar from "../layouts/Sidebar";
import DashboardHeader from "../layouts/DashboardHeader";
import AssetsEmptyState from "../components/employee/AssetsEmptyState";
import { EMPLOYEE_NAV_ITEMS } from "../constants/employeeNav";
import { useAuth } from "../context/auth-context";
import { getMyAssets } from "../services/assetService";
import { getApiErrorMessage } from "../utils/apiError";

import totalAssetsIcon from "../assets/icon-total-assets.png";
import availableAssetsIcon from "../assets/icon-available-assets.png";
import underRepairAssetsIcon from "../assets/icon-under-repair-assets.png";

const GOOD_CONDITIONS = new Set(["NEW", "EXCELLENT", "GOOD"]);

function formatOrdinalDate(dateString) {
  if (!dateString) return "—";
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return "—";

  const day = parsed.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";

  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(
    parsed,
  );
  const year = parsed.getFullYear();

  return `${day}${suffix} ${month} ${year}`;
}

function isGoodCondition(asset) {
  if (asset?.hasReportedIssue) return false;
  const condition = String(asset?.condition || "GOOD").toUpperCase();
  return GOOD_CONDITIONS.has(condition);
}

function ConditionBadge({ asset }) {
  if (isGoodCondition(asset)) {
    const condition = String(asset?.condition || "GOOD").toUpperCase();
    const label =
      condition === "NEW"
        ? "New"
        : condition === "EXCELLENT"
          ? "Excellent"
          : "Good";

    return (
      <span className="inline-flex items-center justify-center min-w-[76px] px-3 py-1 rounded-[6px] bg-[#DCFCE7] text-[#15803D] text-[12px] font-medium whitespace-nowrap">
        {label}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center justify-center min-w-[116px] px-3 py-1 rounded-[6px] bg-[#FEF3C7] text-[#B45309] text-[12px] font-medium whitespace-nowrap">
      Needs Attention
    </span>
  );
}

function EmployeeAssets() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [rawAssets, setRawAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");

  useEffect(() => {
    let isMounted = true;

    getMyAssets()
      .then((list) => {
        if (!isMounted) return;
        setRawAssets(Array.isArray(list) ? list : []);
        setError("");
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(getApiErrorMessage(err, "Unable to load your assets."));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const assets = useMemo(
    () =>
      rawAssets.map((item) => ({
        ...(item.asset ?? item),
        assignedAt:
          item.assignedAt ||
          item.createdAt ||
          item.updatedAt ||
          item.asset?.updatedAt,
      })),
    [rawAssets],
  );

  const counts = useMemo(() => {
    let good = 0;
    let needsAttention = 0;

    for (const asset of assets) {
      if (isGoodCondition(asset)) {
        good += 1;
      } else {
        needsAttention += 1;
      }
    }

    return {
      total: assets.length,
      good,
      needsAttention,
    };
  }, [assets]);

  const filteredAssets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return assets.filter((asset) => {
      if (conditionFilter === "GOOD" && !isGoodCondition(asset)) {
        return false;
      }
      if (conditionFilter === "NEEDS_ATTENTION" && isGoodCondition(asset)) {
        return false;
      }
      if (
        conditionFilter &&
        conditionFilter !== "GOOD" &&
        conditionFilter !== "NEEDS_ATTENTION" &&
        String(asset.condition || "").toUpperCase() !== conditionFilter
      ) {
        return false;
      }

      if (!query) return true;

      const searchable = [
        asset.name,
        asset.type,
        asset.assetId,
        asset.serialNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [assets, searchQuery, conditionFilter]);

  const hasActiveFilters = Boolean(searchQuery.trim() || conditionFilter);

  const handleClearFilters = () => {
    setSearchQuery("");
    setConditionFilter("");
  };

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
        activeRoute="assets"
        onNavigate={(item) => navigate(item.path)}
        onLogout={handleLogout}
        user={user}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardHeader
          breadcrumbs={[{ label: "Employee" }, { label: "My Assets" }]}
          user={user}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-9 lg:py-7">
          <div className="w-full">
            <div>
              <h1 className="text-[28px] sm:text-[32px] font-bold tracking-[-0.02em] text-[#0F172A] leading-tight">
                My Assets
              </h1>
              <p className="mt-1 text-[13px] font-normal text-[#64748B]">
                View and manage the assets assigned to you.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-6 rounded-[8px] bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700"
              >
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="mt-6 bg-white border border-[#E2E8F0] rounded-[12px] py-20 flex flex-col items-center justify-center text-[#64748B]">
                <LoaderCircle className="w-6 h-6 animate-spin mb-2" />
                <p className="text-[13px]">Loading your assigned assets...</p>
              </div>
            ) : assets.length === 0 ? (
              <div className="mt-6">
                <AssetsEmptyState />
              </div>
            ) : (
              <>
                {/* 3 Stat Cards */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                  <div className="col-span-2 md:col-span-1 bg-white border border-[#E2E8F0] rounded-[12px] px-3.5 py-3.5 sm:px-6 sm:py-5 flex items-center gap-3 sm:gap-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                    <img
                      src={totalAssetsIcon}
                      alt="Total assets icon"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-contain shrink-0 select-none"
                    />
                    <div className="min-w-0">
                      <p className="text-[18px] sm:text-[20px] font-bold text-[#0F172A] leading-tight">
                        {counts.total}
                      </p>
                      <p className="text-[12px] font-normal text-[#475569] mt-0.5 leading-snug">
                        Total Assets
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-[#E2E8F0] rounded-[12px] px-3.5 py-3.5 sm:px-6 sm:py-5 flex items-center gap-3 sm:gap-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                    <img
                      src={availableAssetsIcon}
                      alt="In good condition icon"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-contain shrink-0 select-none"
                    />
                    <div className="min-w-0">
                      <p className="text-[18px] sm:text-[20px] font-bold text-[#0F172A] leading-tight">
                        {counts.good}
                      </p>
                      <p className="text-[12px] font-normal text-[#475569] mt-0.5 leading-snug">
                        In Good Condition
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-[#E2E8F0] rounded-[12px] px-3.5 py-3.5 sm:px-6 sm:py-5 flex items-center gap-3 sm:gap-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                    <img
                      src={underRepairAssetsIcon}
                      alt="Needs attention icon"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-contain shrink-0 select-none"
                    />
                    <div className="min-w-0">
                      <p className="text-[18px] sm:text-[20px] font-bold text-[#0F172A] leading-tight">
                        {counts.needsAttention}
                      </p>
                      <p className="text-[12px] font-normal text-[#475569] mt-0.5 leading-snug">
                        Needs Attention
                      </p>
                    </div>
                  </div>
                </div>

                {/* Search & Filter Row */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <div className="relative w-full sm:w-[340px]">
                    <Search
                      className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search assets..."
                      aria-label="Search my assets"
                      className="w-full h-[40px] pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-[8px] text-[13px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#1E3247]/20 focus:border-[#1E3247]"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={conditionFilter}
                      onChange={(e) => setConditionFilter(e.target.value)}
                      aria-label="Filter by condition"
                      className="h-[40px] min-w-[175px] bg-white border border-[#E2E8F0] rounded-[8px] pl-3.5 pr-9 text-[13px] font-medium text-[#0F172A] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E3247]/20 focus:border-[#1E3247]"
                    >
                      <option value="">All Conditions</option>
                      <option value="GOOD">In Good Condition</option>
                      <option value="NEEDS_ATTENTION">Needs Attention</option>
                      <option value="NEW">New</option>
                      <option value="FAIR">Fair</option>
                      <option value="POOR">Poor</option>
                      <option value="DAMAGED">Damaged</option>
                    </select>
                    <ChevronDown
                      className="w-4 h-4 text-[#0F172A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="h-[40px] px-2.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1E3247] hover:text-[#0F172A] rounded-[8px] hover:bg-[#E2E8F0]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>Clear Filters</span>
                  </button>
                </div>

                {/* Asset List */}
                <div className="mt-6">
                  {filteredAssets.length === 0 && hasActiveFilters ? (
                    <div className="bg-white border border-[#E2E8F0] rounded-[12px] py-16 px-6 text-center">
                      <p className="text-[16px] font-semibold text-[#0F172A]">
                        No matching assets found
                      </p>
                      <p className="mt-1 text-[13px] text-[#64748B]">
                        Try adjusting your search or condition filter.
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
                    <div className="space-y-4">
                      {filteredAssets.map((asset) => {
                        const title = asset.name || asset.type || asset.assetId;
                        return (
                          <div
                            key={asset.id || asset.assetId}
                            className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
                          >
                            <div className="flex items-center gap-5 min-w-0">
                              <div className="w-[104px] h-[78px] sm:w-[132px] sm:h-[92px] rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center overflow-hidden shrink-0">
                                {asset.imageUrl ? (
                                  <img
                                    src={asset.imageUrl}
                                    alt={title}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <Box
                                    className="w-7 h-7 text-[#94A3B8]"
                                    strokeWidth={1.5}
                                    aria-hidden="true"
                                  />
                                )}
                              </div>

                              <div className="min-w-0">
                                <h2 className="text-[17px] font-semibold text-[#0F172A] leading-snug truncate">
                                  {title}
                                </h2>
                                <p className="mt-1 text-[12px] text-[#64748B]">
                                  SN: {asset.serialNumber || "—"}
                                </p>
                                <p className="mt-1 text-[12px] text-[#64748B]">
                                  Assigned: {formatOrdinalDate(asset.assignedAt)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 shrink-0">
                              <ConditionBadge asset={asset} />

                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/employee/assets/${asset.id}/feedback`,
                                    { state: { asset } },
                                  )
                                }
                                className="h-[38px] px-4 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[13px] font-medium text-[#0F172A] inline-flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30"
                              >
                                <span>View Details</span>
                                <ChevronRight
                                  className="w-4 h-4"
                                  strokeWidth={1.75}
                                />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default EmployeeAssets;