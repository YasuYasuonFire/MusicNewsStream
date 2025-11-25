import fs from 'fs/promises';
import path from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ArrowLeft, Clock, User, ExternalLink, Share2, Calendar, Tag, Music } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { NewsItem } from '@/lib/llm';

interface SavedNewsItem extends NewsItem {
  id: string;
  artist: string;
  fetchedAt: string;
}

async function getArticle(id: string): Promise<SavedNewsItem | null> {
  const filePath = path.join(process.cwd(), 'src/data/news.json');
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const news = JSON.parse(raw) as SavedNewsItem[];
    return news.find(item => item.id === id) || null;
  } catch {
    return null;
  }
}

async function getRelatedArticles(currentId: string, artist: string): Promise<SavedNewsItem[]> {
  const filePath = path.join(process.cwd(), 'src/data/news.json');
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const news = JSON.parse(raw) as SavedNewsItem[];
    return news
      .filter(item => item.id !== currentId && item.artist.toLowerCase() === artist.toLowerCase())
      .slice(0, 3);
  } catch {
    return [];
  }
}

function getCategoryClass(category: string): string {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('release') || categoryLower.includes('リリース')) return 'tag-release';
  if (categoryLower.includes('tour') || categoryLower.includes('ライブ') || categoryLower.includes('ツアー')) return 'tag-tour';
  if (categoryLower.includes('interview') || categoryLower.includes('インタビュー')) return 'tag-interview';
  if (categoryLower.includes('review') || categoryLower.includes('レビュー')) return 'tag-review';
  return 'tag-news';
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(id, article.artist);
  
  const rawDate = article.date || article.fetchedAt || '';
  const formattedDate = (() => {
    if (!rawDate) return '';
    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) return rawDate;
    return format(parsed, 'yyyy年M月d日', { locale: ja });
  })();

  // Check if URL is perplexity (should not show external link)
  const isPerplexityLink = article.url?.includes('perplexity.ai');
  const hasValidExternalLink = article.url && !isPerplexityLink;

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header />
      
      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <div className="relative min-h-[50vh] md:min-h-[60vh] flex items-end">
          {/* Background Image */}
          <div className="absolute inset-0">
            {article.imageUrl && !article.imageUrl.startsWith('data:') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]" />
            )}
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative container mx-auto px-4 md:px-6 max-w-4xl pb-10 md:pb-16">
            {/* Back Link */}
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-[#808080] hover:text-white transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">ホームに戻る</span>
            </Link>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${getCategoryClass(article.category)}`}>
                {article.category}
              </span>
              <span className="flex items-center gap-1 text-sm text-white/60">
                <Calendar className="w-4 h-4" />
                {formattedDate}
              </span>
            </div>

            {/* Artist */}
            <div className="flex items-center gap-2 mb-4">
              <Music className="w-5 h-5 text-[#ff3c38]" />
              <span className="text-[#ff3c38] font-bold text-lg uppercase tracking-wider">
                {article.artist}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-[var(--font-oswald)] text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight animate-fadeInUp">
              {article.title}
            </h1>
          </div>
        </div>

        {/* Article Content */}
        <div className="container mx-auto px-4 md:px-6 max-w-4xl py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
            {/* Main Content */}
            <article className="animate-fadeInUp stagger-2">
              {/* Summary / Lead */}
              <div className="mb-8 p-6 bg-[#1a1a1a] border-l-4 border-[#ff3c38]">
                <p className="text-xl text-white/90 leading-relaxed font-medium">
                  {article.summary}
                </p>
              </div>

              {/* Extended Content */}
              <div className="prose prose-invert prose-lg max-w-none">
                <p className="text-[#e0e0e0] leading-relaxed">
                  {article.summary}
                </p>
                
                {/* Additional context section */}
                <div className="mt-8 p-6 bg-[#121212] rounded-lg">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-[#ff3c38]" />
                    ニュースについて
                  </h3>
                  <p className="text-[#808080] text-sm leading-relaxed">
                    このニュースは、{article.artist}に関する最新情報です。
                    カテゴリー「{article.category}」として分類されており、
                    {article.source}を情報源としています。
                  </p>
                </div>

                {/* Source Link */}
                {hasValidExternalLink && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-[#ff3c38]/10 to-transparent border border-[#ff3c38]/20 rounded-lg">
                    <h3 className="text-white font-bold text-lg mb-3">
                      オリジナル記事を読む
                    </h3>
                    <p className="text-[#808080] text-sm mb-4">
                      詳細は{article.source}の元記事をご確認ください。
                    </p>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 btn-primary text-sm"
                    >
                      <span>元記事へ</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>

              {/* Share Section */}
              <div className="mt-10 pt-8 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-[#808080] text-sm">この記事をシェア</span>
                  <div className="flex items-center gap-3">
                    <button className="p-2 bg-[#1a1a1a] hover:bg-[#242424] text-[#808080] hover:text-white rounded transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 h-fit animate-fadeInUp stagger-3">
              {/* Source Info */}
              <div className="bg-[#1a1a1a] p-5 mb-6">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                  情報源
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-[#808080]" />
                    <span className="text-[#e0e0e0] text-sm">{article.source}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-[#808080]" />
                    <span className="text-[#e0e0e0] text-sm">{formattedDate}</span>
                  </div>
                </div>
              </div>

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <div className="bg-[#1a1a1a] p-5">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                    関連記事
                  </h3>
                  <div className="space-y-4">
                    {relatedArticles.map((related) => (
                      <Link 
                        key={related.id} 
                        href={`/article/${related.id}`}
                        className="block group"
                      >
                        <h4 className="text-[#e0e0e0] text-sm font-medium group-hover:text-[#ff3c38] transition-colors line-clamp-2">
                          {related.title}
                        </h4>
                        <span className="text-[#808080] text-xs mt-1 block">
                          {related.category}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), 'src/data/news.json');
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const news = JSON.parse(raw) as SavedNewsItem[];
    return news.map((item) => ({
      id: item.id,
    }));
  } catch {
    return [];
  }
}
