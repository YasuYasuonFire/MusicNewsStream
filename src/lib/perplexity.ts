import { OpenAI } from 'openai';
import type { SearchResult } from './brave-search';
import type { ArtistConfig } from '../types/artist';

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
- 各ニュースの正確な公開日をYYYY-MM-DD形式で必ず記載してください
- 1週間以上前のニュースは含めないでください
- 公開日が不明な場合は「日付不明」と記載してください
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
- Include the exact publication date in YYYY-MM-DD format for each news item
- Do not include news older than 1 week
- If the date is unknown, write "date unknown"
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
- 各ニュースの正確な公開日をYYYY-MM-DD形式で必ず記載してください
- 1週間以上前のニュースは含めないでください
- 公開日が不明な場合は「日付不明」と記載してください
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
   * アーティスト情報に応じた検索クエリを生成
   */
  private buildMusicNewsQuery(artist: ArtistConfig, language: 'ja' | 'en' | 'both' = 'both'): string {
    const names = [artist.name, artist.nameJa, ...artist.aliases]
      .filter((v, i, arr) => arr.indexOf(v) === i) // 重複除去
      .join('、');
    const disambig = artist.disambiguation ? `（${artist.disambiguation}）` : '';

    if (language === 'ja') {
      return `「${names}」${disambig}の最新音楽ニュースを教えてください。新曲リリース、ツアー、ライブ、インタビュー、メディア出演などの情報を、日本語メディアを中心に検索してください。`;
    } else if (language === 'en') {
      return `Find the latest music news about "${artist.name}"${disambig}. Include new releases, tours, interviews, and media appearances from the past week.`;
    } else {
      return `「${names}」${disambig}の最新音楽ニュースを網羅的に教えてください。

検索してほしい内容：
- 新曲・新アルバムのリリース情報
- ツアー・ライブ・フェス出演情報
- インタビュー・メディア出演
- コラボレーション・新プロジェクト

日本語メディア（音楽ナタリー、BARKS、オリコン等）と海外メディア（Pitchfork、NME等）の両方から、直近1週間の最新情報を探してください。`;
    }
  }

  /**
   * Perplexityのレスポンスから引用番号周辺のコンテキストを抽出
   */
  private extractCitationContext(content: string, citations: string[]): Map<number, string> {
    const contextMap = new Map<number, string>();
    for (let i = 0; i < citations.length; i++) {
      const marker = `[${i + 1}]`;
      const idx = content.indexOf(marker);
      if (idx !== -1) {
        // マーカー周辺の文を抽出
        const sentenceStart = Math.max(0, content.lastIndexOf('。', idx - 1) + 1);
        const sentenceEnd = content.indexOf('。', idx);
        const end = sentenceEnd !== -1 ? sentenceEnd + 1 : Math.min(content.length, idx + 200);
        contextMap.set(i, content.slice(sentenceStart, end).trim());
      }
    }
    return contextMap;
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
      const citationContext = this.extractCitationContext(content, citations);

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

      // 引用元URLも検索結果として追加（コンテキスト付き）
      citations.forEach((url: string, index: number) => {
        try {
          const context = citationContext.get(index);
          results.push({
            title: `Source [${index + 1}] from Perplexity`,
            url: url,
            description: context || `Cited source for query: ${query}`,
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
   * ArtistConfigを使い、日本語名・エイリアスを含む強化されたプロンプトを使用
   */
  async searchMusicNews(artist: ArtistConfig, options: PerplexitySearchOptions = {}): Promise<SearchResult[]> {
    const { language = 'both' } = options;
    const query = this.buildMusicNewsQuery(artist, language);

    return this.search(query, {
      ...options,
      category: 'music',
    });
  }
}
