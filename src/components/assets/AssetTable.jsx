import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Pencil,
  UserCheck,
} from "lucide-react";

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

function AssetStatusBadge({ status }) {
  const normalized = String(status || "AVAILABLE")
    .toUpperCase()
    .replace(/\s+/g, "_");

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

function AssetTable({
  assets = [],
  totalItems = 0,
  currentPage = 1,
  pageSize = 7,
  onPageChange,
  onViewAsset,
  onEditAsset,
  onAssignAsset,
  onUnassignAsset,
}) {
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!openMenu) return;

    const handleOutsideClick = (event) => {
      const clickedInsideMenu = menuRef.current?.contains(event.target);
      const clickedTrigger = event.target.closest("[data-asset-action-trigger]");
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

  const handleToggleMenu = (event, asset) => {
    if (openMenu?.asset?.id === asset.id) {
      setOpenMenu(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const openUpward = window.innerHeight - rect.bottom < 150;

    setOpenMenu({
      asset,
      top: openUpward ? rect.top - 6 : rect.bottom + 6,
      right: window.innerWidth - rect.right,
      openUpward,
    });
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);
  const pages = buildPageNumbers(safePage, totalPages);

  const visibleAssets =
    assets.length > pageSize
      ? assets.slice((safePage - 1) * pageSize, safePage * pageSize)
      : assets;

  const activeMenuAsset = openMenu?.asset;
  const activeMenuStatus = String(
    activeMenuAsset?.status || "AVAILABLE",
  ).toUpperCase();
  const isAssignedAsset = activeMenuStatus === "ASSIGNED";
  const isAvailableAsset = activeMenuStatus === "AVAILABLE";

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[820px]">
          <thead>
            <tr className="text-left text-[13px] font-semibold text-[#1E293B]">
              <th className="py-3.5 px-4">Asset ID</th>
              <th className="py-3.5 px-4">Asset Type</th>
              <th className="py-3.5 px-4">Serial Number</th>
              <th className="py-3.5 px-4">Condition</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Assigned To</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {visibleAssets.map((asset, index) => {
              const assetCode = asset.assetId || asset.assetCode || "—";
              const assetType =
                asset.type || asset.assetType?.name || asset.assetType || "—";
              const serialNumber = asset.serialNumber || "—";
              const condition = formatCondition(asset.condition);
              const assignedName =
                asset.assignedTo?.fullName ||
                asset.currentAssignment?.employee?.fullName ||
                asset.assignedEmployee?.fullName ||
                asset.employee?.fullName ||
                asset.assignedToName ||
                "";
              const isMenuOpen = activeMenuAsset?.id === asset.id;

              return (
                <tr
                  key={asset.id || assetCode}
                  className={index % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}
                >
                  <td className="py-3.5 px-4 text-[14px] font-medium text-[#0F172A] whitespace-nowrap">
                    {assetCode}
                  </td>

                  <td className="py-3.5 px-4 text-[13px] text-[#334155]">
                    {assetType}
                  </td>

                  <td className="py-3.5 px-4 text-[13px] text-[#334155]">
                    {serialNumber}
                  </td>

                  <td className="py-3.5 px-4 text-[13px] text-[#334155]">
                    {condition}
                  </td>

                  <td className="py-3.5 px-4">
                    <AssetStatusBadge status={asset.status} />
                  </td>

                  <td className="py-3.5 px-4 text-[13px] whitespace-nowrap">
                    {assignedName ? (
                      <span className="text-[#0F172A]">{assignedName}</span>
                    ) : (
                      <span className="text-[#94A3B8]">unassigned</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      data-asset-action-trigger="true"
                      onClick={(e) => handleToggleMenu(e, asset)}
                      aria-label={`Actions for ${assetCode}`}
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

      {/* Action Dropdown Menu */}
      {openMenu && (
        <div
          ref={menuRef}
          style={{ top: openMenu.top, right: openMenu.right }}
          className={`fixed z-50 w-52 bg-white border border-[#E2E8F0] rounded-[10px] shadow-md py-1.5 text-left ${
            openMenu.openUpward ? "-translate-y-full" : ""
          }`}
        >
          <button
            type="button"
            onClick={() => {
              const target = activeMenuAsset;
              setOpenMenu(null);
              if (onViewAsset) onViewAsset(target);
            }}
            className="w-full px-3.5 py-2 text-[13px] text-[#1E293B] hover:bg-[#F8FAFC] flex items-center gap-2.5 cursor-pointer"
          >
            <Eye className="w-4 h-4" strokeWidth={1.75} />
            <span>View Details</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const target = activeMenuAsset;
              setOpenMenu(null);
              if (onEditAsset) onEditAsset(target);
            }}
            className="w-full px-3.5 py-2 text-[13px] text-[#1E293B] hover:bg-[#F8FAFC] flex items-center gap-2.5 cursor-pointer"
          >
            <Pencil className="w-4 h-4" strokeWidth={1.75} />
            <span>Edit Asset</span>
          </button>

          {isAvailableAsset && (
            <button
              type="button"
              onClick={() => {
                const target = activeMenuAsset;
                setOpenMenu(null);
                if (onAssignAsset) onAssignAsset(target);
              }}
              className="w-full px-3.5 py-2 text-[13px] text-[#1E293B] hover:bg-[#F8FAFC] flex items-center gap-2.5 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" strokeWidth={1.75} />
              <span>Assign Employee</span>
            </button>
          )}

          {isAssignedAsset && (
            <button
              type="button"
              onClick={() => {
                const target = activeMenuAsset;
                setOpenMenu(null);
                if (onUnassignAsset) onUnassignAsset(target);
              }}
              className="w-full px-3.5 py-2 text-[13px] text-[#1E293B] hover:bg-[#F8FAFC] flex items-center gap-2.5 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" strokeWidth={1.75} />
              <span>Retrieve/Unassign</span>
            </button>
          )}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-[13px] text-[#475569]">
          Showing {startItem}-{endItem} of {totalItems} items
        </p>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => onPageChange && onPageChange(safePage - 1)}
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
                  page === safePage
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
            disabled={safePage >= totalPages}
            onClick={() => onPageChange && onPageChange(safePage + 1)}
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

export default AssetTable;