'use client';

import { useState, useMemo } from 'react';
import { NewsCard } from './NewsCard';
import { CategoryFilter } from './CategoryFilter';
import { ArtistFilter } from './ArtistFilter';
import { EmptyState } from './EmptyState';

// SavedNewsItem型の定義
interface SavedNewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  imageUrl?: string;
  source: string;
  date: string;
  category: string;
  importance: number;
  artist: string;
  fetchedAt: string;
}

interface NewsGridProps {
  news: SavedNewsItem[];
  featuredArticle: SavedNewsItem | null;
  categories: string[];
  artists: string[];
}

export function NewsGrid({
  news,
  featuredArticle,
  categories,
  artists
}: NewsGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArtists, setSelectedArtists] = useState<Set<string>>(new Set());

  // フィルタリングロジック（AND条件）
  const filteredNews = useMemo(() => {
    return news.filter(item => {
      // フィーチャー記事を除外（ヒーローで既に表示）
      if (featuredArticle && item.id === featuredArticle.id) {
        return false;
      }

      // カテゴリマッチ
      const categoryMatch = selectedCategory === null || item.category === selectedCategory;

      // アーティストマッチ（マルチセレクトOR）
      const artistMatch = selectedArtists.size === 0 || selectedArtists.has(item.artist);

      // AND条件: 両方がマッチする必要がある
      return categoryMatch && artistMatch;
    });
  }, [news, selectedCategory, selectedArtists, featuredArticle]);

  // アーティストトグルハンドラー
  const handleArtistToggle = (artist: string) => {
    setSelectedArtists(prev => {
      const next = new Set(prev);
      if (next.has(artist)) {
        next.delete(artist);
      } else {
        next.add(artist);
      }
      return next;
    });
  };

  // すべてのフィルターをクリア
  const handleClearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedArtists(new Set());
  };

  return (
    <>
      {/* Section Header with Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <span className="text-[#ff3c38] text-sm font-bold uppercase tracking-widest mb-2 block">
            Latest News
          </span>
          <h2 className="font-[var(--font-oswald)] text-4xl md:text-5xl font-bold text-white">
            最新ニュース
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          <ArtistFilter
            artists={artists}
            selectedArtists={selectedArtists}
            onArtistToggle={handleArtistToggle}
            onClearArtists={() => setSelectedArtists(new Set())}
          />
        </div>
      </div>

      {/* News Grid or Empty State */}
      {filteredNews.length === 0 ? (
        <EmptyState
          category={selectedCategory}
          artists={Array.from(selectedArtists)}
          onClearFilters={handleClearAllFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item, index) => (
            <NewsCard key={item.id} item={item} index={index} />
          ))}
        </div>
      )}
    </>
  );
}
