import fs from 'fs/promises';
import path from 'path';
import { BraveSearchClient, type SearchResult } from '../src/lib/brave-search';
import { PerplexityClient } from '../src/lib/perplexity';
import { NewsCurator, type NewsItem } from '../src/lib/llm';
import { scrapeMediaPages } from '../src/lib/media-scraper';
import type { ArtistConfig } from '../src/types/artist';

// 環境変数チェック
const BRAVE_API_KEY = process.env.BRAVE_SEARCH_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

if (!GOOGLE_API_KEY) {
  console.error('Error: GOOGLE_GENERATIVE_AI_API_KEY is required.');
  process.exit(1);
}

if (!BRAVE_API_KEY && !PERPLEXITY_API_KEY) {
  console.error('Error: At least one of BRAVE_SEARCH_API_KEY or PERPLEXITY_API_KEY is required.');
  process.exit(1);
}

const ARTISTS_FILE = path.join(process.cwd(), 'src/data/artists.json');
const NEWS_FILE = path.join(process.cwd(), 'src/data/news.json');

// ブロックするドメイン（LLM送信前の前処理フィルタ）
const BLOCKED_DOMAINS = new Set([
  'wikipedia.org',
  'genius.com',
  'azlyrics.com',
  'uta-net.com',
  'j-lyric.net',
  'utamap.com',
  'ticketcamp.net',
  'viagogo.com',
  'stubhub.com',
  'ad-hoc-news.de',
  'discogs.com',
  'last.fm',
]);

// ニュースデータの型定義 (保存用)
interface SavedNewsItem extends NewsItem {
  id: string;
  artist: string;
  fetchedAt: string;
}

/**
 * LLM送信前の前処理フィルタ
 */
function preFilterResults(results: SearchResult[]): SearchResult[] {
  return results.filter(r => {
    let hostname = r.meta_url?.hostname || '';
    if (!hostname) {
      try { hostname = new URL(r.url).hostname; } catch { /* ignore */ }
    }

    // ブロックドメインを除外
    if (Array.from(BLOCKED_DOMAINS).some(d => hostname.endsWith(d))) {
      console.log(`      [Pre-filter] Blocked domain: ${hostname} (${r.title})`);
      return false;
    }

    // page_ageで明らかに古い記事を除外
    if (r.page_age) {
      const yearMatch = r.page_age.match(/P(\d+)Y/);
      if (yearMatch && parseInt(yearMatch[1]) >= 1) {
        console.log(`      [Pre-filter] Too old (${r.page_age}): ${r.title}`);
        return false;
      }
      const monthMatch = r.page_age.match(/P(\d+)M/);
      if (monthMatch && parseInt(monthMatch[1]) >= 2) {
        console.log(`      [Pre-filter] Too old (${r.page_age}): ${r.title}`);
        return false;
      }
    }

    return true;
  });
}

async function main() {
  console.log('Starting Music News Curation...');
  console.log('Enhanced search: Media scraping + Brave + Perplexity with improved accuracy');

  // 1. アーティストリストの読み込み
  const artistsRaw = await fs.readFile(ARTISTS_FILE, 'utf-8');
  const artists: ArtistConfig[] = JSON.parse(artistsRaw);
  console.log(`Found ${artists.length} artists: ${artists.map(a => a.name).join(', ')}`);

  // 2. ニュースリストの初期化（毎回クリア）
  const existingNews: SavedNewsItem[] = [];
  console.log('Clearing previous news data. Starting fresh.');

  const braveClient = BRAVE_API_KEY ? new BraveSearchClient(BRAVE_API_KEY) : null;
  const perplexityClient = PERPLEXITY_API_KEY ? new PerplexityClient(PERPLEXITY_API_KEY) : null;
  const curator = new NewsCurator();
  const newItems: SavedNewsItem[] = [];

  // 3. 各アーティストについて処理
  for (const artist of artists) {
    console.log(`\n--- Searching for: ${artist.name} (${artist.nameJa}) ---`);

    let searchResults: SearchResult[] = [];

    // メディアスクレイパー: ナタリー、BARKSなどの固定ソースから取得
    if (artist.mediaPages.natalie || artist.mediaPages.barks) {
      const mediaResults = await scrapeMediaPages(artist);
      searchResults = [...searchResults, ...mediaResults];
    }

    // Brave Search
    if (braveClient) {
      console.log(`   [Brave] Searching with enhanced queries...`);
      const braveResults = await braveClient.searchMusicNews(artist, {
        count: 30,
        freshness: 'pw',
      });
      console.log(`   [Brave] Found ${braveResults.length} results.`);
      searchResults = [...searchResults, ...braveResults];
    }

    // Perplexity Search
    if (perplexityClient) {
      console.log(`   [Perplexity] Searching with enhanced prompt...`);
      const perplexityResults = await perplexityClient.searchMusicNews(artist, {
        language: 'both',
      });
      console.log(`   [Perplexity] Found response + ${perplexityResults.length - 1} citations.`);
      searchResults = [...searchResults, ...perplexityResults];
    }

    if (searchResults.length === 0) continue;

    // URL重複除去
    const seenUrls = new Set<string>();
    const deduped = searchResults.filter(r => {
      if (seenUrls.has(r.url)) return false;
      seenUrls.add(r.url);
      return true;
    });

    // 前処理フィルタ
    const filteredResults = preFilterResults(deduped);

    // 統計ログ
    console.log(`   [Stats] Raw: ${searchResults.length} -> Deduped: ${deduped.length} -> Filtered: ${filteredResults.length}`);

    if (filteredResults.length === 0) continue;

    // LLMによるキュレーション
    console.log(`   [LLM] Curating with AI...`);
    const curatedNews = await curator.curate(artist, filteredResults);
    console.log(`   [LLM] Extracted ${curatedNews.length} relevant news items.`);

    for (const item of curatedNews) {
      // 重複チェック (URL)
      const isDuplicate = existingNews.some(n => n.url === item.url) || newItems.some(n => n.url === item.url);
      if (!isDuplicate) {
        let finalImageUrl = item.imageUrl;

        // 画像がない場合、AIで生成
        if (!finalImageUrl || finalImageUrl.trim() === '') {
          console.log(`      Generating thumbnail for: ${item.title}`);
          try {
            const generatedImage = await curator.generateImage(item);
            if (generatedImage) {
              finalImageUrl = generatedImage;
            }
          } catch {
            console.error('      Failed to generate image, skipping image generation.');
          }
        }

        newItems.push({
          ...item,
          imageUrl: finalImageUrl,
          id: crypto.randomUUID(),
          artist: artist.name,
          fetchedAt: new Date().toISOString(),
        });
      } else {
        console.log(`      Skipping duplicate: ${item.title}`);
      }
    }

    // 各記事の詳細ログ
    curatedNews.forEach(n => {
      console.log(`     - [importance:${n.importance}] ${n.date} ${n.title} (${n.source})`);
    });

    // APIレート制限への配慮
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // 4. 結果の保存
  if (newItems.length > 0) {
    const allNews = [...newItems, ...existingNews];
    // 日付順（新しい順）にソート
    allNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    await fs.writeFile(NEWS_FILE, JSON.stringify(allNews, null, 2));
    console.log(`\nSuccessfully added ${newItems.length} new news items! Saved to ${NEWS_FILE}`);
  } else {
    console.log('\nNo new news found today.');
  }
}

main().catch(error => {
  console.error('Fatal Error:', error);
  process.exit(1);
});
