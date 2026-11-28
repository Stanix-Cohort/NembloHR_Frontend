import { useEffect, useRef, useState } from "react";
import {
  Briefcase,
  Check,
  ChevronDown,
  FileText,
  LoaderCircle,
  Upload,
  X,
} from "lucide-react";
import AssetTypeSelect from "./AssetTypeSelect";

const CONDITION_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "POOR", label: "Poor" },
  { value: "DAMAGED", label: "Damaged" },
];

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Available" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "UNDER_REPAIR", label: "Under Repair" },
  { value: "RETIRED", label: "Retired" },
];

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const ACCEPTED_DOCUMENT_TYPES = ["application/pdf"];

function buildInitialState(asset) {
  return {
    assetId: asset?.assetId || asset?.assetCode || "",
    name: asset?.name || "",
    serialNumber: asset?.serialNumber || "",
    condition: String(asset?.condition || "GOOD").toUpperCase(),
    status: String(asset?.status || "AVAILABLE").toUpperCase(),
    description: asset?.description || "",
  };
}

function OptionSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
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

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={hasError}
        onClick={() => setIsOpen((previous) => !previous)}
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
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange?.(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-[13px] text-left flex items-center justify-between cursor-pointer hover:bg-[#F8FAFC] ${
                    isSelected
                      ? "bg-[#F1F5F9] font-medium text-[#0F172A]"
                      : "text-[#0F172A]"
                  }`}
                >
                  <span className="truncate">{option.label}</span>

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

function EditAssetForm({
  asset,
  assetTypes = [],
  selectedAssetTypeId = "",
  onAssetTypeChange,
  onAddNewAssetType,
  isSubmitting = false,
  serverError = "",
  onCancel,
  onSubmit,
}) {
  const [formData, setFormData] = useState(() => buildInitialState(asset));
  const [errors, setErrors] = useState({});

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    () => asset?.imageUrl || "",
  );
  const [documentFile, setDocumentFile] = useState(null);

  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const previewUrlRef = useRef("");

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const clearFieldError = (field) => {
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((previous) => ({ ...previous, [field]: value }));
    clearFieldError(field);
  };

  const handleSelectChange = (field) => (value) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    clearFieldError(field);
  };

  const handleAssetTypeSelect = (typeId) => {
    onAssetTypeChange?.(typeId);
    clearFieldError("assetTypeId");
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrors((previous) => ({
        ...previous,
        image: "Please upload a JPG or PNG image.",
      }));
      event.target.value = "";
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const nextPreview = URL.createObjectURL(file);
    previewUrlRef.current = nextPreview;
    setImageFile(file);
    setImagePreview(nextPreview);
    clearFieldError("image");
  };

  const handleDocumentSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_DOCUMENT_TYPES.includes(file.type)) {
      setErrors((previous) => ({
        ...previous,
        document: "Please upload a PDF document.",
      }));
      event.target.value = "";
      return;
    }

    setDocumentFile(file);
    clearFieldError("document");
  };

  const handleRemoveNewDocument = () => {
    setDocumentFile(null);
    if (documentInputRef.current) {
      documentInputRef.current.value = "";
    }
    clearFieldError("document");
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.assetId.trim()) {
      nextErrors.assetId = "Asset ID is required.";
    } else if (formData.assetId.trim().length > 100) {
      nextErrors.assetId = "Asset ID cannot exceed 100 characters.";
    }

    if (!formData.name.trim()) {
      nextErrors.name = "Asset name is required.";
    } else if (formData.name.trim().length > 150) {
      nextErrors.name = "Asset name cannot exceed 150 characters.";
    }

    if (!selectedAssetTypeId) {
      nextErrors.assetTypeId = "Asset type is required.";
    }

    if (formData.serialNumber.trim().length > 150) {
      nextErrors.serialNumber = "Serial number cannot exceed 150 characters.";
    }

    if (formData.description.trim().length > 2000) {
      nextErrors.description = "Description cannot exceed 2,000 characters.";
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

    const initial = buildInitialState(asset);
    const selectedType = assetTypes.find(
      (type) => type.id === selectedAssetTypeId,
    );

    const payload = {};

    if (formData.assetId.trim() !== initial.assetId.trim()) {
      payload.assetId = formData.assetId.trim();
    }

    if (formData.name.trim() !== initial.name.trim()) {
      payload.name = formData.name.trim();
    }

    if (selectedType && selectedType.name !== (asset?.type || "")) {
      payload.type = selectedType.name;
    }

    if (formData.serialNumber.trim() !== initial.serialNumber.trim()) {
      payload.serialNumber = formData.serialNumber.trim();
    }

    if (formData.condition !== initial.condition) {
      payload.condition = formData.condition;
    }

    if (formData.status !== initial.status) {
      payload.status = formData.status;
    }

    if (formData.description.trim() !== initial.description.trim()) {
      payload.description = formData.description.trim();
    }

    if (imageFile) {
      payload.image = imageFile;
    }

    if (documentFile) {
      payload.file = documentFile;
    }

    onSubmit?.(payload);
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

      {/* Top Row: Asset Photo + Change Photo & Optional Supporting Document */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-8">
        <div className="flex flex-col items-center sm:w-[190px] shrink-0">
          <div className="w-[190px] h-[146px] rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] overflow-hidden flex items-center justify-center">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt={formData.name || "Asset preview"}
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

          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleImageSelect}
            disabled={isSubmitting}
            className="hidden"
            aria-label="Upload asset image"
          />

          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={isSubmitting}
            className="mt-3 h-[36px] px-5 rounded-[8px] border border-[#1E3247] bg-white hover:bg-[#F8FAFC] text-[13px] font-medium text-[#0F172A] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30 disabled:opacity-60"
          >
            Change Photo
          </button>

          {errors.image && (
            <p className="mt-1.5 text-[12px] text-[#DC2626] text-center">
              {errors.image}
            </p>
          )}
        </div>

        <div className="w-full sm:max-w-[320px]">
          <h2 className="text-[14px] font-bold text-[#0F172A] leading-snug">
            Supporting Document
            <span className="ml-1.5 text-[11px] font-normal text-[#64748B]">
              (Optional)
            </span>
          </h2>

          <p className="mt-0.5 text-[12px] text-[#64748B]">
            Replace or attach an asset receipt, invoice or related PDF.
          </p>

          <input
            ref={documentInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleDocumentSelect}
            disabled={isSubmitting}
            className="hidden"
            aria-label="Upload supporting PDF document"
          />

          {documentFile ? (
            <div className="mt-3 min-h-[66px] flex items-center gap-3 rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2.5">
              <div className="w-9 h-9 shrink-0 rounded-[8px] bg-white border border-[#E2E8F0] flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#1E3247]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-[#0F172A] truncate">
                  {documentFile.name}
                </p>
                <p className="text-[11px] text-[#64748B]">New PDF selected</p>
              </div>

              <button
                type="button"
                onClick={handleRemoveNewDocument}
                disabled={isSubmitting}
                aria-label="Remove selected document"
                className="w-7 h-7 shrink-0 rounded-full hover:bg-white text-[#64748B] hover:text-[#DC2626] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => documentInputRef.current?.click()}
              disabled={isSubmitting}
              className="mt-3 w-full min-h-[66px] rounded-[10px] border border-dashed border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] flex items-center gap-3 px-4 text-left cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="w-9 h-9 shrink-0 rounded-[8px] bg-[#F1F5F9] flex items-center justify-center">
                <Upload className="w-[18px] h-[18px] text-[#1E3247]" />
              </div>

              <div>
                <p className="text-[13px] font-medium text-[#0F172A]">
                  {asset?.fileUrl ? "Replace PDF" : "Attach PDF"}
                </p>
                <p className="text-[11px] text-[#64748B]">PDF files only</p>
              </div>
            </button>
          )}

          {asset?.fileUrl && !documentFile && (
            <a
              href={asset.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-[12px] font-medium text-[#0284C7] hover:underline"
            >
              View current PDF document
            </a>
          )}

          {errors.document && (
            <p className="mt-1.5 text-[12px] text-[#DC2626]">
              {errors.document}
            </p>
          )}
        </div>
      </div>

      {/* Form Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Asset ID */}
        <div>
          <label
            htmlFor="edit-assetId"
            className="block text-[14px] font-medium text-[#0F172A] mb-2"
          >
            Asset ID <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="edit-assetId"
            name="assetId"
            type="text"
            maxLength={100}
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

        {/* Asset Name */}
        <div>
          <label
            htmlFor="edit-name"
            className="block text-[14px] font-medium text-[#0F172A] mb-2"
          >
            Asset Name <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id="edit-name"
            name="name"
            type="text"
            maxLength={150}
            value={formData.name}
            onChange={handleInputChange("name")}
            placeholder="Enter asset name"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.name)}
            className={getInputClasses(Boolean(errors.name))}
          />
          {errors.name && (
            <p className="mt-1.5 text-[12px] text-[#DC2626]">{errors.name}</p>
          )}
        </div>

        {/* Asset Type */}
        <div>
          <label
            htmlFor="edit-assetType"
            className="block text-[14px] font-medium text-[#0F172A] mb-2"
          >
            Asset Type <span className="text-[#DC2626]">*</span>
          </label>
          <AssetTypeSelect
            id="edit-assetType"
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
            htmlFor="edit-serialNumber"
            className="block text-[14px] font-medium text-[#0F172A] mb-2"
          >
            Serial Number
            <span className="ml-1.5 text-[11px] font-normal text-[#64748B]">
              (Optional)
            </span>
          </label>
          <input
            id="edit-serialNumber"
            name="serialNumber"
            type="text"
            maxLength={150}
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
            htmlFor="edit-condition"
            className="block text-[14px] font-medium text-[#0F172A] mb-2"
          >
            Condition <span className="text-[#DC2626]">*</span>
          </label>
          <OptionSelect
            id="edit-condition"
            value={formData.condition}
            onChange={handleSelectChange("condition")}
            options={CONDITION_OPTIONS}
            placeholder="Select condition"
            disabled={isSubmitting}
            hasError={Boolean(errors.condition)}
          />
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="edit-status"
            className="block text-[14px] font-medium text-[#0F172A] mb-2"
          >
            Status <span className="text-[#DC2626]">*</span>
          </label>
          <OptionSelect
            id="edit-status"
            value={formData.status}
            onChange={handleSelectChange("status")}
            options={STATUS_OPTIONS}
            placeholder="Select status"
            disabled={isSubmitting}
            hasError={Boolean(errors.status)}
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label
            htmlFor="edit-description"
            className="block text-[14px] font-medium text-[#0F172A] mb-2"
          >
            Description
            <span className="ml-1.5 text-[11px] font-normal text-[#64748B]">
              (Optional)
            </span>
          </label>
          <textarea
            id="edit-description"
            name="description"
            rows={4}
            maxLength={2000}
            value={formData.description}
            onChange={handleInputChange("description")}
            placeholder="Add relevant details about this asset..."
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.description)}
            className={`w-full min-h-[110px] px-4 py-3 rounded-[8px] border bg-white text-[14px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 resize-y disabled:opacity-60 disabled:cursor-not-allowed ${
              errors.description
                ? "border-[#DC2626] focus:ring-[#DC2626]/20 focus:border-[#DC2626]"
                : "border-[#CBD5E1] focus:ring-[#1E3247]/20 focus:border-[#1E3247]"
            }`}
          />
          {errors.description && (
            <p className="mt-1.5 text-[12px] text-[#DC2626]">
              {errors.description}
            </p>
          )}
          <p className="mt-1 text-[11px] text-[#94A3B8] text-right">
            {formData.description.length}/2000
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="mt-10 sm:mt-12 flex items-center justify-end gap-3.5">
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

export default EditAssetForm;