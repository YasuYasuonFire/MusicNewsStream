import fs from 'fs/promises';
import path from 'path';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { NewsGrid } from '@/components/NewsGrid';
import { NewsItem } from '@/lib/llm';

// 型定義 (SavedNewsItem)
interface SavedNewsItem extends NewsItem {
  id: string;
  artist: string;
  fetchedAt: string;
}

async function getNews(): Promise<SavedNewsItem[]> {
  const filePath = path.join(process.cwd(), 'src/data/news.json');
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const news = JSON.parse(raw) as SavedNewsItem[];
    const toTimestamp = (item: SavedNewsItem) => {
      const rawDate = item.date || item.fetchedAt;
      if (!rawDate) return 0;
      const parsed = new Date(rawDate);
      return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
    };

    // 新しい順にソート済みであることを期待するが、念のため
    return news.sort((a, b) => toTimestamp(b) - toTimestamp(a));
  } catch (error) {
    console.warn('Failed to read news.json or file does not exist.', error);
    return [];
  }
}

export default async function Home() {
  const news = await getNews();

  // Get featured article (most recent with highest importance or first)
  const featuredArticle = news.length > 0 ? news[0] : null;

  // Get unique categories for filter
  const categories = Array.from(new Set(news.map(item => item.category)));

  // Get unique artists
  const artists = Array.from(new Set(news.map(item => item.artist)));

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section with Featured Article */}
        {featuredArticle ? (
          <HeroSection article={featuredArticle} />
        ) : (
          <div className="h-[60vh] flex items-center justify-center bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
            <div className="text-center">
              <h1 className="font-[var(--font-bebas-neue)] text-5xl md:text-7xl text-white mb-4">
                NOISE
              </h1>
              <p className="text-[#808080]">最新のオルタナティブロックニュースをお届け</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <section className="py-16 md:py-24 bg-[#0a0a0a]" id="news">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <NewsGrid
              news={news}
              featuredArticle={featuredArticle}
              categories={categories}
              artists={artists}
            />
          </div>
        </section>

        {/* Artists Section */}
        {artists.length > 0 && (
          <section className="py-16 md:py-20 bg-[#121212]" id="artists">
            <div className="container mx-auto px-4 md:px-6 max-w-7xl">
              <div className="mb-10">
                <span className="text-[#00d4ff] text-sm font-bold uppercase tracking-widest mb-2 block">
                  Featured Artists
                </span>
                <h2 className="font-[var(--font-oswald)] text-3xl md:text-4xl font-bold text-white">
                  注目アーティスト
                </h2>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {artists.map((artist) => (
                  <div
                    key={artist}
                    className="px-6 py-3 bg-[#1a1a1a] hover:bg-[#242424] border border-white/5 hover:border-[#ff3c38]/30 transition-all duration-300 cursor-pointer group"
                  >
                    <span className="text-white group-hover:text-[#ff3c38] transition-colors font-medium">
                      {artist}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Subscribe Section */}
        <section className="py-20 md:py-28 relative overflow-hidden" id="subscribe">
          {/* Background */}
          <div className="absolute inset-0 hero-gradient" />
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
          
          <div className="container mx-auto px-4 md:px-6 max-w-3xl relative z-10 text-center">
            <span className="text-[#ff3c38] text-sm font-bold uppercase tracking-widest mb-4 block">
              Stay Updated
            </span>
            <h2 className="font-[var(--font-oswald)] text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              最新ニュースを<br className="md:hidden" />見逃すな
            </h2>
            <p className="text-[#808080] text-lg mb-10 max-w-xl mx-auto">
              オルタナティブロックの最新情報をいち早くお届け。
              毎日のキュレーションニュースで、あなたの好きなアーティストを追いかけよう。
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="メールアドレス"
                className="w-full sm:flex-1 px-5 py-3 bg-[#1a1a1a] border border-white/10 text-white placeholder-[#808080] focus:outline-none focus:border-[#ff3c38] transition-colors"
              />
              <button className="w-full sm:w-auto btn-primary whitespace-nowrap">
                購読する
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
