import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, LoaderCircle } from "lucide-react";

import Sidebar from "../layouts/Sidebar";
import DashboardHeader from "../layouts/DashboardHeader";
import EditAssetForm from "../components/assets/EditAssetForm";
import AddAssetTypeModal from "../components/assets/AddAssetTypeModal";
import AssetEditedModal from "../components/assets/AssetEditedModal";
import { useAuth } from "../context/auth-context";
import { getAssetById, getAssets, updateAsset } from "../services/assetService";
import { getApiErrorMessage } from "../utils/apiError";

function buildAssetTypeOptions(list = [], currentType = "") {
  const names = [
    ...list.map((item) => item?.type?.trim()).filter(Boolean),
    ...(currentType?.trim() ? [currentType.trim()] : []),
  ];

  const unique = [
    ...new Map(names.map((name) => [name.toLowerCase(), name])).values(),
  ];

  return unique.map((name) => ({
    id: `existing-${encodeURIComponent(name.toLowerCase())}`,
    name,
  }));
}

function findMatchingTypeId(options, typeName) {
  if (!typeName?.trim()) return "";
  const match = options.find(
    (opt) => opt.name.toLowerCase() === typeName.trim().toLowerCase(),
  );
  return match?.id || "";
}

function EditAsset() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [asset, setAsset] = useState(() => location.state?.asset || null);
  const [isLoading, setIsLoading] = useState(
    () => !location.state?.asset && Boolean(id),
  );
  const [loadError, setLoadError] = useState("");

  const [assetTypes, setAssetTypes] = useState(() =>
    buildAssetTypeOptions([], location.state?.asset?.type),
  );
  const [selectedAssetTypeId, setSelectedAssetTypeId] = useState(() =>
    findMatchingTypeId(
      buildAssetTypeOptions([], location.state?.asset?.type),
      location.state?.asset?.type,
    ),
  );
  const [isAddTypeOpen, setIsAddTypeOpen] = useState(false);
  const [typeError, setTypeError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isEdited, setIsEdited] = useState(false);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    Promise.allSettled([getAssetById(id), getAssets()]).then(
      ([singleResult, listResult]) => {
        if (!isMounted) return;

        let resolvedAsset = location.state?.asset || null;

        if (singleResult.status === "fulfilled" && singleResult.value) {
          resolvedAsset = singleResult.value;
          setAsset(resolvedAsset);
          setLoadError("");
        } else if (!resolvedAsset) {
          setLoadError(
            getApiErrorMessage(
              singleResult.reason,
              "Unable to load asset details.",
            ),
          );
        }

        const list =
          listResult.status === "fulfilled" && Array.isArray(listResult.value)
            ? listResult.value
            : [];
        const options = buildAssetTypeOptions(list, resolvedAsset?.type);
        setAssetTypes(options);
        setSelectedAssetTypeId((prev) =>
          prev || findMatchingTypeId(options, resolvedAsset?.type),
        );
        setIsLoading(false);
      },
    );

    return () => {
      isMounted = false;
    };
  }, [id, location.state]);

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
    const normalised = typeName.trim();
    if (!normalised) {
      setTypeError("Asset type name is required.");
      return false;
    }

    if (normalised.length > 100) {
      setTypeError("Asset type cannot exceed 100 characters.");
      return false;
    }

    const duplicate = assetTypes.find(
      (type) => type.name.toLowerCase() === normalised.toLowerCase(),
    );

    if (duplicate) {
      setTypeError("This asset type already exists.");
      return false;
    }

    const newType = {
      id: `local-${Date.now()}`,
      name: normalised,
    };

    setAssetTypes((previous) => [...previous, newType]);
    setSelectedAssetTypeId(newType.id);
    setTypeError("");
    setIsAddTypeOpen(false);
    return true;
  };

const handleSaveChanges = async (payload) => {
    if (Object.keys(payload).length === 0) {
      navigate("/admin/assets");
      return;
    }

    setSaveError("");
    setIsSubmitting(true);

    try {
      await updateAsset(asset?.id || id, payload);
      setIsEdited(true);
    } catch (err) {
      setSaveError(
        getApiErrorMessage(
          err,
          "Unable to update asset. Please check your input and try again.",
        ),
      );
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
            { label: "Edit Asset Details" },
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
                  Edit Asset Details
                </h1>
                <p className="mt-1 text-[13px] font-normal text-[#64748B]">
                  Edit company’s asset details.
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
              {isLoading ? (
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
                <EditAssetForm
                  key={asset?.id || id}
                  asset={asset}
                  assetTypes={assetTypes}
                  selectedAssetTypeId={selectedAssetTypeId}
                  onAssetTypeChange={setSelectedAssetTypeId}
                  onAddNewAssetType={() => {
                    setTypeError("");
                    setIsAddTypeOpen(true);
                  }}
                  isSubmitting={isSubmitting}
                  serverError={saveError}
                  onCancel={handleBack}
                  onSubmit={handleSaveChanges}
                />
              )}
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

      <AssetEditedModal
        isOpen={isEdited}
        onBackToAssets={() => navigate("/admin/assets", { replace: true })}
      />
    </div>
  );
}

export default EditAsset;