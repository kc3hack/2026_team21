#!/bin/bash

# コメントログを見やすく表示するスクリプト

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOGFILE="$SCRIPT_DIR/.claude/logs/comments.log"

if [ ! -f "$LOGFILE" ]; then
  echo "ログファイルが見つかりません: $LOGFILE"
  exit 1
fi

# 引数で表示行数を指定可能（デフォルトは全行）
LINES="${1:-all}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
printf "%-19s %-6s %-4s %-8s %-4s %s\n" "TIMESTAMP" "STATUS" "CODE" "DURATION" "SIZE" "COMMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$LINES" = "all" ]; then
  cat "$LOGFILE" | while IFS=$'\t' read -r timestamp status code duration size comment; do
    printf "%-19s %-6s %-4s %-8s %-4s %s\n" "$timestamp" "$status" "$code" "$duration" "$size" "$comment"
  done
else
  tail -n "$LINES" "$LOGFILE" | while IFS=$'\t' read -r timestamp status code duration size comment; do
    printf "%-19s %-6s %-4s %-8s %-4s %s\n" "$timestamp" "$status" "$code" "$duration" "$size" "$comment"
  done
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "合計: $(wc -l < "$LOGFILE" | tr -d ' ') コメント"
