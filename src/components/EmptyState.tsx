'use client';

import { FilterX } from 'lucide-react';
import { formatArtistName } from '@/lib/utils';

interface EmptyStateProps {
  category: string | null;
  artists: string[];
  onClearFilters: () => void;
}

export function EmptyState({ category, artists, onClearFilters }: EmptyStateProps) {
  const hasFilters = category !== null || artists.length > 0;

  // フィルター適用時のメッセージ
  const getFilterMessage = () => {
    const categoryPart = category || 'すべて';
    const artistPart = artists.length > 0
      ? artists.map(formatArtistName).join(', ') + 'の'
      : '';

    return `${categoryPart}カテゴリで${artistPart}ニュースが見つかりません`;
  };

  const message = hasFilters ? getFilterMessage() : 'ニュースがありません';
  const description = hasFilters
    ? 'フィルターを変更してください'
    : 'まだニュースがありません。更新を待っています...';

  return (
    <div className="text-center py-20 animate-fadeInUp">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#1a1a1a] flex items-center justify-center">
        {hasFilters ? (
          <FilterX className="w-10 h-10 text-[#4a4a4a]" />
        ) : (
          <svg
            className="w-10 h-10 text-[#4a4a4a]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
        )}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{message}</h3>
      <p className="text-[#808080] mb-6">{description}</p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="px-6 py-2 bg-[#1a1a1a] hover:bg-[#242424] text-white text-sm font-medium transition-all duration-300 border border-white/10 hover:border-[#ff3c38]/30"
        >
          フィルターをリセット
        </button>
      )}
    </div>
  );
}
