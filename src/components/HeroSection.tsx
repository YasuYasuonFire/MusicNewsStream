'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ArrowRight, Clock, Image as ImageIcon } from 'lucide-react';
import { NewsItem } from '@/lib/llm';

interface HeroSectionProps {
  article: NewsItem & { artist: string; id: string; fetchedAt?: string };
}

function getCategoryClass(category: string): string {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('release') || categoryLower.includes('リリース')) return 'tag-release';
  if (categoryLower.includes('tour') || categoryLower.includes('ライブ') || categoryLower.includes('ツアー')) return 'tag-tour';
  if (categoryLower.includes('interview') || categoryLower.includes('インタビュー')) return 'tag-interview';
  if (categoryLower.includes('review') || categoryLower.includes('レビュー')) return 'tag-review';
  return 'tag-news';
}

export function HeroSection({ article }: HeroSectionProps) {
  const rawDate = article.date || article.fetchedAt || '';
  const formattedDate = (() => {
    if (!rawDate) return '';
    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) return rawDate;
    return format(parsed, 'yyyy年M月d日', { locale: ja });
  })();

  return (
    <section className="relative min-h-[100vh] flex items-center pt-20">
      {/* Background */}
      <div className="absolute inset-0">
        {article.imageUrl && !article.imageUrl.startsWith('data:') ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] via-[#121212] to-[#0a0a0a]">
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-48 h-48 text-[#1a1a1a]" />
            </div>
          </div>
        )}
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-[#0a0a0a]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-transparent" />
        
        {/* Animated Glow Effect */}
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[#ff3c38]/10 blur-[100px] animate-pulse" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />

      {/* Content */}
      <div className="relative container mx-auto px-4 md:px-6 max-w-7xl py-20 md:py-32">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="flex flex-wrap items-center gap-3 mb-6 animate-fadeInUp">
            <span className="px-3 py-1 bg-[#ff3c38] text-white text-xs font-bold uppercase tracking-wider">
              Featured
            </span>
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${getCategoryClass(article.category)}`}>
              {article.category}
            </span>
            <span className="flex items-center gap-2 text-white/60 text-sm">
              <Clock className="w-4 h-4" />
              {formattedDate}
            </span>
          </div>

          {/* Artist */}
          <div className="mb-4 animate-fadeInUp stagger-1" style={{ animationDelay: '0.1s' }}>
            <span className="text-[#ff3c38] font-bold text-lg md:text-xl uppercase tracking-widest">
              {article.artist}
            </span>
          </div>

          {/* Title */}
          <h1 
            className="font-[var(--font-oswald)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 animate-fadeInUp stagger-2"
            style={{ animationDelay: '0.2s' }}
          >
            {article.title}
          </h1>

          {/* Summary */}
          <p 
            className="text-white/70 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed animate-fadeInUp stagger-3"
            style={{ animationDelay: '0.3s' }}
          >
            {article.summary}
          </p>

          {/* CTA Buttons */}
          <div 
            className="flex flex-wrap gap-4 animate-fadeInUp stagger-4"
            style={{ animationDelay: '0.4s' }}
          >
            <Link
              href={`/article/${article.id}`}
              className="btn-primary inline-flex items-center gap-2 text-sm md:text-base"
            >
              <span>続きを読む</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#news"
              className="btn-outline inline-flex items-center gap-2 text-sm md:text-base"
            >
              <span>最新ニュース</span>
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/40 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Side Info Panel */}
      <div className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-6">
        <div className="w-px h-20 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        <span className="text-white/40 text-xs uppercase tracking-widest rotate-90 origin-center whitespace-nowrap">
          {article.source}
        </span>
        <div className="w-px h-20 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      </div>
    </section>
  );
}
