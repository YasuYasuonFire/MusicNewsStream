import { z } from 'zod';

// Brave Search API Response Schema (Partial)
const SearchResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  description: z.string(),
  age: z.string().optional(), // e.g. "12 hours ago", "May 20, 2024"
  page_age: z.string().optional(),
  meta_url: z.object({
    hostname: z.string(),
    favicon: z.string().optional(),
  }).optional(),
  thumbnail: z.object({
    src: z.string(),
  }).optional(),
});

const BraveResponseSchema = z.object({
  web: z.object({
    results: z.array(SearchResultSchema),
  }).optional(),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

// 検索オプション
export interface BraveSearchOptions {
  /** 結果の取得件数 (default: 10) */
  count?: number;
  /** 鮮度フィルター: pd=過去24時間, pw=過去1週間, pm=過去1か月, py=過去1年 (default: pw) */
  freshness?: 'pd' | 'pw' | 'pm' | 'py';
  /** 言語コード (例: 'ja', 'en') */
  language?: string;
  /** 国コード (例: 'JP', 'US') */
  country?: string;
  /** ニュースキーワードを自動付与するか (default: false) */
  appendNewsKeywords?: boolean;
  /** 日本語キーワードを付与するか (default: false) */
  appendJapaneseKeywords?: boolean;
}

// ニュース検索用のキーワード
const NEWS_KEYWORDS_EN = ['news', 'latest', 'update', 'announcement'];
const NEWS_KEYWORDS_JA = ['ニュース', '最新', '速報', '情報'];
const MUSIC_NEWS_KEYWORDS_EN = ['release', 'tour', 'interview', 'album', 'concert'];
const MUSIC_NEWS_KEYWORDS_JA = ['リリース', 'ツアー', 'インタビュー', 'アルバム', 'ライブ', '新曲'];

export class BraveSearchClient {
  private apiKey: string;
  private baseUrl = 'https://api.search.brave.com/res/v1/web/search';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * クエリを拡張してニュース/最新情報を取得しやすくする
   */
  private buildEnhancedQuery(baseQuery: string, options: BraveSearchOptions): string {
    let query = baseQuery;

    if (options.appendNewsKeywords) {
      // 英語ニュースキーワードを追加
      const newsKeyword = NEWS_KEYWORDS_EN[0];
      query = `${query} ${newsKeyword}`;
    }

    if (options.appendJapaneseKeywords) {
      // 日本語ニュースキーワードを追加
      const japaneseKeywords = NEWS_KEYWORDS_JA.slice(0, 2).join(' ');
      query = `${query} ${japaneseKeywords}`;
    }

    return query;
  }

  /**
   * 基本の検索メソッド
   */
  async search(query: string, options: BraveSearchOptions = {}): Promise<SearchResult[]> {
    const {
      count = 10,
      freshness = 'pw',
      language,
      country,
      appendNewsKeywords = false,
      appendJapaneseKeywords = false,
    } = options;

    // クエリの拡張
    const enhancedQuery = this.buildEnhancedQuery(query, { appendNewsKeywords, appendJapaneseKeywords });

    const url = new URL(this.baseUrl);
    url.searchParams.append('q', enhancedQuery);
    url.searchParams.append('count', count.toString());
    url.searchParams.append('freshness', freshness);
    url.searchParams.append('text_decorations', '0');
    url.searchParams.append('result_filter', 'web');
    
    // 言語・国の指定
    if (language) {
      url.searchParams.append('search_lang', language);
    }
    if (country) {
      url.searchParams.append('country', country);
    }

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Brave Search API Error: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      const parsed = BraveResponseSchema.parse(json);
      
      return parsed.web?.results || [];
    } catch (error) {
      console.error('Failed to fetch from Brave Search:', error);
      return [];
    }
  }

  /**
   * 音楽ニュース専用の検索メソッド
   * 日本語と英語の両方のキーワードで網羅的に検索
   */
  async searchMusicNews(artistName: string, options: Omit<BraveSearchOptions, 'appendNewsKeywords' | 'appendJapaneseKeywords'> = {}): Promise<SearchResult[]> {
    const { count = 20, freshness = 'pw' } = options;
    const allResults: SearchResult[] = [];
    const seenUrls = new Set<string>();

    // 検索クエリのバリエーションを作成
    const queries = [
      // 英語クエリ（国際的なニュース用）
      `"${artistName}" ${NEWS_KEYWORDS_EN.slice(0, 2).join(' ')} ${MUSIC_NEWS_KEYWORDS_EN.slice(0, 3).join(' ')}`,
      // 日本語クエリ（日本のニュース用）
      `"${artistName}" ${NEWS_KEYWORDS_JA.slice(0, 2).join(' ')} ${MUSIC_NEWS_KEYWORDS_JA.slice(0, 3).join(' ')}`,
      // シンプルな最新ニュースクエリ
      `"${artistName}" 最新ニュース`,
      `"${artistName}" latest news`,
    ];

    // 各クエリで検索を実行（重複を除去しながら結果を集約）
    for (const query of queries) {
      try {
        const results = await this.search(query, {
          count: Math.ceil(count / queries.length),
          freshness,
          ...options,
        });

        for (const result of results) {
          if (!seenUrls.has(result.url)) {
            seenUrls.add(result.url);
            allResults.push(result);
          }
        }

        // APIレート制限への配慮
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to search with query "${query}":`, error);
      }
    }

    return allResults.slice(0, count);
  }
}

