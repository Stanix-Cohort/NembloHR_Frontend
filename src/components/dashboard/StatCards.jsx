import totalEmployeesIcon from '../../assets/icon-total-employees.png';
import activeEmployeesIcon from '../../assets/icon-active-employees.png';
import inactiveEmployeesIcon from '../../assets/icon-inactive-employees.png';

function StatCards({ totalCount = 0, activeCount = 0, inactiveCount = 0 }) {
  const cards = [
    {
      id: 'total',
      label: 'Total Employees',
      value: totalCount,
      iconSrc: totalEmployeesIcon,
      iconAlt: 'Total employees icon',
    },
    {
      id: 'active',
      label: 'Active Employees',
      value: activeCount,
      iconSrc: activeEmployeesIcon,
      iconAlt: 'Active employees icon',
    },
    {
      id: 'inactive',
      label: 'Inactive Employees',
      value: inactiveCount,
      iconSrc: inactiveEmployeesIcon,
      iconAlt: 'Inactive employees icon',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {cards.map(({ id, label, value, iconSrc, iconAlt }) => (
        <div
          key={id}
          className="bg-white border border-[#E2E8F0] rounded-[12px] px-6 py-5 flex items-center gap-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
        >
          <img
            src={iconSrc}
            alt={iconAlt}
            className="w-12 h-12 rounded-full object-contain shrink-0 select-none"
          />
          <div>
            <p className="text-[20px] font-bold text-[#0F172A] leading-tight">
              {value}
            </p>
            <p className="text-[12px] font-normal text-[#475569] mt-0.5">
              {label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatCards;