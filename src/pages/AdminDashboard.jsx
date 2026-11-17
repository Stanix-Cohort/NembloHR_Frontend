import { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import Sidebar from '../layouts/Sidebar';
import DashboardHeader from '../layouts/DashboardHeader';
import StatCards from '../components/dashboard/StatCards';
import DirectoryFilters from '../components/dashboard/DirectoryFilters';
import EmptyState from '../components/dashboard/EmptyState';

function AdminDashboard() {
  const [activeRoute, setActiveRoute] = useState('employees');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name-asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');

  const handleNavigate = (item) => {
    setActiveRoute(item.id);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setDepartment('');
    setStatus('');
  };

  const handleAddEmployee = () => {
    // Placeholder handler until employee creation modal/route is connected
    console.log('Add Employee triggered');
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] overflow-x-hidden">
      <Sidebar
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardHeader
          sectionLabel="Employees"
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-9 lg:py-7">
          <div className="w-full">
            {/* Page Title & Action Controls */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-[28px] sm:text-[32px] font-bold tracking-[-0.02em] text-[#0F172A] leading-tight">
                  Employee Directory
                </h1>
                <p className="mt-1 text-[13px] font-normal text-[#64748B]">
                  Manage your organisation’s employee records.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:pt-1">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort employees"
                    className="h-[42px] pl-4 pr-9 rounded-[10px] border border-[#64748B] bg-white text-[13px] font-medium text-[#0F172A] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E3247]/20 focus:border-[#1E3247]"
                  >
                    <option value="name-asc">Sort by: Name (A-Z)</option>
                    <option value="name-desc">Sort by: Name (Z-A)</option>
                  </select>
                  <ChevronDown
                    className="w-4 h-4 text-[#0F172A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddEmployee}
                  className="h-[42px] px-5 rounded-[10px] bg-[#1E3247] hover:bg-[#162638] active:bg-[#101D2B] text-white text-[13px] font-medium inline-flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3247]/40"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  <span>Add Employee</span>
                </button>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="mt-6">
              <StatCards totalCount={0} activeCount={0} inactiveCount={0} />
            </div>

            {/* Search & Filter Row */}
            <div className="mt-5">
              <DirectoryFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                department={department}
                onDepartmentChange={setDepartment}
                status={status}
                onStatusChange={setStatus}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Empty State */}
            <div className="mt-6">
              <EmptyState onAddEmployee={handleAddEmployee} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;