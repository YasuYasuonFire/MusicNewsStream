'use client';

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Image as ImageIcon, Clock, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { NewsItem } from '@/lib/llm';

interface NewsCardProps {
  item: NewsItem & { artist: string; id: string; fetchedAt?: string };
  variant?: 'default' | 'featured' | 'compact';
  index?: number;
}

function getCategoryClass(category: string): string {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('release') || categoryLower.includes('リリース')) return 'tag-release';
  if (categoryLower.includes('tour') || categoryLower.includes('ライブ') || categoryLower.includes('ツアー')) return 'tag-tour';
  if (categoryLower.includes('interview') || categoryLower.includes('インタビュー')) return 'tag-interview';
  if (categoryLower.includes('review') || categoryLower.includes('レビュー')) return 'tag-review';
  return 'tag-news';
}

export function NewsCard({ item, variant = 'default', index = 0 }: NewsCardProps) {
  const rawDate = item.date || item.fetchedAt || '';
  const formattedDate = (() => {
    if (!rawDate) return '';
    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) return rawDate;
    return format(parsed, 'yyyy年M月d日', { locale: ja });
  })();

  const linkHref = `/article/${item.id}`;

  if (variant === 'featured') {
    return (
      <article
        className={`group relative h-[500px] md:h-[600px] overflow-hidden animate-fadeInUp stagger-item`}
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <Link href={linkHref} className="block h-full">
          {/* Background Image */}
          <div className="absolute inset-0">
            {item.imageUrl && !item.imageUrl.startsWith('data:') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover card-image-hover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
                <ImageIcon className="w-24 h-24 text-[#242424]" />
              </div>
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            {/* Category & Date */}
            <div className="flex items-center gap-4 mb-4">
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${getCategoryClass(item.category)}`}>
                {item.category}
              </span>
              <span className="flex items-center gap-1 text-sm text-white/60">
                <Clock className="w-4 h-4" />
                {formattedDate}
              </span>
            </div>

            {/* Artist Tag */}
            <div className="mb-3">
              <span className="text-[#ff3c38] font-semibold text-sm uppercase tracking-wider">
                {item.artist}
              </span>
            </div>

            {/* Title */}
            <h2 className="font-[var(--font-oswald)] text-3xl md:text-5xl font-bold text-white leading-tight mb-4 group-hover:text-[#ff3c38] transition-colors duration-300">
              {item.title}
            </h2>

            {/* Summary */}
            <p className="text-white/70 text-base md:text-lg line-clamp-2 max-w-3xl">
              {item.summary}
            </p>

            {/* Read More */}
            <div className="mt-6 flex items-center gap-2 text-[#ff3c38] font-semibold uppercase tracking-wider text-sm">
              <span>続きを読む</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article
        className={`group flex gap-4 p-4 bg-[#1a1a1a] hover:bg-[#242424] transition-all duration-300 animate-fadeInUp stagger-item`}
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <Link href={linkHref} className="flex gap-4 w-full">
          {/* Thumbnail */}
          <div className="flex-shrink-0 w-20 h-20 overflow-hidden">
            {item.imageUrl && !item.imageUrl.startsWith('data:') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#242424] flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-[#4a4a4a]" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#ff3c38] text-xs font-semibold uppercase">
                {item.artist}
              </span>
              <span className="text-[#4a4a4a]">•</span>
              <span className="text-[#808080] text-xs">{formattedDate}</span>
            </div>
            <h3 className="text-white font-semibold text-sm group-hover:text-[#ff3c38] transition-colors line-clamp-2">
              {item.title}
            </h3>
          </div>
        </Link>
      </article>
    );
  }

  // Default Card
  return (
    <article
      className={`group card-hover bg-[#1a1a1a] overflow-hidden animate-fadeInUp stagger-item`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <Link href={linkHref} className="block">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-[#121212]">
          {item.imageUrl && !item.imageUrl.startsWith('data:') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover card-image-hover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
              <ImageIcon className="w-16 h-16 text-[#242424]" />
            </div>
          )}
          
          {/* Category Tag */}
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${getCategoryClass(item.category)}`}>
              {item.category}
            </span>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Meta */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#ff3c38] text-xs font-semibold uppercase tracking-wider">
              {item.artist}
            </span>
            <span className="text-[#808080] text-xs">{formattedDate}</span>
          </div>

          {/* Title */}
          <h2 className="font-semibold text-white text-lg leading-snug mb-3 group-hover:text-[#ff3c38] transition-colors duration-300 line-clamp-2">
            {item.title}
          </h2>

          {/* Summary */}
          <p className="text-[#808080] text-sm line-clamp-3 leading-relaxed">
            {item.summary}
          </p>

          {/* Source indicator */}
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-[#4a4a4a]">
              {item.source}
            </span>
            <div className="flex items-center gap-1 text-[#ff3c38] text-xs font-medium">
              <span>詳細</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
