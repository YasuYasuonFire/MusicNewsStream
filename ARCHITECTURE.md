# MusicNewsStream Architecture

## システム概要
指定されたアーティストリストに基づき、Web検索とLLM（AI）を組み合わせて「意味のある最新情報」を収集・キュレーションし、日次で公開する静的サイトです。

## 技術スタック

### Frontend / Site Generation
- **Framework**: Next.js 14 (App Router)
  - SSG (Static Site Generation)
- **Styling**: Tailwind CSS
  - Noteライクなシンプルデザイン
- **Hosting**: GitHub Pages

### Backend / Intelligence Pipeline
- **Runtime**: Node.js / TypeScript (GitHub Actions上で実行)
- **Search Engine**: **Brave Search API** (または Google Programmable Search Engine)
  - 最新のWeb情報を検索・収集。
- **AI / LLM**: **Gemini 1.5 Flash** (または OpenAI GPT-4o-mini / Perplexity)
  - 検索結果のノイズ除去。
  - 「リリースの噂」「インタビュー」「ライブレポート」など、文脈を理解して重要度を判定。
  - 日本語での要約・タイトル生成。
- **Database**: JSON Files (Git Based DB)
  - `data/artists.json`: 監視対象アーティストリスト。
  - `data/news.json`: 収集・生成されたニュースデータ。

### CI/CD & Automation
- **GitHub Actions**:
  - **Schedule**: 毎日深夜（JST AM 0:00）に自動実行。
  - **Workflow**:
    1. `data/artists.json` を読み込み。
    2. 各アーティストについてWeb検索を実行（期間指定: 過去24時間〜3日）。
    3. LLMが検索結果を解析し、ニュース記事を生成。
    4. `data/news.json` に追記・重複排除。
    5. Next.jsをビルドし、GitHub Pagesへデプロイ。

## データフロー (AI Agent)
1. **Target**: アーティスト「X」
2. **Search**: クエリ「X new album interview tour news」等で検索。
3. **Analyze (LLM)**: 
   - Input: 検索結果（タイトル、スニペット、URL）
   - Prompt: 「この検索結果の中から、ファンにとって重要な音楽的ニュース（リリース、ツアー、詳細なインタビュー）のみを抽出し、日本語で要約してください。ゴシップや無関係な情報は無視して。」
4. **Output**: 構造化されたニュースデータ（Title, Summary, SourceURL, Date, ArtistTag）。

## ディレクトリ構造
```
MusicNewsStream/
├── .github/
│   └── workflows/
│       └── daily-curation.yml # AIキュレーション実行フロー
├── src/
│   ├── app/
│   ├── components/
│   └── data/
│       ├── artists.json       # ターゲットリスト（手動管理/Apple Musicから移行）
│       └── news/              # 日付ごとのニュースデータ
├── scripts/
│   ├── curate-news.ts         # メインスクリプト
│   ├── search-client.ts       # 検索APIラッパー
│   └── llm-client.ts          # LLM APIラッパー
└── public/
```
