import React from 'react';
import { getApiUrl } from '../../utils/getApiUrl';
import { FaCheck } from 'react-icons/fa';

const CashierRow = ({ user, isSelected, onSelect }) => {
  const firstname = user.firstname || 'Staff';
  const lastname = user.lastname || '';
  const fullName = `${firstname} ${lastname}`.trim();
  const initials = `${firstname.charAt(0)}${lastname ? lastname.charAt(0) : ''}`.toUpperCase();

  const cashierId = user._id ? `C-${user._id.substring(user._id.length - 4).toUpperCase()}` : 'C-0000';
  const assignedStation = user.station || 'Station Standby';
  const displayRole = user.role ? user.role.toUpperCase() : 'CASHIER';

  const imageUrl = user.image && !user.image.includes('default-image.jpg')
    ? (user.image.startsWith('http') ? user.image : `${getApiUrl()}/${user.image}`)
    : null;

  return (
    <button
      type="button"
      onClick={() => onSelect(user)}
      aria-pressed={isSelected}
      className={`w-full text-left transition-all duration-150 rounded border px-4 py-3 flex items-center justify-between gap-3 group focus:outline-none focus:ring-2 focus:ring-[#B55E42] ${
        isSelected
          ? 'bg-[#FFFFFF] border-l-4 border-l-[#B55E42] border-t-[#DDDCD4] border-r-[#DDDCD4] border-b-[#DDDCD4]'
          : 'bg-[#FFFFFF] border-[#DDDCD4] hover:bg-[#F5F3ED] hover:border-[#B7B5AA]'
      }`}
    >
      {/* Left: Avatar or Initials + Identity */}
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Monospaced Initials Badge / Image */}
        <div className="w-10 h-10 rounded border border-[#DDDCD4] flex-shrink-0 overflow-hidden flex items-center justify-center bg-[#F3E8E1] text-[#B55E42] font-mono font-bold text-xs select-none">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={fullName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <span>{initials || 'ST'}</span>
          )}
        </div>

        {/* Name and Register Metadata */}
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm text-[#252924] truncate">
              {fullName}
            </span>
            <span className="font-mono text-[10px] text-[#6C716A]">
              {cashierId}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 font-mono text-[11px] text-[#6C716A]">
            <span>{assignedStation}</span>
          </div>
        </div>
      </div>

      {/* Right: Role & Selection Affordance */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-mono text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 border border-[#DDDCD4] text-[#6C716A] bg-[#F5F3ED]">
          {displayRole}
        </span>

        {isSelected ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#B55E42] text-[#FFFFFF] text-xs font-semibold">
            <FaCheck className="text-[10px]" />
            <span className="hidden sm:inline">Selected</span>
          </div>
        ) : (
          <span className="text-xs font-semibold text-[#6C716A] group-hover:text-[#B55E42] transition-colors flex items-center gap-1">
            Sign in <span className="font-mono">→</span>
          </span>
        )}
      </div>
    </button>
  );
};

export default CashierRow;

