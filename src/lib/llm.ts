import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import type { SearchResult } from './brave-search';

// ニュース記事のスキーマ定義
export const NewsItemSchema = z.object({
  title: z.string().describe('日本語のキャッチーかつ簡潔なタイトル（30文字以内）。煽り文句は避ける。'),
  summary: z.string().describe('ニュースの概要を「Note」のような落ち着いたトーンの日本語で要約（100〜150文字）。'),
  url: z.string().describe('情報源のURL（検索結果から引用）。'),
  imageUrl: z.string().optional().describe('記事のメイン画像のURL。検索結果やメタデータに画像URLが含まれている場合のみ抽出。なければnullまたは空文字。'),
  source: z.string().describe('情報源のサイト名（ドメイン名やサイト名）。'),
  date: z.string().describe('記事の日付 (YYYY-MM-DD形式)。不明な場合は今日の日付。'),
  category: z.enum(['Release', 'Tour', 'Interview', 'Media', 'Other']).describe('ニュースのカテゴリ。'),
  importance: z.number().min(1).max(5).describe('ニュースの重要度（1:小ネタ 〜 5:超重要）。3未満は基本的に除外対象。'),
});

export type NewsItem = z.infer<typeof NewsItemSchema>;

const CurationResultSchema = z.object({
  news: z.array(NewsItemSchema),
});

export class NewsCurator {
  private model = google('gemini-2.0-flash');

  constructor() {}

  async curate(artistName: string, searchResults: SearchResult[]): Promise<NewsItem[]> {
    if (searchResults.length === 0) return [];

    // 検索結果をテキスト形式に変換
    const context = searchResults.map((r, i) => 
      `[${i+1}] Title: ${r.title}\nURL: ${r.url}\nSnippet: ${r.description}\nAge: ${r.age || 'Unknown'}\nThumbnail: ${r.thumbnail?.src || 'None'}`
    ).join('\n\n');

    const prompt = `
あなたは音楽ニュースのプロフェッショナル・キュレーターです。
「${artistName}」に関する以下のWeb検索結果から、ファンにとって価値のある最新ニュースを抽出してください。

## 判断基準
- **対象**: 新曲・アルバムのリリース、ツアー・ライブ情報の発表、主要メディアのインタビュー、ミュージックビデオの公開。
- **除外**: ゴシップ、噂レベルの情報、非公式な掲示板の書き込み、チケット転売情報、単なる歌詞サイトやグッズ販売。
- **鮮度**: 過去1週間以内の情報を優先してください。明らかに数ヶ月前の古い情報は除外してください。

## 出力トーン
- 日本語で出力してください。
- 「Note」のような、知的で落ち着いた、シンプルでモダンな文章表現を心がけてください。
- 絵文字は使用しないでください。

## 入力データ
${context}
    `;

    try {
      const { object } = await generateObject({
        model: this.model,
        schema: CurationResultSchema,
        prompt: prompt,
        temperature: 0.3, // 事実に基づくため低めに設定
      });

      // 重要度が低いものや、内容が薄いものをフィルタリング
      return object.news.filter(item => item.importance >= 3);
    } catch (error) {
      console.error(`Failed to curate news for ${artistName}:`, error);
      return [];
    }
  }

  async generateImage(newsItem: NewsItem): Promise<string | null> {
    const prompt = `
    以下のニュース記事のために、魅力的でアーティスティックなサムネイル画像をSVGコードとして生成してください。
    
    タイトル: ${newsItem.title}
    概要: ${newsItem.summary}
    アーティスト: ${newsItem.category === 'Release' || newsItem.category === 'Tour' ? '関連する音楽的な要素を含めてください' : '抽象的なイメージ'}

    ## 要件
    - SVGコードのみを出力してください。マークダウンのコードブロック(\`\`\`xmlなど)は不要です。
    - アスペクト比は 16:9 または 1:1 に適したデザインにしてください（viewBox="0 0 800 600" など）。
    - 抽象的でモダンなデザイン、幾何学模様、または音楽を感じさせるミニマルなイラストが良いです。
    - テキストは含めないでください（タイトルなどは不要）。
    - 配色は目に優しく、かつ印象的なものにしてください。
    - 複雑すぎるとエラーになる可能性があるため、パスやシェイプは適度にシンプルにしてください。
    `;

    try {
      const result = await generateObject({
        model: this.model,
        schema: z.object({
          svg: z.string().describe('生成されたSVGコード'),
        }),
        prompt: prompt,
      });

      const svg = result.object.svg;
      // SVGをData URLに変換
      const base64Svg = Buffer.from(svg).toString('base64');
      return `data:image/svg+xml;base64,${base64Svg}`;
    } catch (error) {
      console.error('Failed to generate SVG image:', error);
      return null;
    }
  }
}

