import fs from 'fs/promises';
import path from 'path';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { NewsCard } from '@/components/NewsCard';
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 max-w-3xl">
        {news.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">まだニュースがありません。更新を待っています...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {news.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
