'use client';

import { useId, useState, useEffect } from 'react';

interface InputGroupProps {
  label: string;
  name: string;
  type?: 'text' | 'number' | 'email' | 'tel';
  value: string | number | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number | string;
  required?: boolean;
}

export function InputGroup({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  prefix,
  suffix,
  error,
  helperText,
  disabled = false,
  min,
  max,
  step,
  required = false,
}: InputGroupProps) {
  const id = useId();
  const [displayValue, setDisplayValue] = useState(value?.toString() ?? '');

  // Sync props to state, handling the conflict between "parent thinks 0" and "user wants empty"
  useEffect(() => {
    const propStr = value === undefined || value === null ? '' : value.toString();

    // If the prop matches the current display value exactly, do nothing
    if (propStr === displayValue) return;

    // Fix for "Cannot remove 0":
    // If the parent says '0' (likely due to Number('') || 0 logic) but the user has cleared the field (displayValue is ''),
    // we respect the user's intent to have an empty field.
    if (propStr === '0' && displayValue === '') return;

    // Otherwise, specific sync (e.g. external update, or correcting '01' -> '1')
    setDisplayValue(propStr);
  }, [value, displayValue]);

  const handleChange = (val: string) => {
    setDisplayValue(val);
    onChange(val);
  };

  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-slate-500">
            {prefix}
          </span>
        )}

        <input
          id={id}
          name={name}
          type={type}
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          required={required}
          className={`
            w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800
            transition-colors focus:outline-none placeholder:text-slate-400
            ${prefix ? 'pl-8' : ''}
            ${suffix ? 'pr-12' : ''}
            ${error
              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-200'
              : 'border-slate-300 focus:border-[#31B2E8] focus:ring-1 focus:ring-[#31B2E8]/20'
            }
            ${disabled ? 'cursor-not-allowed bg-slate-100' : ''}
          `}
        />

        {suffix && (
          <span className="absolute right-3 text-slate-500">
            {suffix}
          </span>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {helperText && !error && (
        <p className="text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
}

interface SelectGroupProps {
  label: string;
  name: string;
  value: string | undefined;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
}

export function SelectGroup({
  label,
  name,
  value,
  onChange,
  options,
  error,
  helperText,
  disabled = false,
  required = false,
}: SelectGroupProps) {
  const id = useId();

  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <select
        id={id}
        name={name}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className={`
          w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800
          transition-colors focus:outline-none
          ${error
            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-200'
            : 'border-slate-300 focus:border-[#31B2E8] focus:ring-1 focus:ring-[#31B2E8]/20'
          }
          ${disabled ? 'cursor-not-allowed bg-slate-100' : ''}
        `}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {helperText && !error && (
        <p className="text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
}

interface CheckboxGroupProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helperText?: string;
  disabled?: boolean;
}

export function CheckboxGroup({
  label,
  name,
  checked,
  onChange,
  helperText,
  disabled = false,
}: CheckboxGroupProps) {
  const id = useId();

  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-[#2A8BB3] focus:ring-[#31B2E8]"
      />
      <div>
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-700"
        >
          {label}
        </label>
        {helperText && (
          <p className="text-sm text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    </div>
  );
}
