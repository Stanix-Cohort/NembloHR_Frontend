import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

function AssetRetrievedModal({ isOpen, onBackToAssets }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && onBackToAssets) {
        onBackToAssets();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onBackToAssets]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="asset-retrieved-title"
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onBackToAssets}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[460px] bg-white border border-[#E2E8F0] rounded-[14px] p-7 sm:p-9 shadow-sm text-center"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onBackToAssets}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-1 text-[#0F172A] hover:text-[#475569] rounded-[6px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30"
        >
          <X className="w-5 h-5" strokeWidth={1.75} />
        </button>

        {/* Success Icon */}
        <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center mx-auto">
          <CheckCircle2
            className="w-7 h-7 text-[#16A34A]"
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>

        {/* Heading & Subtitle */}
        <h2
          id="asset-retrieved-title"
          className="mt-4 text-[22px] sm:text-[24px] font-bold text-[#0F172A] tracking-[-0.01em]"
        >
          Asset Retrieved Successfully!
        </h2>

        <p className="mt-2 text-[13px] leading-[1.55] text-[#475569] max-w-[330px] mx-auto">
          Asset was returned successfully. Go back to assets to assign available
          assets.
        </p>

        {/* Action */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onBackToAssets}
            className="h-[42px] min-w-[180px] px-8 rounded-[8px] bg-[#1E3247] hover:bg-[#162638] active:bg-[#101D2B] text-white text-[13px] font-medium cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/40"
          >
            Back to Assets
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssetRetrievedModal;