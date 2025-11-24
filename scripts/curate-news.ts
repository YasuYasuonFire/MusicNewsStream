import fs from 'fs/promises';
import path from 'path';
import { BraveSearchClient } from '../src/lib/brave-search';
import { PerplexityClient } from '../src/lib/perplexity';
import { NewsCurator, type NewsItem } from '../src/lib/llm';

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

// ニュースデータの型定義 (保存用)
interface SavedNewsItem extends NewsItem {
  id: string;
  artist: string;
  fetchedAt: string;
}

async function main() {
  console.log('🚀 Starting Music News Curation...');

  // 1. アーティストリストの読み込み
  const artistsRaw = await fs.readFile(ARTISTS_FILE, 'utf-8');
  const artists: string[] = JSON.parse(artistsRaw);
  console.log(`📋 Found ${artists.length} artists: ${artists.join(', ')}`);

  // 2. 既存ニュースの読み込み
  let existingNews: SavedNewsItem[] = [];
  try {
    const newsRaw = await fs.readFile(NEWS_FILE, 'utf-8');
    existingNews = JSON.parse(newsRaw);
  } catch (error) {
    console.log('✨ No existing news file found. Creating new one.');
  }

  const braveClient = BRAVE_API_KEY ? new BraveSearchClient(BRAVE_API_KEY) : null;
  const perplexityClient = PERPLEXITY_API_KEY ? new PerplexityClient(PERPLEXITY_API_KEY) : null;
  const curator = new NewsCurator();
  const newItems: SavedNewsItem[] = [];

  // 3. 各アーティストについて処理
  for (const artist of artists) {
    console.log(`\n🔍 Searching for: ${artist}`);
    
    let searchResults: any[] = [];

    // Brave Search
    if (braveClient) {
      const query = `"${artist}" news music release tour interview`;
      const braveResults = await braveClient.search(query, 20);
      console.log(`   [Brave] Found ${braveResults.length} results.`);
      searchResults = [...searchResults, ...braveResults];
    }

    // Perplexity Search
    if (perplexityClient) {
      const query = `Latest music news about ${artist} (release, tour, interview) in this week.`;
      const perplexityResults = await perplexityClient.search(query);
      console.log(`   [Perplexity] Found response + ${perplexityResults.length - 1} citations.`);
      searchResults = [...searchResults, ...perplexityResults];
    }

    if (searchResults.length === 0) continue;

    // LLMによるキュレーション
    console.log(`   🤖 Curating with AI...`);    const curatedNews = await curator.curate(artist, searchResults);
    console.log(`   ✅ Extracted ${curatedNews.length} relevant news items.`);

    for (const item of curatedNews) {
      // 重複チェック (URL)
      const isDuplicate = existingNews.some(n => n.url === item.url) || newItems.some(n => n.url === item.url);
      if (!isDuplicate) {
        newItems.push({
          ...item,
          id: crypto.randomUUID(),
          artist,
          fetchedAt: new Date().toISOString(),
        });
      } else {
        console.log(`      Skipping duplicate: ${item.title}`);
      }
    }
    
    // APIレート制限への配慮 (少し待機)
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // 4. 結果の保存
  if (newItems.length > 0) {
    const allNews = [...newItems, ...existingNews];
    // 日付順（新しい順）にソート
    allNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    await fs.writeFile(NEWS_FILE, JSON.stringify(allNews, null, 2));
    console.log(`\n🎉 Successfully added ${newItems.length} new news items! Saved to ${NEWS_FILE}`);
  } else {
    console.log('\n😴 No new news found today.');
  }
}

main().catch(error => {
  console.error('Fatal Error:', error);
  process.exit(1);
});

