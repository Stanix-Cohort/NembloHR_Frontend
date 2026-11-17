import { Bell, ChevronRight, Menu, Search } from 'lucide-react';

function HeaderAvatar() {
  return (
    <div
      className="w-8 h-8 rounded-full bg-[#E5D3C0] flex items-center justify-center shrink-0 overflow-hidden"
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <rect width="32" height="32" fill="#E8D8C8" />
        <circle cx="16" cy="12" r="5.5" fill="#C98A63" />
        <path
          d="M10.5 11.2c0-3.3 2.4-5.7 5.5-5.7s5.5 2.4 5.5 5.7c-.6-1.4-2.1-2.2-5.5-2.2s-4.9.8-5.5 2.2z"
          fill="#2B2118"
        />
        <path
          d="M6 31c1-5.8 5-8.5 10-8.5s9 2.7 10 8.5H6z"
          fill="#2B3D52"
        />
      </svg>
    </div>
  );
}

function DashboardHeader({
  sectionLabel = 'Employees',
  onOpenMobileNav,
  showSearch = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search employees...',
  showNotificationDot = false,
}) {
  return (
    <header className="h-[64px] bg-white border-b border-[#E5E7EB] px-4 sm:px-6 lg:px-9 flex items-center justify-between gap-4 shrink-0">
      {/* Left: Mobile Menu Trigger + Breadcrumb or Search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
          className="lg:hidden p-1.5 rounded-[6px] text-[#1E293B] hover:bg-[#F1F5F9] cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {showSearch ? (
          <div className="relative w-full max-w-[560px]">
            <Search
              className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="w-full h-[38px] pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-[8px] text-[13px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#1E3247]/20 focus:border-[#1E3247]"
            />
          </div>
        ) : (
          <nav aria-label="Breadcrumb" className="flex items-center text-[14px]">
            <span className="text-[#64748B] font-normal">Admin</span>
            <ChevronRight
              className="w-4 h-4 text-[#64748B] mx-2"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <span className="text-[#0F172A] font-medium">{sectionLabel}</span>
          </nav>
        )}
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-4 sm:gap-5 shrink-0">
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-1.5 rounded-[8px] text-[#1E293B] hover:bg-[#F1F5F9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30 cursor-pointer"
        >
          <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
          {showNotificationDot && (
            <span
              aria-hidden="true"
              className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#EF4444]"
            />
          )}
        </button>

        <button
          type="button"
          className="flex items-center gap-2.5 text-left rounded-[8px] py-1 px-1.5 hover:bg-[#F8FAFC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/30 cursor-pointer"
        >
          <HeaderAvatar />
          <div className="hidden sm:block leading-tight">
            <p className="text-[13px] font-medium text-[#0F172A]">
              Admin User
            </p>
            <p className="text-[10px] text-[#64748B] mt-0.5">Administrator</p>
          </div>
          <ChevronRight
            className="w-4 h-4 text-[#1E293B] ml-1"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;