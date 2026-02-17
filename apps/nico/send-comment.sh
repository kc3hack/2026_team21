#!/bin/bash

# コメントを送信するスクリプト
# 使い方: ./send-comment.sh "コメント内容" [duration] [font_size]

COMMENT="$1"
DURATION="${2:-5000}"
FONT_SIZE="${3:-}"

if [ -z "$COMMENT" ]; then
  echo "Usage: $0 <comment> [duration] [font_size]"
  exit 1
fi

# ログファイルのパス（プロジェクトディレクトリ）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOGFILE="$SCRIPT_DIR/.claude/logs/comments.log"

# ログディレクトリを作成
mkdir -p "$(dirname "$LOGFILE")"

# JSON ペイロードを構築
if [ -n "$FONT_SIZE" ]; then
  PAYLOAD="{\"text\": \"$COMMENT\", \"duration\": $DURATION, \"fontSize\": $FONT_SIZE}"
else
  PAYLOAD="{\"text\": \"$COMMENT\", \"duration\": $DURATION}"
fi

# コメントを送信
RESPONSE=$(curl -X POST http://localhost:3939/comment \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  -w "\nHTTP_CODE:%{http_code}" \
  -s 2>&1)

# ログに記録（タブ区切りで見やすく）
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
SUCCESS=$(echo "$RESPONSE" | grep -q '"success":true' && echo "OK" || echo "FAIL")

echo -e "$TIMESTAMP\t$SUCCESS\t$HTTP_CODE\t$DURATION\t$FONT_SIZE\t$COMMENT" >> "$LOGFILE"
