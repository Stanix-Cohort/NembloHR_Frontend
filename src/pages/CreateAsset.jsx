import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Sidebar from "../layouts/Sidebar";
import DashboardHeader from "../layouts/DashboardHeader";
import CreateAssetForm from "../components/assets/CreateAssetForm";
import AddAssetTypeModal from "../components/assets/AddAssetTypeModal";
import { useAuth } from "../context/auth-context";
import { getEmployees } from "../services/employeeService";

function CreateAsset() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [assetTypes, setAssetTypes] = useState([]);
  const [selectedAssetTypeId, setSelectedAssetTypeId] = useState("");
  const [isAddTypeOpen, setIsAddTypeOpen] = useState(false);
  const [typeError, setTypeError] = useState("");

  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);

  const [statusNotice, setStatusNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    getEmployees({ page: 1, limit: 100 })
      .then((data) => {
        if (!isMounted) return;
        const list = Array.isArray(data)
          ? data
          : data?.employees ?? data?.items ?? data?.records ?? [];
        setEmployees(list);
      })
      .catch(() => {
        // Employee dropdown remains gracefully empty if request fails
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

  const handleSaveAssetType = async (typeName) => {
    const duplicate = assetTypes.find(
      (type) => type.name.toLowerCase() === typeName.toLowerCase(),
    );

    if (duplicate) {
      setTypeError("This asset type already exists.");
      return false;
    }

    // TODO: Wire to POST asset-types endpoint once backend is ready
    const newType = {
      id: `local-${Date.now()}`,
      name: typeName,
    };

    setAssetTypes((prev) => [...prev, newType]);
    setSelectedAssetTypeId(newType.id);
    setTypeError("");
    setIsAddTypeOpen(false);
    return true;
  };

  const handleCreateSubmit = async (payload) => {
    // TODO: Wire to POST /assets once backend endpoint is ready
    console.log("Asset payload ready for backend:", payload);
    setStatusNotice(
      "Form validated. Asset creation will be saved once the backend Assets API is available.",
    );
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
          breadcrumbs={[
            { label: "Admin" },
            { label: "Assets", onClick: handleBack },
            { label: "Add New Asset" },
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
                  Add New Asset
                </h1>
                <p className="mt-1 text-[13px] font-normal text-[#64748B]">
                  Register a new company asset.
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

            {/* Form Card */}
            <div className="mt-6">
              <CreateAssetForm
                assetTypes={assetTypes}
                selectedAssetTypeId={selectedAssetTypeId}
                onAssetTypeChange={setSelectedAssetTypeId}
                onAddNewAssetType={() => {
                  setTypeError("");
                  setIsAddTypeOpen(true);
                }}
                employees={employees}
                employeesLoading={employeesLoading}
                statusNotice={statusNotice}
                onCancel={handleBack}
                onSubmit={handleCreateSubmit}
              />
            </div>
          </div>
        </main>
      </div>

      <AddAssetTypeModal
        isOpen={isAddTypeOpen}
        serverError={typeError}
        onClose={() => setIsAddTypeOpen(false)}
        onSave={handleSaveAssetType}
      />
    </div>
  );
}

export default CreateAsset;