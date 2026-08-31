import React from 'react';
import { Select, ListBox } from '@heroui/react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  id?: string;
  options: (string | SelectOption)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  id,
  options,
  value,
  onChange,
  placeholder = 'Sélectionnez une option',
  error = false,
  disabled = false,
  className = '',
}) => {
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  return (
    <Select
      id={id}
      selectedKey={value || null}
      onSelectionChange={(key) => {
        if (key !== null && key !== undefined) {
          onChange(String(key));
        }
      }}
      isDisabled={disabled}
      isInvalid={error}
      className={`w-full ${className}`}
    >
      <Select.Trigger
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm flex items-center justify-between text-start transition-all outline-none bg-white dark:bg-emc-elevated/90 text-slate-900 dark:text-emc-primary ${
          error
            ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-300 dark:ring-rose-500/40'
            : 'border-slate-200 dark:border-emc-border-strong hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30'
        } cursor-pointer`}
      >
        <Select.Value className="text-sm font-medium px-2 text-start leading-snug flex-1 truncate">
          {selectedOption ? (
            <span className="text-slate-900 dark:text-emc-primary">{selectedOption.label}</span>
          ) : (
            <span className="text-slate-400 dark:text-emc-muted-fg">{placeholder}</span>
          )}
        </Select.Value>
        <Select.Indicator className="flex-shrink-0">
          <ChevronDown className="w-4 h-4 text-slate-400 dark:text-emc-muted-fg" />
        </Select.Indicator>
      </Select.Trigger>
      <Select.Popover className="z-[100] bg-white dark:bg-emc-elevated border border-slate-200 dark:border-emc-border-strong shadow-2xl rounded-xl p-1.5 min-w-[220px]">
        <ListBox className="max-h-64 overflow-y-auto">
          {normalizedOptions.map((opt) => (
            <ListBox.Item
              key={opt.value}
              id={opt.value}
              textValue={opt.label}
              className="px-3 py-2.5 rounded-lg text-xs font-medium text-slate-800 dark:text-emc-primary hover:bg-slate-100 dark:hover:bg-emc-surface-hover/70 hover:text-slate-900 dark:hover:text-emc-primary cursor-pointer transition-colors"
            >
              {opt.label}
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
};
