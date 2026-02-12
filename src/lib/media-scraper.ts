import type { SearchResult } from './brave-search';
import type { ArtistConfig } from '../types/artist';

interface ScrapedArticle {
  title: string;
  url: string;
  date: string | null;
  source: string;
}

/**
 * 音楽ナタリーのアーティストページから最新記事を取得
 */
async function scrapeNatalie(artistPagePath: string): Promise<ScrapedArticle[]> {
  const url = `https://natalie.mu${artistPagePath}`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MusicNewsStream/1.0 (News Aggregator)',
        'Accept': 'text/html',
      },
    });
    if (!response.ok) {
      console.warn(`[MediaScraper] Natalie returned ${response.status} for ${url}`);
      return [];
    }
    const html = await response.text();

    const articles: ScrapedArticle[] = [];
    // ニュース記事リンクを抽出: /music/news/数字
    const linkRegex = /href="(\/music\/news\/(\d+))"/g;
    const matches = new Set<string>();
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      matches.add(match[1]);
    }

    for (const path of matches) {
      // リンク周辺のテキストからタイトルを抽出
      const titleRegex = new RegExp(
        `href="${path.replace('/', '\\/')}"[^>]*>([^<]+)`,
        'g'
      );
      const titleMatch = titleRegex.exec(html);
      const title = titleMatch ? titleMatch[1].trim() : '';
      if (!title || title.length < 5) continue;

      // 日付を探す: 「X月X日」または「2026年X月X日」形式
      const articleIndex = html.indexOf(path);
      const surrounding = html.substring(
        Math.max(0, articleIndex - 200),
        Math.min(html.length, articleIndex + 500)
      );

      let date: string | null = null;
      // YYYY年M月D日
      const fullDateMatch = surrounding.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
      if (fullDateMatch) {
        const [, year, month, day] = fullDateMatch;
        date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } else {
        // M月D日 (年なし: 今年と仮定)
        const shortDateMatch = surrounding.match(/(\d{1,2})月(\d{1,2})日/);
        if (shortDateMatch) {
          const [, month, day] = shortDateMatch;
          const year = new Date().getFullYear();
          date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }

      articles.push({
        title,
        url: `https://natalie.mu${path}`,
        date,
        source: '音楽ナタリー',
      });
    }

    return articles;
  } catch (error) {
    console.warn(`[MediaScraper] Failed to scrape Natalie:`, error);
    return [];
  }
}

/**
 * BARKSのアーティストページから最新記事を取得
 */
async function scrapeBarks(artistPagePath: string): Promise<ScrapedArticle[]> {
  const url = `https://www.barks.jp${artistPagePath}`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MusicNewsStream/1.0 (News Aggregator)',
        'Accept': 'text/html',
      },
    });
    if (!response.ok) {
      console.warn(`[MediaScraper] BARKS returned ${response.status} for ${url}`);
      return [];
    }
    const html = await response.text();

    const articles: ScrapedArticle[] = [];
    // ニュース記事リンクを抽出: /news/数字/ または /news/?id=数字
    const linkRegex = /href="(\/news\/(\d+)\/?[^"]*)"/g;
    const matches = new Set<string>();
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      matches.add(match[1]);
    }

    for (const path of matches) {
      const escapedPath = path.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
      const titleRegex = new RegExp(
        `href="${escapedPath}"[^>]*>([^<]+)`,
        'g'
      );
      const titleMatch = titleRegex.exec(html);
      const title = titleMatch ? titleMatch[1].trim() : '';
      if (!title || title.length < 5) continue;

      // 日付: YYYY.MM.DD形式
      const articleIndex = html.indexOf(path);
      const surrounding = html.substring(
        Math.max(0, articleIndex - 200),
        Math.min(html.length, articleIndex + 500)
      );

      let date: string | null = null;
      const dateMatch = surrounding.match(/(\d{4})\.(\d{2})\.(\d{2})/);
      if (dateMatch) {
        const [, year, month, day] = dateMatch;
        date = `${year}-${month}-${day}`;
      }

      const fullUrl = path.startsWith('http') ? path : `https://www.barks.jp${path}`;
      articles.push({
        title,
        url: fullUrl,
        date,
        source: 'BARKS',
      });
    }

    return articles;
  } catch (error) {
    console.warn(`[MediaScraper] Failed to scrape BARKS:`, error);
    return [];
  }
}

/**
 * アーティストの設定に基づいて主要音楽メディアから記事を取得
 */
export async function scrapeMediaPages(artist: ArtistConfig): Promise<SearchResult[]> {
  const allArticles: ScrapedArticle[] = [];

  if (artist.mediaPages.natalie) {
    console.log(`   [MediaScraper] Scraping Natalie: ${artist.mediaPages.natalie}`);
    const natalieArticles = await scrapeNatalie(artist.mediaPages.natalie);
    console.log(`   [MediaScraper] Natalie: found ${natalieArticles.length} articles`);
    allArticles.push(...natalieArticles);
  }

  if (artist.mediaPages.barks) {
    console.log(`   [MediaScraper] Scraping BARKS: ${artist.mediaPages.barks}`);
    const barksArticles = await scrapeBarks(artist.mediaPages.barks);
    console.log(`   [MediaScraper] BARKS: found ${barksArticles.length} articles`);
    allArticles.push(...barksArticles);
  }

  // SearchResult型に変換
  return allArticles.map(article => ({
    title: article.title,
    url: article.url,
    description: article.title, // スクレイピングではスニペットが取れないのでタイトルを使用
    age: article.date ? `Published ${article.date}` : undefined,
    meta_url: {
      hostname: new URL(article.url).hostname,
    },
  }));
}
