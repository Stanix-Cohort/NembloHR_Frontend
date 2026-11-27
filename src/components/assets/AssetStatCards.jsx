import totalAssetsIcon from "../../assets/icon-total-assets.png";
import availableAssetsIcon from "../../assets/icon-available-assets.png";
import assignedAssetsIcon from "../../assets/icon-assigned-assets.png";
import underRepairAssetsIcon from "../../assets/icon-under-repair-assets.png";
import retiredAssetsIcon from "../../assets/icon-retired-assets.png";

function AssetStatCards({
  totalCount = 0,
  availableCount = 0,
  assignedCount = 0,
  underRepairCount = 0,
  retiredCount = 0,
}) {
  const cards = [
    {
      id: "total",
      label: "Total",
      value: totalCount,
      iconSrc: totalAssetsIcon,
      iconAlt: "Total assets icon",
    },
    {
      id: "available",
      label: "Available",
      value: availableCount,
      iconSrc: availableAssetsIcon,
      iconAlt: "Available assets icon",
    },
    {
      id: "assigned",
      label: "Assigned",
      value: assignedCount,
      iconSrc: assignedAssetsIcon,
      iconAlt: "Assigned assets icon",
    },
    {
      id: "under-repair",
      label: "Under Repair",
      value: underRepairCount,
      iconSrc: underRepairAssetsIcon,
      iconAlt: "Under repair assets icon",
    },
    {
      id: "retired",
      label: "Retired",
      value: retiredCount,
      iconSrc: retiredAssetsIcon,
      iconAlt: "Retired assets icon",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map(({ id, label, value, iconSrc, iconAlt }) => (
        <div
          key={id}
          className={`bg-white border border-[#E2E8F0] rounded-[12px] px-3.5 py-3.5 sm:px-5 sm:py-5 flex items-center gap-2.5 sm:gap-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] ${
            id === "total" ? "col-span-2 lg:col-span-1" : ""
          }`}
        >
          <img
            src={iconSrc}
            alt={iconAlt}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-contain shrink-0 select-none"
          />
          <div className="min-w-0">
            <p className="text-[18px] sm:text-[20px] font-bold text-[#0F172A] leading-tight">
              {value}
            </p>
            <p className="text-[12px] font-normal text-[#475569] mt-0.5 leading-snug">
              {label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AssetStatCards;