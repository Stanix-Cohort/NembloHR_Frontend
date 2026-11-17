import { Contact, Users, CalendarCheck, Briefcase, X } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'employees', label: 'Employees', path: '/admin/employees', Icon: Contact },
  { id: 'attendance', label: 'Attendance', path: '/admin/attendance', Icon: Users },
  {
    id: 'leave-management',
    label: 'Leave Management',
    path: '/admin/leave-management',
    Icon: CalendarCheck,
  },
  { id: 'assets', label: 'Assets', path: '/admin/assets', Icon: Briefcase },
];

function AdminAvatar() {
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

function Sidebar({
  activeRoute = 'employees',
  onNavigate,
  mobileOpen = false,
  onCloseMobile,
}) {
  const handleNavClick = (item) => {
    if (onNavigate) {
      onNavigate(item);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Admin Portal Navigation"
        className={`fixed inset-y-0 left-0 z-40 w-[260px] bg-[#1E3247] text-white flex flex-col shrink-0 transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Brand Bar */}
        <div className="h-[64px] px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-[26px] h-[26px] rounded-[6px] bg-white flex items-center justify-center shrink-0">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 text-[#1E3247]"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M7 17V7l10 10V7"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="7" cy="17" r="2" fill="currentColor" />
                <circle cx="17" cy="7" r="2" fill="currentColor" />
              </svg>
            </div>
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-white">
              Nemblo HR
            </span>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="lg:hidden text-white/80 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Heading */}
        <div className="px-6 mt-5 mb-2.5">
          <span className="text-[13px] font-medium text-[#CBD5E1]">
            Admin Portal
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="px-4 flex-1 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const { id, label, path, Icon } = item;
            const isActive = activeRoute === id;

            return (
              <a
                key={id}
                href={path}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[8px] text-[14px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                  isActive
                    ? 'bg-[#7A8896] text-white'
                    : 'text-[#E2E8F0] hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
                <span>{label}</span>
              </a>
            );
          })}
        </nav>

        {/* Bottom Profile Card */}
        <div className="p-4 mt-auto">
          <div className="rounded-[10px] border border-white/15 bg-white/[0.06] px-3.5 py-3 flex items-center gap-3">
            <AdminAvatar />
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-white leading-tight truncate">
                Admin User
              </p>
              <p className="text-[10px] text-[#CBD5E1] leading-tight mt-0.5 truncate">
                Administrator
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;