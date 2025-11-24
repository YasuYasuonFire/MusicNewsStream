# Music News Stream

AI Agentがあなたの好きなアーティストの最新情報を毎日収集し、Note風のシンプルで美しいUIで届けるニュースサイトです。

## 特徴
- **完全自動化**: GitHub Actionsが毎日深夜にWebを巡回し、情報を収集します。
- **AIキュレーション**: Brave Searchで情報を探し、Gemini 1.5 Flashが「本当に重要なニュース（リリース、ライブ、インタビュー）」だけを選別・要約します。
- **サーバーレス**: データはJSONとしてリポジトリに保存され、GitHub Pagesで無料でホスティングされます。
- **Git Based DB**: 過去のニュースもGitの履歴として半永久的に残ります。

## セットアップ手順

### 1. リポジトリの準備
このリポジトリをGitHubにプッシュします。

### 2. APIキーの取得
以下の2つのAPIキーを取得してください（どちらも無料枠があります）。
- **Brave Search API**: [https://brave.com/search/api/](https://brave.com/search/api/)
- **Google Gemini API**: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### 3. GitHub Secretsの設定
GitHubリポジトリの `Settings` > `Secrets and variables` > `Actions` に以下のSecretsを追加します。
- `BRAVE_SEARCH_API_KEY`: 取得したBrave Search APIキー
- `GOOGLE_GENERATIVE_AI_API_KEY`: 取得したGemini APIキー

### 4. GitHub Pagesの設定
GitHubリポジトリの `Settings` > `Pages` に移動し、`Build and deployment` > `Source` を **GitHub Actions** に変更します。

### 5. アーティストの登録
`src/data/artists.json` を編集して、情報を追いかけたいアーティスト名を追加してください。

```json
[
  "Oasis",
  "Radiohead",
  "宇多田ヒカル",
  "..."
]
```

## 手動実行
動作確認をしたい場合は、GitHub Actionsのタブから「Daily Music News Curation」を選択し、「Run workflow」ボタンを押すと即座に実行されます。
