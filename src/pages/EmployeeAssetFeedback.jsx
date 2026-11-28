import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Box, Check, ChevronDown, ChevronLeft, LoaderCircle } from "lucide-react";

import Sidebar from "../layouts/Sidebar";
import DashboardHeader from "../layouts/DashboardHeader";
import { EMPLOYEE_NAV_ITEMS } from "../constants/employeeNav";
import { useAuth } from "../context/auth-context";
import { getMyAssets, submitAssetFeedback } from "../services/assetService";import { getApiErrorMessage } from "../utils/apiError";

const CONDITION_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "POOR", label: "Poor" },
  { value: "DAMAGED", label: "Damaged" },
];

const GOOD_CONDITIONS = new Set(["NEW", "EXCELLENT", "GOOD"]);

function ConditionBadge({ asset }) {
  const condition = String(asset?.condition || "GOOD").toUpperCase();
  const isGood = !asset?.hasReportedIssue && GOOD_CONDITIONS.has(condition);

  if (isGood) {
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

function ConditionSelect({
  id = "feedback-condition",
  value = "",
  onChange,
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

  const selectedOption = CONDITION_OPTIONS.find((opt) => opt.value === value);

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={hasError}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-[46px] pl-4 pr-10 rounded-[8px] border bg-white text-[14px] text-left flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
          hasError
            ? "border-[#DC2626] focus:ring-[#DC2626]/20 focus:border-[#DC2626]"
            : "border-[#CBD5E1] focus:ring-[#1E3247]/20 focus:border-[#1E3247]"
        } ${selectedOption ? "text-[#0F172A]" : "text-[#64748B]"}`}
      >
        <span className="truncate">
          {selectedOption?.label || "Select Condition"}
        </span>
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
            {CONDITION_OPTIONS.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange?.(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-[13px] text-left flex items-center justify-between cursor-pointer hover:bg-[#F8FAFC] ${
                    isSelected
                      ? "bg-[#F1F5F9] font-medium text-[#0F172A]"
                      : "text-[#0F172A]"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <Check
                      className="w-4 h-4 text-[#1E3247] shrink-0"
                      strokeWidth={2}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function EmployeeAssetFeedback() {
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

  const [condition, setCondition] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (asset || !id) return;

    let isMounted = true;

    getMyAssets()
      .then((list) => {
        if (!isMounted) return;
        const normalizedList = (Array.isArray(list) ? list : []).map(
          (item) => item.asset ?? item,
        );
        const found = normalizedList.find((item) => item.id === id);
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
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, asset]);

  const handleBack = () => {
    navigate("/employee/assets");
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = {};
    if (!condition) {
      nextErrors.condition = "Please select a condition.";
    }
    if (!comment.trim()) {
      nextErrors.comment = "Please enter a comment.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await submitAssetFeedback(asset?.id || id, {
        condition,
        comment: comment.trim(),
      });
      toast.success("Feedback submitted successfully.");
      navigate("/employee/assets", { replace: true });
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, "Unable to submit feedback. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
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
          breadcrumbs={[
            { label: "Employee" },
            { label: "My Assets", onClick: handleBack },
            { label: "Give Feedback" },
          ]}
          user={user}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-9 lg:py-7">
          <div className="w-full">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[28px] sm:text-[32px] font-bold tracking-[-0.02em] text-[#0F172A] leading-tight">
                  Give Feedback
                </h1>
                <p className="mt-1 text-[13px] font-normal text-[#64748B]">
                  Help us keep track of your assigned asset by sharing its
                  current condition.
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
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  aria-busy={isSubmitting}
                  className="bg-white border border-[#E2E8F0] rounded-[12px] p-6 sm:p-8"
                >
                  {/* Asset Header */}
                  <div className="pb-6 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-5 min-w-0">
                      <div className="w-[140px] h-[106px] sm:w-[160px] sm:h-[120px] rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center overflow-hidden shrink-0">
                        {asset?.imageUrl ? (
                          <img
                            src={asset.imageUrl}
                            alt={asset.name || asset.type || "Asset"}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Box
                            className="w-8 h-8 text-[#94A3B8]"
                            strokeWidth={1.5}
                            aria-hidden="true"
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-[20px] font-bold text-[#0F172A] leading-snug truncate">
                          {asset?.name || asset?.type || "Asset"}
                        </h2>
                        <p className="mt-1.5 text-[13px] text-[#475569]">
                          ASSET ID:{" "}
                          <span className="font-medium text-[#0F172A]">
                            {asset?.assetId || "—"}
                          </span>
                          {"  |  "}
                          SN:{" "}
                          <span className="font-medium text-[#0F172A]">
                            {asset?.serialNumber || "—"}
                          </span>
                          {"  |  "}
                          <span>{asset?.type || "—"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="self-start sm:self-center shrink-0">
                      <ConditionBadge asset={asset} />
                    </div>
                  </div>

                  {/* Condition */}
                  <div className="mt-6">
                    <label
                      htmlFor="feedback-condition"
                      className="block text-[14px] font-medium text-[#0F172A] mb-2"
                    >
                      Condition <span className="text-[#DC2626]">*</span>
                    </label>
                    <ConditionSelect
                      id="feedback-condition"
                      value={condition}
                      onChange={(val) => {
                        setCondition(val);
                        if (errors.condition) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.condition;
                            return next;
                          });
                        }
                      }}
                      disabled={isSubmitting}
                      hasError={Boolean(errors.condition)}
                    />
                    {errors.condition && (
                      <p className="mt-1.5 text-[12px] text-[#DC2626]">
                        {errors.condition}
                      </p>
                    )}
                  </div>

                  {/* Comment */}
                  <div className="mt-6">
                    <label
                      htmlFor="feedback-comment"
                      className="block text-[14px] font-medium text-[#0F172A] mb-2"
                    >
                      Comment <span className="text-[#DC2626]">*</span>
                    </label>
                    <textarea
                      id="feedback-comment"
                      name="comment"
                      rows={5}
                      value={comment}
                      onChange={(e) => {
                        setComment(e.target.value);
                        if (errors.comment) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.comment;
                            return next;
                          });
                        }
                      }}
                      placeholder="Please provide details about the asset's current condition."
                      disabled={isSubmitting}
                      aria-invalid={Boolean(errors.comment)}
                      className={`w-full min-h-[130px] px-4 py-3 rounded-[8px] border bg-white text-[14px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 resize-y disabled:opacity-60 disabled:cursor-not-allowed ${
                        errors.comment
                          ? "border-[#DC2626] focus:ring-[#DC2626]/20 focus:border-[#DC2626]"
                          : "border-[#CBD5E1] focus:ring-[#1E3247]/20 focus:border-[#1E3247]"
                      }`}
                    />
                    {errors.comment && (
                      <p className="mt-1.5 text-[12px] text-[#DC2626]">
                        {errors.comment}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-8 flex items-center justify-end gap-3.5">
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
                        {isSubmitting ? "Submitting..." : "Submit Feedback"}
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

export default EmployeeAssetFeedback;