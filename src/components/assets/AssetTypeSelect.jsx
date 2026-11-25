import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";

function AssetTypeSelect({
  id = "assetType",
  value = "",
  onChange,
  assetTypes = [],
  disabled = false,
  hasError = false,
  onAddNewAssetType,
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

  const selectedType = assetTypes.find((type) => type.id === value);

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
        } ${selectedType ? "text-[#0F172A]" : "text-[#64748B]"}`}
      >
        <span className="truncate">
          {selectedType?.name || "Select asset type"}
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
          {assetTypes.length > 0 && (
            <div className="max-h-[220px] overflow-y-auto py-1.5 border-b border-[#E2E8F0]">
              {assetTypes.map((type) => {
                const isSelected = type.id === value;
                return (
                  <button
                    key={type.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      if (onChange) onChange(type.id);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-[14px] text-left flex items-center justify-between cursor-pointer hover:bg-[#F8FAFC] ${
                      isSelected
                        ? "bg-[#F1F5F9] font-medium text-[#0F172A]"
                        : "text-[#0F172A]"
                    }`}
                  >
                    <span className="truncate">{type.name}</span>
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
          )}

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              if (onAddNewAssetType) onAddNewAssetType();
            }}
            className="w-full px-4 py-2.5 text-[14px] font-medium text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" strokeWidth={2} />
            <span>Add New Asset Type</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default AssetTypeSelect;