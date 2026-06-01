import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  name: string;
  slug: string;
}

interface MultiSelectDropdownProps {
  label: string;
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export const MultiSelectDropdown = ({
  label,
  options,
  selectedValues = [],
  onChange,
  placeholder = "Select options"
}: MultiSelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (slug: string) => {
    const isSelected = selectedValues.includes(slug);
    let newValues: string[];
    if (isSelected) {
      newValues = selectedValues.filter(v => v !== slug);
    } else {
      newValues = [...selectedValues, slug];
    }
    onChange(newValues);
  };

  const getButtonText = () => {
    if (selectedValues.length === 0) return placeholder;
    const names = selectedValues
      .map(val => options.find(opt => opt.slug === val)?.name)
      .filter(Boolean);
    return names.length > 0 ? names.join(", ") : placeholder;
  };

  return (
    <div className="relative space-y-2 w-full" ref={dropdownRef}>
      <label className="text-sm font-bold ml-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary/50 border-none rounded-2xl text-left focus:ring-2 focus:ring-primary/20 transition-all font-medium h-[48px]"
      >
        <span className="truncate text-foreground max-w-[90%] text-sm">
          {getButtonText()}
        </span>
        <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border shadow-xl rounded-2xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150 p-2 space-y-1">
          {options.length > 0 ? (
            options.map((opt) => {
              const isSelected = selectedValues.includes(opt.slug);
              return (
                <button
                  key={opt.slug}
                  type="button"
                  onClick={() => handleToggle(opt.slug)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-colors text-left ${
                    isSelected ? "bg-primary/10 text-primary" : "hover:bg-secondary/50 text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-border cursor-pointer"
                    />
                    <span>{opt.name}</span>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              );
            })
          ) : (
            <div className="text-center text-xs text-muted-foreground py-4">No categories available</div>
          )}
        </div>
      )}
    </div>
  );
};
