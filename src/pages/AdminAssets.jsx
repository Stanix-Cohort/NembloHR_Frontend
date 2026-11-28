import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoaderCircle, Plus } from "lucide-react";
import Sidebar from "../layouts/Sidebar";
import DashboardHeader from "../layouts/DashboardHeader";
import AssetStatCards from "../components/assets/AssetStatCards";
import AssetFilters from "../components/assets/AssetFilters";
import AdminAssetsEmptyState from "../components/assets/AdminAssetsEmptyState";
import AssetTable from "../components/assets/AssetTable";
import { useAuth } from "../context/auth-context";
import { getAssets } from "../services/assetService";
import { getApiErrorMessage } from "../utils/apiError";

const PAGE_SIZE = 7;

function AdminAssets() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    getAssets()
      .then((list) => {
        if (!isMounted) return;
        setAssets(Array.isArray(list) ? list : []);
        setError("");
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(getApiErrorMessage(err, "Unable to load assets."));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const counts = useMemo(() => {
    const next = {
      total: assets.length,
      available: 0,
      assigned: 0,
      underRepair: 0,
      retired: 0,
    };

    for (const asset of assets) {
      const normalized = String(asset.status || "").toUpperCase();
      if (normalized === "AVAILABLE") next.available += 1;
      else if (normalized === "ASSIGNED") next.assigned += 1;
      else if (normalized === "UNDER_REPAIR") next.underRepair += 1;
      else if (normalized === "RETIRED") next.retired += 1;
    }

    return next;
  }, [assets]);

  const filteredAssets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return assets.filter((asset) => {
      if (status && String(asset.status || "").toUpperCase() !== status) {
        return false;
      }

      if (!query) return true;

      const searchable = [
        asset.assetId,
        asset.name,
        asset.type,
        asset.serialNumber,
        asset.assignedTo?.fullName,
        asset.assignedEmployee?.fullName,
        asset.employee?.fullName,
        asset.assignedToName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [assets, searchQuery, status]);

  const hasActiveFilters = Boolean(searchQuery.trim() || status);

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatus("");
    setCurrentPage(1);
  };

  const handleAddAsset = () => {
    navigate("/admin/assets/new");
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
          sectionLabel="Assets"
          user={user}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-9 lg:py-7">
          <div className="w-full">
            {/* Page Title & Action Button */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-[28px] sm:text-[32px] font-bold tracking-[-0.02em] text-[#0F172A] leading-tight">
                  Assets
                </h1>
                <p className="mt-1 text-[13px] font-normal text-[#64748B]">
                  Manage and track your organisation’s assets.
                </p>
              </div>

              <div className="sm:pt-1">
                <button
                  type="button"
                  onClick={handleAddAsset}
                  className="h-[42px] px-5 rounded-[10px] bg-[#1E3247] hover:bg-[#162638] active:bg-[#101D2B] text-white text-[13px] font-medium inline-flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/40"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  <span>Add Asset</span>
                </button>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="mt-6">
              <AssetStatCards
                totalCount={counts.total}
                availableCount={counts.available}
                assignedCount={counts.assigned}
                underRepairCount={counts.underRepair}
                retiredCount={counts.retired}
              />
            </div>

            {/* Search & Filter Row */}
            <div className="mt-5">
              <AssetFilters
                searchQuery={searchQuery}
                onSearchChange={(val) => {
                  setSearchQuery(val);
                  setCurrentPage(1);
                }}
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
                  <p className="text-[13px]">Loading assets...</p>
                </div>
              ) : assets.length === 0 && !hasActiveFilters ? (
                <AdminAssetsEmptyState onAddAsset={handleAddAsset} />
              ) : filteredAssets.length === 0 ? (
                <div className="bg-white border border-[#E2E8F0] rounded-[12px] py-16 px-6 text-center">
                  <p className="text-[16px] font-semibold text-[#0F172A]">
                    No matching assets found
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
                <AssetTable
                  assets={filteredAssets}
                  totalItems={filteredAssets.length}
                  currentPage={currentPage}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCurrentPage}
                  onViewAsset={(asset) =>
                    navigate(`/admin/assets/${asset.id}`, {
                      state: { asset },
                    })
                  }
                  onAssignAsset={(asset) =>
                    navigate(`/admin/assets/${asset.id}/assign`, {
                      state: { asset },
                    })
                  }
                  onUnassignAsset={(asset) =>
                    navigate(`/admin/assets/${asset.id}/retrieve`, {
                      state: { asset },
                    })
                  }
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminAssets;