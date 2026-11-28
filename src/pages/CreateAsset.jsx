import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";

import Sidebar from "../layouts/Sidebar";
import DashboardHeader from "../layouts/DashboardHeader";
import CreateAssetForm from "../components/assets/CreateAssetForm";
import AddAssetTypeModal from "../components/assets/AddAssetTypeModal";
import { useAuth } from "../context/auth-context";
import { createAsset, getAssets } from "../services/assetService";

function CreateAsset() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [assetTypes, setAssetTypes] = useState([]);
  const [selectedAssetTypeId, setSelectedAssetTypeId] = useState("");
  const [isAddTypeOpen, setIsAddTypeOpen] = useState(false);
  const [typeError, setTypeError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Asset types are stored as strings on Asset records.
  // Load existing assets and derive available types from their records.
  useEffect(() => {
    let isMounted = true;

    const loadAssetTypes = async () => {
      try {
        const assets = await getAssets();

        if (!isMounted) return;

        const uniqueTypes = [
          ...new Map(
            assets
              .map((asset) => asset?.type?.trim())
              .filter(Boolean)
              .map((name) => [name.toLowerCase(), name]),
          ).values(),
        ];

        setAssetTypes(
          uniqueTypes.map((name) => ({
            id: `existing-${encodeURIComponent(name.toLowerCase())}`,
            name,
          })),
        );
      } catch (error) {
        if (!isMounted) return;

        console.error("Unable to load existing asset types:", error);
      }
    };

    loadAssetTypes();

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
    if (item.id === "dashboard" || item.id === "employees" || item.id === "assets") {
      navigate(item.path);
    }
  };

  const handleSaveAssetType = async (typeName) => {
    const normalisedTypeName = typeName.trim();

    if (!normalisedTypeName) {
      setTypeError("Asset type name is required.");
      return false;
    }

    if (normalisedTypeName.length > 100) {
      setTypeError("Asset type cannot exceed 100 characters.");
      return false;
    }

    const duplicate = assetTypes.find(
      (type) => type.name.toLowerCase() === normalisedTypeName.toLowerCase(),
    );

    if (duplicate) {
      setTypeError("This asset type already exists.");
      return false;
    }

    // This temporary ID is only for frontend selection.
    // The actual type name is sent to the backend during asset creation.
    const newType = {
      id: `local-${Date.now()}`,
      name: normalisedTypeName,
    };

    setAssetTypes((previous) => [...previous, newType]);
    setSelectedAssetTypeId(newType.id);
    setTypeError("");
    setIsAddTypeOpen(false);

    return true;
  };

  const handleCreateSubmit = async (payload, { resetForm } = {}) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Resolve the selected frontend type ID to its actual name.
      const selectedType = assetTypes.find(
        (type) => type.id === selectedAssetTypeId,
      );

      if (!selectedType) {
        throw new Error("Please select a valid asset type.");
      }

      // The backend expects a string for "type", not the frontend ID.
      const assetPayload = {
        ...payload,
        type: selectedType.name,
      };

      await createAsset(assetPayload);

      toast.success("Asset created successfully.");

      resetForm?.();
      setSelectedAssetTypeId("");
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        "Unable to create asset. Please try again.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
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

            <div className="mt-6">
              <CreateAssetForm
                assetTypes={assetTypes}
                selectedAssetTypeId={selectedAssetTypeId}
                onAssetTypeChange={setSelectedAssetTypeId}
                onAddNewAssetType={() => {
                  setTypeError("");
                  setIsAddTypeOpen(true);
                }}
                isSubmitting={isSubmitting}
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
