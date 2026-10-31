import React from 'react';
import { FaBackspace, FaCheck } from 'react-icons/fa';

const RegisterKeypad = ({ onKeyPress, disabled = false }) => {
  const keys = [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    {
      label: <FaBackspace className="text-base text-[#6C716A]" aria-label="Backspace" />,
      value: 'backspace',
      ariaLabel: 'Backspace',
    },
    { label: '0', value: '0' },
    {
      label: <FaCheck className="text-xs text-white" aria-label="Submit PIN" />,
      value: 'enter',
      ariaLabel: 'Submit PIN',
      isEnter: true,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Cashier numeric PIN keypad">
      {keys.map((k, idx) => (
        <button
          key={idx}
          type="button"
          disabled={disabled}
          onClick={() => onKeyPress(k.value)}
          aria-label={k.ariaLabel || k.label}
          className={`h-12 rounded border flex items-center justify-center font-mono font-semibold text-base transition-colors focus:outline-none focus:ring-2 focus:ring-[#B55E42] active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ${
            k.isEnter
              ? 'bg-[#B55E42] hover:bg-[#9C4F37] border-[#B55E42] text-white shadow-none'
              : 'bg-[#FFFFFF] hover:bg-[#F5F3ED] border-[#DDDCD4] text-[#252924] shadow-none'
          }`}
        >
          {k.label}
        </button>
      ))}
    </div>
  );
};

export default RegisterKeypad;

