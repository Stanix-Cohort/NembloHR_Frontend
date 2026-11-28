import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronUp,
  Copy,
  LoaderCircle,
  UserCheck,
} from "lucide-react";

import Sidebar from "../layouts/Sidebar";
import DashboardHeader from "../layouts/DashboardHeader";
import { useAuth } from "../context/auth-context";
import { getAssetById, getAssetFeedback } from "../services/assetService";
import { getApiErrorMessage } from "../utils/apiError";

const CONDITION_LABELS = {
  NEW: "New",
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
  DAMAGED: "Damaged",
};

const INITIAL_VISIBLE_FEEDBACK = 3;

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

function formatDateTime(dateString) {
  if (!dateString) return "—";
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return "—";

  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);

  return `${datePart} · ${timePart}`;
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
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

function FeedbackConditionPill({ condition }) {
  const normalized = String(condition || "").toUpperCase();
  const isPositive =
    normalized === "NEW" ||
    normalized === "EXCELLENT" ||
    normalized === "GOOD";

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[68px] px-3 py-1 rounded-[6px] text-[12px] font-medium whitespace-nowrap ${
        isPositive
          ? "bg-[#DCFCE7] text-[#15803D]"
          : "bg-[#FEE2E2] text-[#B91C1C]"
      }`}
    >
      {formatCondition(condition)}
    </span>
  );
}

function AssetDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [asset, setAsset] = useState(() => location.state?.asset || null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [isLoading, setIsLoading] = useState(
    () => !location.state?.asset && Boolean(id),
  );
  const [loadError, setLoadError] = useState("");
  const [showAllFeedback, setShowAllFeedback] = useState(false);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    Promise.allSettled([getAssetById(id), getAssetFeedback()])
      .then(([assetResult, feedbackResult]) => {
        if (!isMounted) return;

        let resolvedAsset = location.state?.asset || null;

        if (assetResult.status === "fulfilled" && assetResult.value) {
          resolvedAsset = assetResult.value;
          setAsset(resolvedAsset);
          setLoadError("");
        } else if (!resolvedAsset) {
          setLoadError(
            getApiErrorMessage(
              assetResult.reason,
              "Unable to load asset details.",
            ),
          );
        }

        const embeddedFeedback =
          resolvedAsset?.feedbacks ??
          resolvedAsset?.feedbackHistory ??
          resolvedAsset?.feedback;

        let resolvedFeedback = Array.isArray(embeddedFeedback)
          ? embeddedFeedback
          : [];

        if (
          resolvedFeedback.length === 0 &&
          feedbackResult.status === "fulfilled" &&
          Array.isArray(feedbackResult.value)
        ) {
          const targetCuid = resolvedAsset?.id || id;
          const targetCode = resolvedAsset?.assetId;

          resolvedFeedback = feedbackResult.value.filter((item) => {
            if (!item) return false;
            if (!item.assetId && !item.asset?.id && !item.asset?.assetId) {
              return false;
            }

            return (
              item.assetId === targetCuid ||
              item.asset?.id === targetCuid ||
              (targetCode &&
                (item.assetId === targetCode ||
                  item.asset?.assetId === targetCode))
            );
          });
        }

        const sorted = [...resolvedFeedback].sort((a, b) => {
          const timeA = new Date(a?.createdAt || 0).getTime();
          const timeB = new Date(b?.createdAt || 0).getTime();
          return timeB - timeA;
        });

        setFeedbackList(sorted);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

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
    if (item.id === "employees" || item.id === "assets") {
      navigate(item.path);
    }
  };

  const handleEdit = () => {
    // TODO: Navigate to /admin/assets/:id/edit once Edit Asset page is added
    toast.info("Edit Asset screen is not added yet.");
  };

  const normalizedStatus = String(asset?.status || "").toUpperCase();
  const isAvailable = normalizedStatus === "AVAILABLE";
  const isAssigned = normalizedStatus === "ASSIGNED";

  const assignedName =
    asset?.assignedTo?.fullName ||
    asset?.currentAssignment?.employee?.fullName ||
    asset?.assignedEmployee?.fullName ||
    asset?.employee?.fullName ||
    asset?.assignedToName ||
    "";

  const visibleFeedback = showAllFeedback
    ? feedbackList
    : feedbackList.slice(0, INITIAL_VISIBLE_FEEDBACK);

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
            { label: "Asset Details" },
          ]}
          user={user}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-9 lg:py-7">
          <div className="w-full">
            {/* Page Title & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-[28px] sm:text-[32px] font-bold tracking-[-0.02em] text-[#0F172A] leading-tight">
                Asset Details
              </h1>

              {!isLoading && !loadError && asset && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="h-[40px] px-8 rounded-[8px] bg-[#1E3247] hover:bg-[#162638] active:bg-[#101D2B] text-white text-[13px] font-medium cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/40"
                  >
                    Edit
                  </button>

                  {isAvailable && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/admin/assets/${asset.id}/assign`, {
                          state: { asset },
                        })
                      }
                      className="h-[40px] px-7 rounded-[8px] border border-[#94A3B8] bg-white hover:bg-[#F8FAFC] text-[#1E293B] text-[13px] font-medium cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30"
                    >
                      Assign
                    </button>
                  )}

                  {isAssigned && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/admin/assets/${asset.id}/retrieve`, {
                          state: { asset },
                        })
                      }
                      className="h-[40px] px-7 rounded-[8px] border border-[#94A3B8] bg-white hover:bg-[#F8FAFC] text-[#1E293B] text-[13px] font-medium cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30"
                    >
                      Retrieve
                    </button>
                  )}
                </div>
              )}
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
                <>
                  {/* Asset Details Card */}
                  <section
                    aria-label="Asset Summary"
                    className="bg-white border border-[#E2E8F0] rounded-[12px] p-6 sm:p-8"
                  >
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
                      </div>
                    </div>

                    {/* Metadata Rows */}
                    <div className="mt-6 space-y-3 text-[13px]">
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
                  </section>

                  {/* Feedback History Section */}
                  <section aria-label="Feedback History" className="mt-7">
                    <h2 className="text-[18px] font-bold text-[#0F172A] leading-snug">
                      Feedback History
                    </h2>

                    {feedbackList.length === 0 ? (
                      <div className="mt-4 bg-white border border-[#E2E8F0] rounded-[12px] px-5 py-10 text-center">
                        <p className="text-[13px] text-[#64748B]">
                          No feedback submitted for this asset yet.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="mt-4 space-y-3">
                          {visibleFeedback.map((item, index) => {
                            const authorName =
                              item.employee?.fullName ||
                              item.submittedBy?.fullName ||
                              item.author?.fullName ||
                              item.user?.fullName ||
                              item.employeeName ||
                              "Employee";
                            const comment =
                              item.comment ||
                              item.feedback ||
                              item.notes ||
                              item.message ||
                              item.description ||
                              "—";

                            return (
                              <div
                                key={item.id || index}
                                className="bg-white border border-[#E2E8F0] rounded-[12px] px-5 py-4"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-full bg-[#DCE1E7] text-[#334155] text-[12px] font-semibold flex items-center justify-center shrink-0">
                                      {getInitials(authorName)}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-[14px] font-semibold text-[#0F172A] truncate">
                                        {authorName}
                                      </p>
                                      <p className="text-[11px] text-[#64748B] mt-0.5">
                                        {formatDateTime(item.createdAt)}
                                      </p>
                                    </div>
                                  </div>

                                  {item.condition && (
                                    <FeedbackConditionPill
                                      condition={item.condition}
                                    />
                                  )}
                                </div>

                                <p className="mt-3 text-[13px] text-[#1E293B] leading-relaxed">
                                  {comment}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        {feedbackList.length > INITIAL_VISIBLE_FEEDBACK && (
                          <div className="mt-4 flex justify-center">
                            <button
                              type="button"
                              onClick={() =>
                                setShowAllFeedback((prev) => !prev)
                              }
                              className="inline-flex flex-col items-center gap-0.5 text-[13px] font-medium text-[#0284C7] hover:text-[#0369A1] cursor-pointer focus:outline-none focus-visible:underline"
                            >
                              <span>
                                {showAllFeedback ? "Show Less" : "Show More"}
                              </span>
                              {showAllFeedback ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </section>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AssetDetails;