'use client';

import { useId } from 'react';

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

  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-zinc-500 dark:text-zinc-400">
            {prefix}
          </span>
        )}

        <input
          id={id}
          name={name}
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          required={required}
          className={`
            w-full rounded-lg border bg-white px-3 py-2 text-sm
            transition-colors focus:outline-none focus:ring-2
            dark:bg-zinc-900
            ${prefix ? 'pl-8' : ''}
            ${suffix ? 'pr-12' : ''}
            ${
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800'
                : 'border-zinc-300 focus:border-blue-500 focus:ring-blue-200 dark:border-zinc-700 dark:focus:ring-blue-800'
            }
            ${disabled ? 'cursor-not-allowed bg-zinc-100 dark:bg-zinc-800' : ''}
          `}
        />

        {suffix && (
          <span className="absolute right-3 text-zinc-500 dark:text-zinc-400">
            {suffix}
          </span>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {helperText && !error && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{helperText}</p>
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
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
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
          w-full rounded-lg border bg-white px-3 py-2 text-sm
          transition-colors focus:outline-none focus:ring-2
          dark:bg-zinc-900
          ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800'
              : 'border-zinc-300 focus:border-blue-500 focus:ring-blue-200 dark:border-zinc-700 dark:focus:ring-blue-800'
          }
          ${disabled ? 'cursor-not-allowed bg-zinc-100 dark:bg-zinc-800' : ''}
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
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{helperText}</p>
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
        className="mt-1 h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700"
      />
      <div>
        <label
          htmlFor={id}
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          {label}
        </label>
        {helperText && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {helperText}
          </p>
        )}
      </div>
    </div>
  );
}
