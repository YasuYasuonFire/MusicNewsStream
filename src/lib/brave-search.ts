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

export class BraveSearchClient {
  private apiKey: string;
  private baseUrl = 'https://api.search.brave.com/res/v1/web/search';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(query: string, count: number = 10): Promise<SearchResult[]> {
    // "freshness": "pw" (Past Week) - 取りこぼしを防ぐため1週間分取得し、あとでフィルタする
    const url = new URL(this.baseUrl);
    url.searchParams.append('q', query);
    url.searchParams.append('count', count.toString());
    url.searchParams.append('freshness', 'pw'); 
    url.searchParams.append('text_decorations', '0');
    url.searchParams.append('result_filter', 'web');

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
}

