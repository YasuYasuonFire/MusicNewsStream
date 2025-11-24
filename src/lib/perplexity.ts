import { OpenAI } from 'openai';
import type { SearchResult } from './brave-search';

export class PerplexityClient {
  private client: OpenAI;
  private model = 'sonar'; // Cheap and fast model

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.perplexity.ai',
    });
  }

  async search(query: string): Promise<SearchResult[]> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful music news assistant. Search for the latest news and return a summary with citations.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        // @ts-ignore - Perplexity specific options
        return_citations: true,
      });

      const content = response.choices[0]?.message?.content || '';
      // @ts-ignore - Perplexity specific response structure
      const citations = response.citations || [];

      // Perplexityの回答自体を一つの「検索結果」として扱い、
      // 引用元URLも別個の検索結果としてリストアップする
      const results: SearchResult[] = [
        {
          title: `Perplexity AI Summary for: ${query}`,
          url: 'https://www.perplexity.ai/',
          description: content,
          age: 'Just now',
          meta_url: { hostname: 'perplexity.ai' }
        }
      ];

      // 引用元URLも検索結果として追加（内容までは取れないのでURLのみ）
      citations.forEach((url: string, index: number) => {
        results.push({
          title: `Source [${index + 1}] from Perplexity`,
          url: url,
          description: `Cited source for query: ${query}`,
          age: 'Unknown',
          meta_url: { hostname: new URL(url).hostname }
        });
      });

      return results;
    } catch (error) {
      console.error('Failed to fetch from Perplexity:', error);
      return [];
    }
  }
}

