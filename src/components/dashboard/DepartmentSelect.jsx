import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";

function DepartmentSelect({
  id = "departmentId",
  value = "",
  onChange,
  departments = [],
  loading = false,
  disabled = false,
  onAddNewDepartment,
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

  const selectedDepartment = departments.find((dept) => dept.id === value);
  const triggerLabel = loading
    ? "Loading departments..."
    : selectedDepartment?.name || "Select department";

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled || loading}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-[46px] pl-4 pr-10 rounded-[8px] border border-[#CBD5E1] bg-white text-[14px] text-left flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E3247]/20 focus:border-[#1E3247] disabled:opacity-60 disabled:cursor-not-allowed ${
          selectedDepartment ? "text-[#0F172A]" : "text-[#64748B]"
        }`}
      >
        <span className="truncate">{triggerLabel}</span>
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
          className="absolute left-0 right-0 mt-1.5 z-30 bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0_8px_24px_rgba(15,23,42,0.08)] overflow-hidden"
        >
          <div className="max-h-[240px] overflow-y-auto py-1.5">
            {departments.length === 0 ? (
              <p className="px-4 py-2.5 text-[13px] text-[#64748B]">
                No departments found
              </p>
            ) : (
              departments.map((dept) => {
                const isSelected = dept.id === value;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      if (onChange) onChange(dept.id);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-[14px] text-left flex items-center justify-between cursor-pointer hover:bg-[#F8FAFC] ${
                      isSelected
                        ? "bg-[#F1F5F9] font-medium text-[#0F172A]"
                        : "text-[#0F172A]"
                    }`}
                  >
                    <span className="truncate">{dept.name}</span>
                    {isSelected && (
                      <Check
                        className="w-4 h-4 text-[#1E3247] shrink-0"
                        strokeWidth={2}
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onAddNewDepartment) onAddNewDepartment();
              }}
              className="w-full px-4 py-2.5 text-[14px] font-medium text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" strokeWidth={2} />
              <span>Add New Department</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepartmentSelect;