'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange
}: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Desktop Filters */}
      <div className="hidden md:flex items-center gap-2">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
            selectedCategory === null
              ? 'bg-[#ff3c38] text-white'
              : 'bg-[#1a1a1a] text-[#808080] hover:text-white hover:bg-[#242424]'
          }`}
        >
          すべて
        </button>
        {categories.slice(0, 5).map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
              selectedCategory === category
                ? 'bg-[#ff3c38] text-white'
                : 'bg-[#1a1a1a] text-[#808080] hover:text-white hover:bg-[#242424]'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white text-sm"
      >
        <Filter className="w-4 h-4" />
        <span>フィルター</span>
      </button>

      {/* Mobile Filter Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-[#121212] rounded-t-2xl p-6 animate-slideInUp">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-lg">フィルター</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-[#808080] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <h4 className="text-[#808080] text-xs uppercase tracking-wider mb-3">カテゴリー</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    onCategoryChange(null);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    selectedCategory === null
                      ? 'bg-[#ff3c38] text-white'
                      : 'bg-[#1a1a1a] text-white'
                  }`}
                >
                  すべて
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      onCategoryChange(category);
                      setIsOpen(false);
                    }}
                    className={`px-4 py-2 text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-[#ff3c38] text-white'
                        : 'bg-[#1a1a1a] text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
