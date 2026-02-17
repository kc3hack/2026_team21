#!/bin/bash

# コメントログの統計を表示するスクリプト

# ロケール設定（Cを使うと文字化けせずにsortできる）
export LC_ALL=C
export LANG=C

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOGFILE="$SCRIPT_DIR/.claude/logs/comments.log"

if [ ! -f "$LOGFILE" ]; then
  echo "ログファイルが見つかりません: $LOGFILE"
  exit 1
fi

TOTAL=$(wc -l < "$LOGFILE" | tr -d ' ')
SUCCESS=$(grep -c "^.*OK" "$LOGFILE")
FAIL=$(grep -c "^.*FAIL" "$LOGFILE")

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 コメント統計"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "総コメント数: $TOTAL"
echo "成功: $SUCCESS"
echo "失敗: $FAIL"
if [ $TOTAL -gt 0 ]; then
  SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", ($SUCCESS/$TOTAL)*100}")
  echo "成功率: ${SUCCESS_RATE}%"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔥 人気コメント TOP 10"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
# 最後のフィールドをコメントとして取得
awk -F'\t' '{print $NF}' "$LOGFILE" | \
  grep -v '^$' | \
  sort | uniq -c | sort -rn | head -10 | while read count comment; do
  printf "%3d回 | %s\n" "$count" "$comment"
done
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏱️  表示時間の分布"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
awk -F'\t' '{print $4}' "$LOGFILE" | sort | uniq -c | sort -rn | while read count duration; do
  printf "%3d回 | %sms\n" "$count" "$duration"
done
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📅 時間帯別コメント数"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
awk -F'\t' '{print $1}' "$LOGFILE" | awk '{print $2}' | cut -d: -f1 | sort | uniq -c | while read count hour; do
  printf "%2d時台: %3d回\n" "$hour" "$count"
done
