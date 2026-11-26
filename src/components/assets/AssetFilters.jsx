import { Search, ChevronDown, RotateCw } from "lucide-react";

function AssetFilters({
  searchQuery,
  onSearchChange,
  status,
  onStatusChange,
  onClearFilters,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search Input */}
      <div className="relative w-full sm:w-[340px]">
        <Search
          className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search assets..."
          aria-label="Search assets"
          className="w-full h-[40px] pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-[8px] text-[13px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#1E3247]/20 focus:border-[#1E3247]"
        />
      </div>

      {/* Status Filter */}
      <div className="relative">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filter by asset status"
          className="h-[40px] min-w-[175px] bg-white border border-[#E2E8F0] rounded-[8px] pl-3.5 pr-9 text-[13px] font-medium text-[#0F172A] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E3247]/20 focus:border-[#1E3247]"
        >
          <option value="">Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="UNDER_REPAIR">Under Repair</option>
          <option value="RETIRED">Retired</option>
        </select>
        <ChevronDown
          className="w-4 h-4 text-[#0F172A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </div>

      {/* Clear Filters */}
      <button
        type="button"
        onClick={onClearFilters}
        className="h-[40px] px-2.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1E3247] hover:text-[#0F172A] rounded-[8px] hover:bg-[#E2E8F0]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30 cursor-pointer"
      >
        <RotateCw className="w-3.5 h-3.5" strokeWidth={2} />
        <span>Clear Filters</span>
      </button>
    </div>
  );
}

export default AssetFilters;