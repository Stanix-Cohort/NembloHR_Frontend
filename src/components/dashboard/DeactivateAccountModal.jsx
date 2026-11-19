import { useEffect } from "react";
import { LoaderCircle, UserX, X } from "lucide-react";

function DeactivateAccountModal({
  isOpen,
  employee,
  isSubmitting = false,
  error = "",
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSubmitting && onCancel) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="deactivate-account-title"
      className="fixed inset-0 z-50 bg-white/60 flex items-center justify-center p-4"
      onClick={() => {
        if (!isSubmitting && onCancel) onCancel();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[480px] bg-white border border-[#E2E8F0] rounded-[16px] px-7 py-8 sm:px-9 sm:py-9 shadow-[0_8px_30px_rgba(15,23,42,0.08)]"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-1 text-[#0F172A] hover:text-[#475569] rounded-[6px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30 disabled:opacity-50"
        >
          <X className="w-5 h-5" strokeWidth={1.75} />
        </button>

        {/* Red Icon Badge */}
        <div className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center mx-auto">
          <UserX
            className="w-5 h-5 text-[#DC2626]"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </div>

        {/* Heading & Description */}
        <h2
          id="deactivate-account-title"
          className="mt-4 text-[24px] sm:text-[26px] font-bold text-[#0F172A] text-center tracking-[-0.015em]"
        >
          Deactivate Account?
        </h2>

        <p className="mt-2.5 text-[14px] leading-[1.5] text-[#475569] text-center">
          This action will deactivate the employee’s account.
          <br />
          They will no longer be able to access the system.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-[8px] bg-red-50 border border-red-200 px-3.5 py-2.5 text-[13px] text-red-700 text-center"
          >
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onConfirm && onConfirm(employee)}
            className="h-[44px] rounded-[8px] bg-[#B91C1C] hover:bg-[#991B1B] active:bg-[#7F1D1D] text-white text-[14px] font-medium inline-flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B91C1C]/40 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting && <LoaderCircle className="w-4 h-4 animate-spin" />}
            <span>{isSubmitting ? "Deactivating..." : "Deactivate Account"}</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="h-[44px] rounded-[8px] border border-[#B91C1C] bg-white hover:bg-[#FEF2F2] text-[#B91C1C] text-[14px] font-medium cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B91C1C]/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeactivateAccountModal;