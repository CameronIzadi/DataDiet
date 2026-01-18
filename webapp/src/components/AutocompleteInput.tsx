'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check } from 'lucide-react';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  icon?: React.ReactNode;
  label?: string;
  required?: boolean;
  className?: string;
}

export function AutocompleteInput({
  value,
  onChange,
  options,
  placeholder = 'Search...',
  icon,
  label,
  required = false,
  className = '',
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 8); // Limit to 8 results for performance

  // Sync search term with value when value changes externally
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions.length]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current && highlightedIndex >= 0) {
      const items = listRef.current.querySelectorAll('li');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSelect = (option: string) => {
    setSearchTerm(option);
    onChange(option);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Delay closing to allow click on option
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500 transition-colors group-focus-within:text-sage-600 dark:group-focus-within:text-sage-400">
            {icon}
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-4 bg-neutral-50 dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-900 focus:border-sage-500 dark:focus:border-sage-600 focus:ring-4 focus:ring-sage-100 dark:focus:ring-sage-900/30 transition-all outline-none`}
          autoComplete="off"
        />
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 dark:text-neutral-600" />
      </div>

      <AnimatePresence>
        {isOpen && filteredOptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden"
          >
            <ul
              ref={listRef}
              className="max-h-64 overflow-y-auto py-2"
              role="listbox"
            >
              {filteredOptions.map((option, index) => (
                <li
                  key={option}
                  role="option"
                  aria-selected={index === highlightedIndex}
                  onClick={() => handleSelect(option)}
                  className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${
                    index === highlightedIndex
                      ? 'bg-sage-50 dark:bg-sage-950/30 text-sage-700 dark:text-sage-300'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span className="truncate">{option}</span>
                  {value === option && (
                    <Check className="w-4 h-4 text-sage-600 dark:text-sage-400 flex-shrink-0 ml-2" />
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && searchTerm && filteredOptions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-50 w-full mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl p-4"
        >
          <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
            No matches found. You can enter a custom value.
          </p>
        </motion.div>
      )}
    </div>
  );
}
