# Design Concept: "NOISE" - Alternative Rock Portal

## コンセプト
世界最高峰の音楽情報ポータルサイト。若者からミドル層のオルタナティブロックファンに刺さる、エッジーでありながら洗練されたデザイン。Pitchfork、NME、Rolling Stoneに匹敵するクオリティを目指す。

## デザインフィロソフィー
- **RAW but Refined**: 生々しさと洗練の共存
- **Bold Typography**: 大胆なタイポグラフィで存在感を示す
- **Dark Aesthetic**: ダークモードをベースに、コンサート会場の雰囲気を演出
- **Visual Impact**: 強いビジュアルインパクトで記憶に残る

## カラーパレット

### Primary Colors
- **Background**: `#0a0a0a` (Deep Black)
- **Surface**: `#121212` (Elevated Black)
- **Card**: `#1a1a1a` (Card Background)

### Accent Colors
- **Primary Accent**: `#ff3c38` (Electric Red - エネルギー)
- **Secondary Accent**: `#ff8c00` (Burning Orange - 情熱)
- **Tertiary Accent**: `#00d4ff` (Neon Cyan - モダン)

### Text Colors
- **Headline**: `#ffffff`
- **Body**: `#e0e0e0`
- **Muted**: `#808080`
- **Subtle**: `#4a4a4a`

### Gradient
- Hero Gradient: `linear-gradient(135deg, #ff3c38 0%, #ff8c00 50%, #ff3c38 100%)`
- Glow Effect: `radial-gradient(circle at center, rgba(255,60,56,0.3) 0%, transparent 70%)`

## タイポグラフィ

### 見出しフォント
- **Primary**: `Bebas Neue` - 力強く、インパクトのあるディスプレイフォント
- **Alternative**: `Oswald` - モダンでコンデンスド

### 本文フォント  
- **Japanese**: `Noto Sans JP` - 可読性重視
- **English**: `Inter` / `Space Grotesk` - モダンで読みやすい

### サイズシステム
- Hero Title: `clamp(3rem, 10vw, 8rem)`
- Section Title: `clamp(2rem, 5vw, 3.5rem)`
- Card Title: `1.25rem - 1.5rem`
- Body: `1rem`
- Caption: `0.875rem`

## レイアウト

### ヒーローセクション
- フルスクリーンヒーロー with グリッチエフェクト
- 最新・注目記事を大きく表示
- アニメーションで動きを出す

### メインコンテンツ
- マガジンスタイルのグリッドレイアウト
- Featured記事は大きく、その他は統一サイズ
- カテゴリーフィルター付き

### カード
- ダークベースでホバー時にグロー
- 画像にグラデーションオーバーレイ
- カテゴリータグは鮮やかなアクセントカラー

## アニメーション・インタラクション

### ページロード
- Staggered fade-in (遅延付き順次表示)
- Hero text のスライドイン

### ホバーエフェクト
- カードのスケールアップ (1.02)
- グローエフェクト
- 画像のズーム

### スクロール
- Parallax効果（控えめに）
- Intersection Observer でフェードイン

## コンポーネント

1. **Header**: グリッチロゴ、ナビゲーション、検索
2. **HeroSection**: フィーチャード記事のハイライト
3. **NewsCard**: ダークモード対応のカード
4. **CategoryFilter**: アーティスト・カテゴリーフィルター
5. **Footer**: ソーシャルリンク、サブスクライブ

## 参考サイト
- Pitchfork (Editorial Layout)
- NME (News Coverage)
- Consequence of Sound (Alternative Focus)
- Stereogum (Indie/Alternative)
