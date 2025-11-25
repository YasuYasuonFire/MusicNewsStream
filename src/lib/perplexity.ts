import { OpenAI } from 'openai';
import type { SearchResult } from './brave-search';

// 検索オプション
export interface PerplexitySearchOptions {
  /** 言語設定: 'ja' = 日本語優先, 'en' = 英語優先, 'both' = 両方 (default: 'both') */
  language?: 'ja' | 'en' | 'both';
  /** 検索カテゴリ: 'music' = 音楽ニュース特化 (default: 'music') */
  category?: 'music' | 'general';
}

// システムプロンプト（音楽ニュース・日本語対応強化版）
const SYSTEM_PROMPT_MUSIC_JA = `あなたは音楽ニュースに特化した情報収集アシスタントです。

## 検索の指針
- **日本語と英語の両方**のソースから最新のニュースを検索してください
- 特に**日本のメディア**（音楽ナタリー、BARKS、RO69、Skream!、リアルサウンド、Billboard Japan、オリコンなど）からの情報を優先的に探してください
- 海外アーティストの場合も、日本語で書かれた記事があれば含めてください

## 収集対象のニュース
- 新曲・新アルバムのリリース情報
- ツアー・ライブ・フェス出演情報
- インタビュー・メディア出演情報
- コラボレーション・新プロジェクト
- 受賞・ランキング情報
- メンバーの活動情報

## 回答形式
- 各ニュースは**日付**と**出典**を明確に記載してください
- 最新の情報を優先して報告してください
- 必ず引用元URLを含めてください
- 回答は日本語で行ってください`;

const SYSTEM_PROMPT_MUSIC_EN = `You are a music news research assistant.

## Search Guidelines
- Search for the latest news from both Japanese and international sources
- For Japanese artists, prioritize Japanese media sources (Natalie, BARKS, RO69, Skream!, Real Sound, Billboard Japan, Oricon, etc.)
- Include both English and Japanese articles when available

## News Categories to Cover
- New song/album releases
- Tour, live shows, and festival appearances
- Interviews and media appearances
- Collaborations and new projects
- Awards and chart rankings
- Band member activities

## Response Format
- Include the date and source for each news item
- Prioritize the most recent information
- Always include citation URLs
- Respond in English`;

const SYSTEM_PROMPT_MUSIC_BOTH = `あなたは音楽ニュースに特化した多言語情報収集アシスタントです。

## 検索の指針
- **日本語と英語の両方**のソースから網羅的に最新のニュースを検索してください
- 日本のアーティストには日本のメディア（音楽ナタリー、BARKS、RO69、Skream!、リアルサウンド、Billboard Japan、オリコンなど）を優先
- 海外アーティストには国際メディア（Pitchfork、NME、Rolling Stone、Billboard、Stereogum など）も検索
- 同じニュースでも日本語と英語で異なる視点がある場合は両方を報告

## 収集対象のニュース
- 新曲・新アルバムのリリース情報（発売日、収録曲、特典情報など）
- ツアー・ライブ・フェス出演情報（日程、会場、チケット情報など）
- インタビュー・メディア出演情報
- コラボレーション・新プロジェクト
- 受賞・ランキング・チャート情報
- メンバーの個人活動・サイドプロジェクト

## 回答形式
- 各ニュースには**日付**と**出典名**を必ず記載してください
- 最新の情報（直近1週間以内）を優先して報告してください
- 必ず引用元URLを含めてください
- ニュースが見つからない場合は、その旨を正直に報告してください
- 回答は日本語で行ってください（ソースが英語でも要約は日本語で）`;

export class PerplexityClient {
  private client: OpenAI;
  private model = 'sonar'; // Cheap and fast model

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.perplexity.ai',
    });
  }

  /**
   * 言語設定に応じたシステムプロンプトを取得
   */
  private getSystemPrompt(options: PerplexitySearchOptions): string {
    const { language = 'both', category = 'music' } = options;
    
    if (category === 'general') {
      return 'あなたは情報収集アシスタントです。最新のニュースを検索し、日本語で要約してください。必ず引用元URLを含めてください。';
    }

    switch (language) {
      case 'ja':
        return SYSTEM_PROMPT_MUSIC_JA;
      case 'en':
        return SYSTEM_PROMPT_MUSIC_EN;
      case 'both':
      default:
        return SYSTEM_PROMPT_MUSIC_BOTH;
    }
  }

  /**
   * アーティスト名に応じた検索クエリを生成
   */
  private buildMusicNewsQuery(artistName: string, language: 'ja' | 'en' | 'both' = 'both'): string {
    if (language === 'ja') {
      return `「${artistName}」の最新音楽ニュースを教えてください。新曲リリース、ツアー、ライブ、インタビュー、メディア出演などの情報を、日本語メディアを中心に検索してください。`;
    } else if (language === 'en') {
      return `Find the latest music news about "${artistName}". Include new releases, tours, interviews, and media appearances from the past week.`;
    } else {
      return `「${artistName}」の最新音楽ニュースを網羅的に教えてください。

検索してほしい内容：
- 新曲・新アルバムのリリース情報
- ツアー・ライブ・フェス出演情報  
- インタビュー・メディア出演
- コラボレーション・新プロジェクト

日本語メディア（音楽ナタリー、BARKS、オリコン等）と海外メディア（Pitchfork、NME等）の両方から、直近1週間の最新情報を探してください。`;
    }
  }

  /**
   * 基本の検索メソッド
   */
  async search(query: string, options: PerplexitySearchOptions = {}): Promise<SearchResult[]> {
    try {
      const systemPrompt = this.getSystemPrompt(options);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: query
          }
        ],
        // @ts-expect-error - Perplexity specific options
        return_citations: true,
      });

      const content = response.choices[0]?.message?.content || '';
      const citations = (response as unknown as { citations?: string[] }).citations || [];

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
        try {
          results.push({
            title: `Source [${index + 1}] from Perplexity`,
            url: url,
            description: `Cited source for query: ${query}`,
            age: 'Unknown',
            meta_url: { hostname: new URL(url).hostname }
          });
        } catch {
          // URLのパースに失敗した場合はスキップ
          console.warn(`Invalid URL in citations: ${url}`);
        }
      });

      return results;
    } catch (error) {
      console.error('Failed to fetch from Perplexity:', error);
      return [];
    }
  }

  /**
   * 音楽ニュース専用の検索メソッド
   * 日本語対応の強化されたプロンプトを使用
   */
  async searchMusicNews(artistName: string, options: PerplexitySearchOptions = {}): Promise<SearchResult[]> {
    const { language = 'both' } = options;
    const query = this.buildMusicNewsQuery(artistName, language);
    
    return this.search(query, {
      ...options,
      category: 'music',
    });
  }
}

