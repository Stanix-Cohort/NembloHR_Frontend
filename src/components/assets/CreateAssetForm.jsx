import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  FileText,
  ImagePlus,
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

const INITIAL_FORM_STATE = {
  assetId: "",
  name: "",
  serialNumber: "",
  condition: "GOOD",
  description: "",
};

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const ACCEPTED_DOCUMENT_TYPES = ["application/pdf"];

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
            {options.length === 0 ? (
              <p className="px-4 py-2.5 text-[13px] text-[#64748B]">
                No options available
              </p>
            ) : (
              options.map((option) => {
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
  isSubmitting = false,
  serverError = "",
  statusNotice = "",
  onCancel,
  onSubmit,
}) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
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

    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

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

  const handleRemoveImage = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }

    setImageFile(null);
    setImagePreview("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

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

  const handleRemoveDocument = () => {
    setDocumentFile(null);

    if (documentInputRef.current) {
      documentInputRef.current.value = "";
    }

    clearFieldError("document");
  };

  const handleSelectChange = (field) => (value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    clearFieldError(field);
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

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }

    setImageFile(null);
    setImagePreview("");
    setDocumentFile(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    if (documentInputRef.current) {
      documentInputRef.current.value = "";
    }

    onAssetTypeChange?.("");
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
      assetId: formData.assetId.trim(),
      name: formData.name.trim(),
      condition: formData.condition,
      ...(formData.serialNumber.trim()
        ? { serialNumber: formData.serialNumber.trim() }
        : {}),
      ...(formData.description.trim()
        ? { description: formData.description.trim() }
        : {}),
      ...(imageFile ? { image: imageFile } : {}),
      ...(documentFile ? { file: documentFile } : {}),
    };

    onSubmit?.(payload, { resetForm });
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

      {/* Asset Image and Supporting Document */}
      <div>
        <h2 className="text-[14px] font-bold text-[#0F172A] leading-snug">
          Asset Image
        </h2>

        <p className="mt-0.5 text-[12px] text-[#64748B]">
          Upload a photograph of the company asset.
        </p>

        <div className="mt-3 flex flex-col sm:flex-row sm:items-start gap-6">
          <div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleImageSelect}
              disabled={isSubmitting}
              className="hidden"
              aria-label="Upload asset image"
            />

            {imagePreview ? (
              <div className="relative w-[190px] h-[146px] rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] overflow-hidden group">
                <img
                  src={imagePreview}
                  alt="Selected asset preview"
                  className="w-full h-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center text-white text-[12px] font-medium opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  Change Image
                </button>

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isSubmitting}
                  aria-label="Remove uploaded image"
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white border border-[#CBD5E1] text-[#0F172A] hover:text-[#DC2626] flex items-center justify-center shadow-xs cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isSubmitting}
                className="w-[190px] h-[146px] rounded-[12px] border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] flex flex-col items-center justify-center text-center px-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <ImagePlus
                  className="w-6 h-6 text-[#1E293B]"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />

                <span className="mt-2.5 text-[14px] font-semibold text-[#0F172A]">
                  Upload Image
                </span>

                <span className="mt-0.5 text-[12px] text-[#64748B]">
                  JPG or PNG
                </span>
              </button>
            )}

            {errors.image && (
              <p className="mt-1.5 text-[12px] text-[#DC2626]">
                {errors.image}
              </p>
            )}
          </div>

          <div className="w-full sm:max-w-[300px]">
            <h2 className="text-[14px] font-bold text-[#0F172A] leading-snug">
              Supporting Document
              <span className="ml-1.5 text-[11px] font-normal text-[#64748B]">
                (Optional)
              </span>
            </h2>

            <p className="mt-0.5 text-[12px] text-[#64748B]">
              Attach an asset receipt, invoice or related document.
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
                  <p className="text-[11px] text-[#64748B]">PDF document</p>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveDocument}
                  disabled={isSubmitting}
                  aria-label="Remove supporting document"
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
                    Attach PDF
                  </p>
                  <p className="text-[11px] text-[#64748B]">PDF files only</p>
                </div>
              </button>
            )}

            {errors.document && (
              <p className="mt-1.5 text-[12px] text-[#DC2626]">
                {errors.document}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Form Grid */}
      <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
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
            htmlFor="name"
            className="block text-[14px] font-medium text-[#0F172A] mb-2"
          >
            Asset Name <span className="text-[#DC2626]">*</span>
          </label>

          <input
            id="name"
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
            Serial Number
            <span className="ml-1.5 text-[11px] font-normal text-[#64748B]">
              (Optional)
            </span>
          </label>

          <input
            id="serialNumber"
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
            htmlFor="condition"
            className="block text-[14px] font-medium text-[#0F172A] mb-2"
          >
            Condition
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

        {/* Description */}
        <div className="md:col-span-2">
          <label
            htmlFor="description"
            className="block text-[14px] font-medium text-[#0F172A] mb-2"
          >
            Description
            <span className="ml-1.5 text-[11px] font-normal text-[#64748B]">
              (Optional)
            </span>
          </label>

          <textarea
            id="description"
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

export default CreateAssetForm;
