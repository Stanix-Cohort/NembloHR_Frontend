import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import Sidebar from "../layouts/Sidebar";
import DashboardHeader from "../layouts/DashboardHeader";
import AssetStatCards from "../components/assets/AssetStatCards";
import AssetFilters from "../components/assets/AssetFilters";
import AdminAssetsEmptyState from "../components/assets/AdminAssetsEmptyState";
import { useAuth } from "../context/auth-context";

function AdminAssets() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("");

  const hasActiveFilters = Boolean(searchQuery.trim() || status);

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatus("");
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
                totalCount={0}
                availableCount={0}
                assignedCount={0}
                underRepairCount={0}
                retiredCount={0}
              />
            </div>

            {/* Search & Filter Row */}
            <div className="mt-5">
              <AssetFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                status={status}
                onStatusChange={setStatus}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Empty / Filtered State */}
            <div className="mt-6">
              {hasActiveFilters ? (
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
                <AdminAssetsEmptyState onAddAsset={handleAddAsset} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminAssets;