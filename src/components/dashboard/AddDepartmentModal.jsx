import { useEffect, useState } from "react";
import { LoaderCircle, X } from "lucide-react";

function AddDepartmentModal({
  isOpen,
  isSubmitting = false,
  serverError = "",
  onClose,
  onSave,
}) {
  const [name, setName] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSubmitting && onClose) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    setName("");
    setValidationError("");
    if (onClose) onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmed = name.trim();
    if (!trimmed) {
      setValidationError("Department name is required.");
      return;
    }

    if (onSave) {
      const succeeded = await onSave(trimmed);
      if (succeeded) {
        setName("");
        setValidationError("");
      }
    }
  };

  const displayError = validationError || serverError;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-department-title"
      className="fixed inset-0 z-50 bg-white/60 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[460px] bg-white border border-[#E2E8F0] rounded-[14px] p-6 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.08)]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="add-department-title"
              className="text-[18px] font-bold text-[#0F172A] leading-snug"
            >
              Add New Department
            </h2>
            <p className="mt-1 text-[13px] text-[#475569]">
              Create a department to organise employees within Nemblo HR.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="p-1 text-[#0F172A] hover:text-[#475569] rounded-[6px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30 disabled:opacity-50"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="mt-5">
          <div>
            <label
              htmlFor="department-name-input"
              className="block text-[14px] font-medium text-[#0F172A] mb-2"
            >
              Department Name <span className="text-[#DC2626]">*</span>
            </label>
            <input
              id="department-name-input"
              name="departmentName"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (validationError) setValidationError("");
              }}
              placeholder="e.g Customer Support"
              disabled={isSubmitting}
              autoFocus
              aria-invalid={Boolean(displayError)}
              className={`w-full h-[46px] px-4 rounded-[8px] border bg-white text-[14px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 disabled:opacity-60 ${
                displayError
                  ? "border-[#DC2626] focus:ring-[#DC2626]/20 focus:border-[#DC2626]"
                  : "border-[#CBD5E1] focus:ring-[#1E3247]/20 focus:border-[#1E3247]"
              }`}
            />
            {displayError && (
              <p role="alert" className="mt-1.5 text-[12px] text-[#DC2626]">
                {displayError}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-[40px] px-5 rounded-[8px] border border-[#1E3247] bg-white hover:bg-[#F8FAFC] text-[13px] font-medium text-[#1E3247] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[40px] px-5 rounded-[8px] bg-[#1E3247] hover:bg-[#162638] active:bg-[#101D2B] text-[13px] font-medium text-white inline-flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/40 disabled:opacity-70"
            >
              {isSubmitting && <LoaderCircle className="w-4 h-4 animate-spin" />}
              <span>{isSubmitting ? "Saving..." : "Save Department"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDepartmentModal;