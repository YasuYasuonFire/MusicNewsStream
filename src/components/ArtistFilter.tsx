'use client';

import { useState } from 'react';
import { Users, X } from 'lucide-react';
import { formatArtistName } from '@/lib/utils';

interface ArtistFilterProps {
  artists: string[];
  selectedArtists: Set<string>;
  onArtistToggle: (artist: string) => void;
  onClearArtists: () => void;
}

export function ArtistFilter({
  artists,
  selectedArtists,
  onArtistToggle,
  onClearArtists
}: ArtistFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  // アーティストがいない場合は何も表示しない
  if (artists.length === 0) {
    return null;
  }

  const selectedCount = selectedArtists.size;
  const isAllSelected = selectedCount === 0;

  return (
    <div className="relative">
      {/* Desktop Filters */}
      <div className="hidden md:flex items-center gap-2 flex-wrap">
        <button
          onClick={onClearArtists}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
            isAllSelected
              ? 'bg-[#ff3c38] text-white'
              : 'bg-[#1a1a1a] text-[#808080] hover:text-white hover:bg-[#242424]'
          }`}
          aria-pressed={isAllSelected}
          aria-label="すべてのアーティスト"
        >
          すべて
        </button>
        {artists.slice(0, 5).map((artist, index) => {
          const isSelected = selectedArtists.has(artist);
          return (
            <button
              key={artist}
              onClick={() => onArtistToggle(artist)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 animate-fadeInUp ${
                isSelected
                  ? 'bg-[#ff3c38] text-white'
                  : 'bg-[#1a1a1a] text-[#808080] hover:text-white hover:bg-[#242424]'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
              aria-pressed={isSelected}
              aria-label={`${formatArtistName(artist)}を${isSelected ? '選択解除' : '選択'}`}
            >
              {formatArtistName(artist)}
            </button>
          );
        })}
        {selectedCount > 0 && (
          <span className="ml-2 px-3 py-1 bg-[#1a1a1a] text-[#ff3c38] text-xs font-bold rounded-full animate-fadeInUp">
            {selectedCount} 選択中
          </span>
        )}
      </div>

      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white text-sm"
        aria-label="アーティストフィルターを開く"
      >
        <Users className="w-4 h-4" />
        <span>アーティスト</span>
        {selectedCount > 0 && (
          <span className="ml-1 px-2 py-0.5 bg-[#ff3c38] text-white text-xs font-bold rounded-full">
            {selectedCount}
          </span>
        )}
      </button>

      {/* Mobile Filter Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-[#121212] rounded-t-2xl p-6 animate-slideInUp max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-lg">アーティスト</h3>
                {selectedCount > 0 && (
                  <span className="px-2 py-1 bg-[#ff3c38] text-white text-xs font-bold rounded-full">
                    {selectedCount} 選択中
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-[#808080] hover:text-white transition-colors"
                aria-label="閉じる"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    onClearArtists();
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    isAllSelected
                      ? 'bg-[#ff3c38] text-white'
                      : 'bg-[#1a1a1a] text-white'
                  }`}
                  aria-pressed={isAllSelected}
                >
                  すべて
                </button>
                {artists.map((artist) => {
                  const isSelected = selectedArtists.has(artist);
                  return (
                    <button
                      key={artist}
                      onClick={() => onArtistToggle(artist)}
                      className={`px-4 py-2 text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-[#ff3c38] text-white'
                          : 'bg-[#1a1a1a] text-white'
                      }`}
                      aria-pressed={isSelected}
                    >
                      {formatArtistName(artist)}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedCount > 0 && (
              <button
                onClick={() => {
                  onClearArtists();
                  setIsOpen(false);
                }}
                className="w-full py-2 text-center text-[#ff3c38] hover:text-white text-sm font-medium transition-colors"
              >
                フィルターをクリア
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
