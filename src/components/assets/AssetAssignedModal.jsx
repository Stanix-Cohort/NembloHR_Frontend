import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

function AssetAssignedModal({
  isOpen,
  employeeName,
  departmentName,
  assetId,
  assetType,
  onDone,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && onDone) {
        onDone();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onDone]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="asset-assigned-title"
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onDone}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[490px] bg-white border border-[#E2E8F0] rounded-[14px] p-7 sm:p-8 shadow-sm"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onDone}
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

        {/* Heading */}
        <h2
          id="asset-assigned-title"
          className="mt-4 text-[22px] sm:text-[24px] font-bold text-[#0F172A] text-center tracking-[-0.01em]"
        >
          Asset Assigned Successfully!
        </h2>

        {/* Employee Details Box */}
        <div className="mt-6 bg-[#F1F5F9]/80 rounded-[10px] p-4">
          <h3 className="text-[14px] font-bold text-[#0F172A]">
            Employee Details
          </h3>

          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[12px] text-[#475569]">Name</p>
              <p className="mt-1 text-[14px] font-medium text-[#0F172A] break-words">
                {employeeName || "—"}
              </p>
            </div>
            <div>
              <p className="text-[12px] text-[#475569]">Department</p>
              <p className="mt-1 text-[14px] font-medium text-[#0F172A] break-words">
                {departmentName || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Asset Details Box */}
        <div className="mt-3.5 bg-[#F1F5F9]/80 rounded-[10px] p-4">
          <h3 className="text-[14px] font-bold text-[#0F172A]">
            Asset Details
          </h3>

          <div className="mt-3 space-y-2 text-[13px]">
            <p className="text-[#475569]">
              Asset ID:{" "}
              <span className="font-medium text-[#0F172A]">
                {assetId || "—"}
              </span>
            </p>
            <p className="text-[#475569]">
              Asset Type:{" "}
              <span className="font-medium text-[#0F172A]">
                {assetType || "—"}
              </span>
            </p>
          </div>
        </div>

        {/* Done Action */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onDone}
            className="h-[42px] min-w-[180px] px-10 rounded-[8px] bg-[#1E3247] hover:bg-[#162638] active:bg-[#101D2B] text-white text-[13px] font-medium cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/40"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssetAssignedModal;