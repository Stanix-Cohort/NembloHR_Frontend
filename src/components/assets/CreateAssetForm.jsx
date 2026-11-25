import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, LoaderCircle } from "lucide-react";
import AssetTypeSelect from "./AssetTypeSelect";

const CONDITION_OPTIONS = [
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "BAD", label: "Bad" },
];

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Available" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "UNDER_REPAIR", label: "Under Repair" },
  { value: "RETIRED", label: "Retired" },
];

const INITIAL_FORM_STATE = {
  assetId: "",
  serialNumber: "",
  condition: "",
  status: "",
  employeeId: "",
};

function OptionSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  hasError = false,
  emptyMessage = "No options available",
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

  const selectedOption = options.find((opt) => opt.value === value);

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
        <span className="truncate">{selectedOption?.label || placeholder}</span>
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
            {options.length === 0 ? (
              <p className="px-4 py-2.5 text-[13px] text-[#64748B]">
                {emptyMessage}
              </p>
            ) : (
              options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      if (onChange) onChange(opt.value);
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
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CreateAssetForm({
  assetTypes = [],
  selectedAssetTypeId = "",
  onAssetTypeChange,
  onAddNewAssetType,
  employees = [],
  employeesLoading = false,
  isSubmitting = false,
  serverError = "",
  statusNotice = "",
  onCancel,
  onSubmit,
}) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});

  const clearFieldError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handleSelectChange = (field) => (value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "status" && value !== "ASSIGNED" ? { employeeId: "" } : {}),
    }));
    clearFieldError(field);
    if (field === "status" && value !== "ASSIGNED") {
      clearFieldError("employeeId");
    }
  };

  const handleAssetTypeSelect = (typeId) => {
    if (onAssetTypeChange) onAssetTypeChange(typeId);
    clearFieldError("assetTypeId");
  };

  const isAssigned = formData.status === "ASSIGNED";

  const employeeOptions = employees.map((emp) => ({
    value: emp.id,
    label:
      emp.fullName ||
      `${emp.firstName || ""} ${emp.lastName || ""}`.trim() ||
      emp.workEmail ||
      emp.username,
  }));

  const validate = () => {
    const nextErrors = {};

    if (!formData.assetId.trim()) {
      nextErrors.assetId = "Asset ID is required.";
    }

    if (!selectedAssetTypeId) {
      nextErrors.assetTypeId = "Asset type is required.";
    }

    if (!formData.serialNumber.trim()) {
      nextErrors.serialNumber = "Serial number is required.";
    }

    if (!formData.condition) {
      nextErrors.condition = "Condition is required.";
    }

    if (!formData.status) {
      nextErrors.status = "Status is required.";
    }

    if (isAssigned && !formData.employeeId) {
      nextErrors.employeeId = "Please select an employee.";
    }

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      assetCode: formData.assetId.trim(),
      assetTypeId: selectedAssetTypeId,
      serialNumber: formData.serialNumber.trim(),
      condition: formData.condition,
      status: formData.status,
      ...(isAssigned && formData.employeeId
        ? { assignedToEmployeeId: formData.employeeId }
        : {}),
    };

    if (onSubmit) {
      onSubmit(payload, {
        resetForm: () => {
          setFormData(INITIAL_FORM_STATE);
          setErrors({});
          if (onAssetTypeChange) onAssetTypeChange("");
        },
      });
    }
  };

  const getInputClasses = (hasError) =>
    `w-full h-[46px] px-4 rounded-[8px] border bg-white text-[14px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
      hasError
        ? "border-[#DC2626] focus:ring-[#DC2626]/20 focus:border-[#DC2626]"
        : "border-[#CBD5E1] focus:ring-[#1E3247]/20 focus:border-[#1E3247]"
    }`;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isSubmitting}
      className="bg-white border border-[#E2E8F0] rounded-[12px] p-6 sm:p-8"
    >
      {serverError && (
        <div
          role="alert"
          className="mb-6 rounded-[8px] bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700"
        >
          {serverError}
        </div>
      )}

      {statusNotice && (
        <div
          role="status"
          className="mb-6 rounded-[8px] bg-[#F1F5F9] border border-[#CBD5E1] px-4 py-3 text-[13px] text-[#1E3247]"
        >
          {statusNotice}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Asset ID */}
        <div>
          <label
            htmlFor="assetId"
            className="block text-[14px] font-medium text-[#0F172A] mb-2"
          >
            Asset ID <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="assetId"
            name="assetId"
            type="text"
            value={formData.assetId}
            onChange={handleInputChange("assetId")}
            placeholder="Enter asset ID"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.assetId)}
            className={getInputClasses(Boolean(errors.assetId))}
          />
          {errors.assetId && (
            <p className="mt-1.5 text-[12px] text-[#DC2626]">
              {errors.assetId}
            </p>
          )}
        </div>

        {/* Asset Type */}
        <div>
          <label
            htmlFor="assetType"
            className="block text-[14px] font-medium text-[#0F172A] mb-2"
          >
            Asset Type <span className="text-[#DC2626]">*</span>
          </label>
          <AssetTypeSelect
            id="assetType"
            value={selectedAssetTypeId}
            onChange={handleAssetTypeSelect}
            assetTypes={assetTypes}
            disabled={isSubmitting}
            hasError={Boolean(errors.assetTypeId)}
            onAddNewAssetType={onAddNewAssetType}
          />
          {errors.assetTypeId && (
            <p className="mt-1.5 text-[12px] text-[#DC2626]">
              {errors.assetTypeId}
            </p>
          )}
        </div>

        {/* Serial Number */}
        <div>
          <label
            htmlFor="serialNumber"
            className="block text-[14px] font-medium text-[#0F172A] mb-2"
          >
            Serial Number <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="serialNumber"
            name="serialNumber"
            type="text"
            value={formData.serialNumber}
            onChange={handleInputChange("serialNumber")}
            placeholder="Enter serial number"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.serialNumber)}
            className={getInputClasses(Boolean(errors.serialNumber))}
          />
          {errors.serialNumber && (
            <p className="mt-1.5 text-[12px] text-[#DC2626]">
              {errors.serialNumber}
            </p>
          )}
        </div>

        {/* Condition */}
        <div>
          <label
            htmlFor="condition"
            className="block text-[14px] font-medium text-[#0F172A] mb-2"
          >
            Condition <span className="text-[#DC2626]">*</span>
          </label>
          <OptionSelect
            id="condition"
            value={formData.condition}
            onChange={handleSelectChange("condition")}
            options={CONDITION_OPTIONS}
            placeholder="Select condition"
            disabled={isSubmitting}
            hasError={Boolean(errors.condition)}
          />
          {errors.condition && (
            <p className="mt-1.5 text-[12px] text-[#DC2626]">
              {errors.condition}
            </p>
          )}
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="status"
            className="block text-[14px] font-medium text-[#0F172A] mb-2"
          >
            Status <span className="text-[#DC2626]">*</span>
          </label>
          <OptionSelect
            id="status"
            value={formData.status}
            onChange={handleSelectChange("status")}
            options={STATUS_OPTIONS}
            placeholder="Select status"
            disabled={isSubmitting}
            hasError={Boolean(errors.status)}
          />
          {errors.status && (
            <p className="mt-1.5 text-[12px] text-[#DC2626]">{errors.status}</p>
          )}
        </div>

        {/* Select Employee (shown when Status is Assigned) */}
        {isAssigned && (
          <div>
            <label
              htmlFor="employeeId"
              className="block text-[14px] font-medium text-[#0F172A] mb-2"
            >
              Select Employee <span className="text-[#DC2626]">*</span>
            </label>
            <OptionSelect
              id="employeeId"
              value={formData.employeeId}
              onChange={handleSelectChange("employeeId")}
              options={employeeOptions}
              placeholder={
                employeesLoading ? "Loading employees..." : "Select Employee"
              }
              disabled={isSubmitting || employeesLoading}
              hasError={Boolean(errors.employeeId)}
              emptyMessage="No employees found"
            />
            {errors.employeeId && (
              <p className="mt-1.5 text-[12px] text-[#DC2626]">
                {errors.employeeId}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="mt-12 sm:mt-16 flex items-center justify-end gap-3.5">
        <button
          type="button"
          onClick={onCancel}
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
          {isSubmitting && <LoaderCircle className="w-4 h-4 animate-spin" />}
          <span>{isSubmitting ? "Saving..." : "Save Asset"}</span>
        </button>
      </div>
    </form>
  );
}

export default CreateAssetForm;