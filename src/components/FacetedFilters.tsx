'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface Facet {
  id: string;
  label: string;
  options: FacetOption[];
  multiSelect?: boolean;
}

interface FacetedFiltersProps {
  facets: Facet[];
  selectedFilters: Record<string, string[]>;
  onChange: (facetId: string, selectedValues: string[]) => void;
  onClear?: () => void;
  className?: string;
}

export function FacetedFilters({
  facets,
  selectedFilters,
  onChange,
  onClear,
  className = '',
}: FacetedFiltersProps) {
  const toggleFilter = (facetId: string, value: string, multiSelect: boolean = true) => {
    const currentValues = selectedFilters[facetId] || [];
    
    if (multiSelect) {
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      onChange(facetId, newValues);
    } else {
      onChange(facetId, currentValues.includes(value) ? [] : [value]);
    }
  };

  const clearFacet = (facetId: string) => {
    onChange(facetId, []);
  };

  const hasActiveFilters = Object.values(selectedFilters).some(values => values.length > 0);
  const activeFilterCount = Object.values(selectedFilters).reduce(
    (sum, values) => sum + values.length,
    0
  );

  return (
    <div className={className}>
      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-700">
            Active Filters ({activeFilterCount}):
          </span>
          {Object.entries(selectedFilters).map(([facetId, values]) =>
            values.map(value => {
              const facet = facets.find(f => f.id === facetId);
              const option = facet?.options.find(o => o.value === value);
              return (
                <Badge
                  key={`${facetId}-${value}`}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {facet?.label}: {option?.label || value}
                  <button
                    onClick={() => toggleFilter(facetId, value, facet?.multiSelect)}
                    className="ml-1 hover:text-red-600"
                    aria-label={`Remove ${value} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })
          )}
          {onClear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-xs text-slate-600 hover:text-slate-900"
            >
              Clear All
            </Button>
          )}
        </div>
      )}

      {/* Facet Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {facets.map(facet => {
          const selectedValues = selectedFilters[facet.id] || [];
          const hasSelection = selectedValues.length > 0;

          return (
            <Card key={facet.id} className="border-slate-200">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-slate-900">
                    {facet.label}
                  </h3>
                  {hasSelection && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFacet(facet.id)}
                      className="h-6 px-2 text-xs text-slate-500 hover:text-slate-700"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {facet.options.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No options available</p>
                  ) : (
                    facet.options.map(option => {
                      const isSelected = selectedValues.includes(option.value);
                      return (
                        <label
                          key={option.value}
                          className={`
                            flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer
                            transition-colors hover:bg-slate-50
                            ${isSelected ? 'bg-indigo-50' : ''}
                          `}
                        >
                          <input
                            type={facet.multiSelect ? 'checkbox' : 'radio'}
                            checked={isSelected}
                            onChange={() => toggleFilter(facet.id, option.value, facet.multiSelect)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="flex-1 text-sm text-slate-700">
                            {option.label}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {option.count}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
