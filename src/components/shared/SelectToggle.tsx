import React from 'react';

interface Option {
    value: string;
    label: string;
}

interface SelectToggleProps {
    label?: string;
    name?: string;
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    disabled?: boolean;
    className?: string;
}

export const SelectToggle: React.FC<SelectToggleProps> = ({
    label,
    value,
    onChange,
    options,
    disabled,
    className = '',
}) => {
    return (
        <div className={`space-y-1 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}
            <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(option.value)}
                        className={`
              px-3 py-1.5 text-sm font-medium rounded-full transition-colors border focus:outline-none focus:ring-0
              ${value === option.value
                                ? 'bg-blue-600 text-white border-transparent'
                                : 'bg-white text-slate-600 border-slate-300 hover:bg-[#cbe5f2] hover:border-slate-400'
                            }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
