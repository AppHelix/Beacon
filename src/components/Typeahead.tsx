'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, X } from 'lucide-react';

interface TypeaheadOption {
  value: string;
  label: string;
  meta?: string; // Optional metadata (e.g., category, count)
}

interface TypeaheadProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (option: TypeaheadOption) => void;
  getSuggestions: (query: string) => TypeaheadOption[] | Promise<TypeaheadOption[]>;
  placeholder?: string;
  debounceMs?: number;
  minChars?: number;
  maxSuggestions?: number;
  className?: string;
}

export function Typeahead({
  value,
  onChange,
  onSelect,
  getSuggestions,
  placeholder = 'Search...',
  debounceMs = 300,
  minChars = 2,
  maxSuggestions = 10,
  className = '',
}: TypeaheadProps) {
  const [suggestions, setSuggestions] = useState<TypeaheadOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.length < minChars) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    timeoutRef.current = setTimeout(async () => {
      try {
        const results = await getSuggestions(value);
        const limited = results.slice(0, maxSuggestions);
        setSuggestions(limited);
        setIsOpen(limited.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, minChars, debounceMs, getSuggestions, maxSuggestions]);

  const handleSelect = (option: TypeaheadOption) => {
    onChange(option.value);
    setIsOpen(false);
    onSelect?.(option);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-80 overflow-y-auto shadow-lg">
          <ul className="py-1">
            {suggestions.map((option, index) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`
                  px-4 py-2 cursor-pointer transition-colors
                  ${index === selectedIndex 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'hover:bg-slate-50'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option.label}</span>
                  {option.meta && (
                    <span className="text-xs text-slate-500">{option.meta}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
