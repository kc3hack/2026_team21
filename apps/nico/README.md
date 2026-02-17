# Nico - ニコニコ風AIコメントシステム

AIが作業中にニコニコ動画風のコメントを画面に流すElectronアプリです。

## 機能

- 画面全体に透過ウィンドウを表示
- 右から左にコメントが流れる
- Claude Codeの作業内容に応じて自動的にコメントを表示
- HTTPサーバー経由でコメントを送信可能

## セットアップ

1. 依存関係をインストール
```bash
pnpm install
```

2. アプリを起動

**透過フルスクリーンモード（デフォルト）:**
```bash
pnpm start
```
- 画面全体に透過ウィンドウが表示されます
- 背景が完全に透明で、コメントだけが流れます

**グリーンバックウィンドウモード:**
```bash
pnpm start:window
# または
pnpm start -- --window
```
- 1280x720のウィンドウが表示されます
- 背景が緑色（#00FF00）になります
- OBSなどでクロマキー合成できます

アプリが起動すると:
- ポート3939でHonoサーバーが起動します
- Claude Codeのフックが有効になります

## 使い方

### 手動でコメントを送信

```bash
# シェルスクリプト経由（フォントサイズ指定可能）
./send-comment.sh "コメント内容" 5000 36

# curl経由（フォントサイズ指定可能）
curl -X POST http://localhost:3939/comment \
  -H "Content-Type: application/json" \
  -d '{"text": "コメント内容", "duration": 5000, "fontSize": 36}'

# フォントサイズの例
./send-comment.sh "小さい文字" 5000 16
./send-comment.sh "通常サイズ" 5000 24  # デフォルト
./send-comment.sh "大きい文字" 5000 48
./send-comment.sh "超巨大！" 5000 72
```

### Claude Codeと連携

このディレクトリで Claude Code を実行すると、自動的にフックが有効になり、AIが作業内容に対する感想をコメントとして流します。

**動作:**
1. ツール実行前: シンプルなステータスメッセージ（例: "ファイル読んでる..."、"実行中..."）
2. ツール完了後: Claude CLI (subagent, Haiku) が内容を見て感想を生成

**AI コメントが生成されるツール:**
- Read/Grep/Glob: 読み込み・検索結果への反応（例: "わかりやすい！"、"Electron + Hono の組み合わせナイス"）
- Edit/Write: ファイル編集・作成への反応（例: "うぽつ！"、"ファイル更新されてるね！"）
- Bash: コマンド実行結果への反応（例: "すごい！全部成功してる"）
- TaskUpdate: タスク完了の祝福（例: "おつかれさま！"、"やったね！"）

**必要なもの:**
- Claude Code CLI が `claude` コマンドとしてPATHに通っていること
- Claude CLIが `--model haiku` オプションでHaikuを使用できること

感想生成にはClaude Codeのsubagent機能（Haiku）を使用するため、追加のAPIキー設定は不要です。

## コメントログ

送信されたすべてのコメントは `.claude/logs/comments.log` に記録されます。

### ログを表示

```bash
# 全ログを表示
./view-comment-log.sh

# 直近10件を表示
./view-comment-log.sh 10
```

### 統計情報を表示

```bash
./comment-stats.sh
```

以下の情報が表示されます:
- 総コメント数と成功率
- 人気コメント TOP 10
- 表示時間の分布
- 時間帯別コメント数

## フックのカスタマイズ

`.claude/hooks/tool-call.sh` と `.claude/hooks/tool-result.sh` を編集することで、コメント内容をカスタマイズできます。

## 技術スタック

- Electron - デスクトップアプリ
- TypeScript - 型安全な開発
- Hono - HTTPサーバー
- CSS Animations - コメントアニメーション
