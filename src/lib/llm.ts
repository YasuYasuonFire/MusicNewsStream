import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import type { SearchResult } from './brave-search';
import type { ArtistConfig } from '../types/artist';

// ニュース記事のスキーマ定義
export const NewsItemSchema = z.object({
  title: z.string().describe('日本語のキャッチーかつ簡潔なタイトル（30文字以内）。煽り文句は避ける。'),
  summary: z.string().describe('ニュースの概要を「Note」のような落ち着いたトーンの日本語で要約（100〜150文字）。'),
  url: z.string().describe('情報源のURL（検索結果から引用）。'),
  imageUrl: z.string().optional().describe('記事のメイン画像のURL。検索結果やメタデータに画像URLが含まれている場合のみ抽出。なければnullまたは空文字。'),
  source: z.string().describe('情報源のサイト名（ドメイン名やサイト名）。'),
  date: z.string().describe('記事の公開日 (YYYY-MM-DD形式)。検索結果のComputed Dateフィールドの値を使用すること。不明な場合のみ今日の日付を使用。絶対に推測で過去の日付を生成しないこと。'),
  category: z.enum(['Release', 'Tour', 'Interview', 'Media', 'Other']).describe('ニュースのカテゴリ。'),
  importance: z.number().int().min(1).max(5).describe('ニュースの重要度（1:小ネタ 〜 5:超重要）。3未満は基本的に除外対象。'),
});

export type NewsItem = z.infer<typeof NewsItemSchema>;

const CurationResultSchema = z.object({
  news: z.array(NewsItemSchema),
});

/**
 * 検索結果のageフィールドから日付を計算
 */
function parseAge(age: string | undefined, fetchDate: Date): string | null {
  if (!age) return null;

  // "Published YYYY-MM-DD" (メディアスクレイパーからの形式)
  const publishedMatch = age.match(/Published (\d{4}-\d{2}-\d{2})/);
  if (publishedMatch) return publishedMatch[1];

  // "12 hours ago"
  const hoursMatch = age.match(/(\d+)\s*hours?\s*ago/i);
  if (hoursMatch) {
    const d = new Date(fetchDate);
    d.setHours(d.getHours() - parseInt(hoursMatch[1]));
    return d.toISOString().slice(0, 10);
  }

  // "2 days ago"
  const daysMatch = age.match(/(\d+)\s*days?\s*ago/i);
  if (daysMatch) {
    const d = new Date(fetchDate);
    d.setDate(d.getDate() - parseInt(daysMatch[1]));
    return d.toISOString().slice(0, 10);
  }

  // 絶対的な日付文字列を試行
  const parsed = new Date(age);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);

  return null;
}

/**
 * page_age (ISO 8601 duration) から日付を計算
 */
function parsePageAge(pageAge: string | undefined, fetchDate: Date): string | null {
  if (!pageAge) return null;
  const match = pageAge.match(/P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?)?/);
  if (!match) return null;

  const d = new Date(fetchDate);
  if (match[1]) d.setFullYear(d.getFullYear() - parseInt(match[1]));
  if (match[2]) d.setMonth(d.getMonth() - parseInt(match[2]));
  if (match[3]) d.setDate(d.getDate() - parseInt(match[3]) * 7);
  if (match[4]) d.setDate(d.getDate() - parseInt(match[4]));
  if (match[5]) d.setHours(d.getHours() - parseInt(match[5]));
  return d.toISOString().slice(0, 10);
}

export class NewsCurator {
  private model = google('gemini-2.0-flash');

  constructor() {}

  async curate(artist: ArtistConfig, searchResults: SearchResult[]): Promise<NewsItem[]> {
    if (searchResults.length === 0) return [];

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    // 検索結果をテキスト形式に変換（Computed Date付き）
    const context = searchResults.map((r, i) => {
      const computedDate = parseAge(r.age, now) || parsePageAge(r.page_age, now) || 'Unknown';
      return `[${i+1}] Title: ${r.title}\nURL: ${r.url}\nSnippet: ${r.description}\nReported Age: ${r.age || 'Unknown'}\nComputed Date: ${computedDate}\nSource Domain: ${r.meta_url?.hostname || 'Unknown'}\nThumbnail: ${r.thumbnail?.src || 'None'}`;
    }).join('\n\n');

    const disambigInfo = artist.disambiguation
      ? `\n「${artist.name}」は${artist.disambiguation}です。このアーティストの音楽活動に関する記事のみを選んでください。`
      : '';

    const prompt = `
あなたは音楽ニュースのプロフェッショナル・キュレーターです。
「${artist.name}」（${artist.nameJa}）に関する以下のWeb検索結果から、ファンにとって価値のある最新ニュースを抽出してください。
${disambigInfo}

## 重要ルール（必ず守ること）

### 日付の正確性
- 各検索結果の「Computed Date」フィールドを基準として日付を決定してください。
- LLMが推測した日付ではなく、検索結果から得られた日付を使用すること。
- 「Computed Date」が「Unknown」の場合のみ、今日の日付（${todayStr}）を使用してください。
- **過去2週間より古い記事は必ず除外してください。** 今日は${todayStr}です。

### ソースの品質
- **除外すべきソース**: Wikipedia、歌詞サイト、チケット転売サイト、個人ブログ、掲示板、SNS投稿のまとめ。
- **優先すべきソース**: 音楽ナタリー、BARKS、Billboard Japan、オリコン、RO69、Pitchfork、NME、Rolling Stone、公式サイト。

### 関連性の判断
- アーティスト名が曖昧な場合（一般的な英単語を含む場合など）、記事内容がこのアーティストの音楽活動に関するものか慎重に判断してください。
- 単にアーティスト名が言及されているだけの記事（例：ランキング一覧の一部）は除外してください。

## 対象ニュースカテゴリ
- Release: 新曲・アルバムのリリース、ミュージックビデオ公開
- Tour: ツアー・ライブ・フェス出演の発表
- Interview: 主要メディアのインタビュー
- Media: テレビ・ラジオ出演、SNS上の公式発表
- Other: 上記に当てはまらない重要ニュース

## 除外対象
- ゴシップ、噂レベルの情報
- チケット転売や非公式グッズの情報
- 歌詞の掲載のみの記事
- 古い記事の再掲載

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
        temperature: 0.3,
      });

      // 後処理: 日付バリデーション + 重要度フィルタ
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      return object.news
        .filter(item => item.importance >= 3)
        .map(item => {
          const itemDate = new Date(item.date);

          // 未来の日付は今日に修正
          if (itemDate > now) {
            item.date = todayStr;
          }

          // 2週間以上前の記事は除外
          if (itemDate < twoWeeksAgo) {
            return null;
          }

          return item;
        })
        .filter((item): item is NewsItem => item !== null);
    } catch (error) {
      console.error(`Failed to curate news for ${artist.name}:`, error);
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
