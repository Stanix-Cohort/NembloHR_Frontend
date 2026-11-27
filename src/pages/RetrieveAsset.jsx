import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Briefcase,
  Calendar,
  ChevronLeft,
  LoaderCircle,
  UserCheck,
} from "lucide-react";

import Sidebar from "../layouts/Sidebar";
import DashboardHeader from "../layouts/DashboardHeader";
import AssetRetrievedModal from "../components/assets/AssetRetrievedModal";
import { useAuth } from "../context/auth-context";
import { getAssets, returnAsset } from "../services/assetService";
import { getApiErrorMessage } from "../utils/apiError";

function getTodayDisplayDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear());
  return `${day}/${month}/${year}`;
}

function toIsoDate(displayValue = "") {
  const match = displayValue.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return "";

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return "";
  }

  return `${match[3]}-${match[2]}-${match[1]}`;
}

function toDisplayDate(isoValue = "") {
  const match = isoValue.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function AssetStatusPill({ status }) {
  const normalized = String(status || "ASSIGNED").toUpperCase();

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

function RetrieveAsset() {
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

  const [returnDate, setReturnDate] = useState(() => getTodayDisplayDate());
  const [notes, setNotes] = useState("");
  const [dateError, setDateError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRetrieved, setIsRetrieved] = useState(false);

  const datePickerRef = useRef(null);

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

  const handleOpenDatePicker = () => {
    if (isSubmitting) return;
    if (datePickerRef.current?.showPicker) {
      datePickerRef.current.showPicker();
    } else {
      datePickerRef.current?.click();
    }
  };

const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const isoDate = toIsoDate(returnDate);
    if (!returnDate.trim()) {
      setDateError("Return date is required.");
      return;
    }

    if (!isoDate) {
      setDateError("Enter a valid date in DD/MM/YYYY format.");
      return;
    }

    setIsSubmitting(true);
    try {
      await returnAsset(asset?.id || id);
      setIsRetrieved(true);
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, "Unable to retrieve asset. Please try again."),
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
            { label: "Return Asset" },
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
                  Retrieve Asset
                </h1>
                <p className="mt-1 text-[13px] font-normal text-[#64748B]">
                  Mark this asset as returned or unassign it from the employee.
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
                  {/* Asset Summary */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">
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

                      <div className="mt-2.5 flex items-center gap-2 text-[13px]">
                        <UserCheck
                          className="w-4 h-4 text-[#475569] shrink-0"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                        <span className="text-[#475569]">Assigned To:</span>
                        <span className="font-medium text-[#0F172A]">
                          {assignedName || "Assigned Employee"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Return Date */}
                  <div className="mt-7 max-w-[340px]">
                    <label
                      htmlFor="returnDate"
                      className="block text-[14px] font-medium text-[#0F172A] mb-2"
                    >
                      Return Date <span className="text-[#DC2626]">*</span>
                    </label>

                    <div className="relative">
                      <input
                        id="returnDate"
                        name="returnDate"
                        type="text"
                        inputMode="numeric"
                        value={returnDate}
                        onChange={(e) => {
                          setReturnDate(e.target.value);
                          if (dateError) setDateError("");
                        }}
                        placeholder="DD/MM/YYYY"
                        disabled={isSubmitting}
                        aria-invalid={Boolean(dateError)}
                        className={`w-full h-[46px] pl-4 pr-11 rounded-[8px] border bg-white text-[14px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                          dateError
                            ? "border-[#DC2626] focus:ring-[#DC2626]/20 focus:border-[#DC2626]"
                            : "border-[#CBD5E1] focus:ring-[#1E3247]/20 focus:border-[#1E3247]"
                        }`}
                      />

                      <input
                        ref={datePickerRef}
                        type="date"
                        tabIndex={-1}
                        aria-hidden="true"
                        value={toIsoDate(returnDate)}
                        onChange={(e) => {
                          const formatted = toDisplayDate(e.target.value);
                          setReturnDate(formatted);
                          if (dateError) setDateError("");
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 opacity-0 pointer-events-none"
                      />

                      <button
                        type="button"
                        onClick={handleOpenDatePicker}
                        disabled={isSubmitting}
                        aria-label="Open calendar to pick return date"
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#0F172A] cursor-pointer focus:outline-none disabled:opacity-50"
                      >
                        <Calendar
                          className="w-[18px] h-[18px]"
                          strokeWidth={1.75}
                        />
                      </button>
                    </div>

                    {dateError && (
                      <p className="mt-1.5 text-[12px] text-[#DC2626]">
                        {dateError}
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="mt-6">
                    <label
                      htmlFor="retrieveNotes"
                      className="block text-[14px] font-medium text-[#0F172A] mb-2"
                    >
                      Notes
                    </label>
                    <textarea
                      id="retrieveNotes"
                      name="notes"
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add a note..."
                      disabled={isSubmitting}
                      className="w-full min-h-[110px] px-4 py-3 rounded-[8px] border border-[#CBD5E1] bg-white text-[14px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#1E3247]/20 focus:border-[#1E3247] resize-y disabled:opacity-60 disabled:cursor-not-allowed"
                    />
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
                        {isSubmitting ? "Retrieving..." : "Confirm Retrieve"}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>

      <AssetRetrievedModal
        isOpen={isRetrieved}
        onBackToAssets={() => navigate("/admin/assets", { replace: true })}
      />
    </div>
  );
}

export default RetrieveAsset;