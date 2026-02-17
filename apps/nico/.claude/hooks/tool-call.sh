#!/bin/bash

# tool-call フック: ツールが呼ばれた時に実行される
# stdin から JSON を受け取る

LOGFILE="/tmp/hook-debug.log"
echo "=== PreToolUse Hook ===" >> "$LOGFILE"
date >> "$LOGFILE"

# stdin から JSON を読み取る
read -r INPUT
echo "INPUT: $INPUT" >> "$LOGFILE"

# JSON をパース
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
echo "TOOL_NAME: $TOOL_NAME" >> "$LOGFILE"

# ツール名に応じてコメントを生成（シンプルに）
case "$TOOL_NAME" in
  "Read")
    COMMENT="ファイル読んでる..."
    ;;
  "Write")
    COMMENT="書いてる..."
    ;;
  "Edit")
    COMMENT="編集中..."
    ;;
  "Bash")
    COMMENT="実行中..."
    ;;
  "Grep")
    COMMENT="検索中..."
    ;;
  "Glob")
    COMMENT="探してる..."
    ;;
  *)
    # それ以外はコメントしない
    exit 0
    ;;
esac

# コメントを送信
echo "Sending comment: $COMMENT" >> "$LOGFILE"
/Users/km3/repo/github.com/kc3hack/2026_team21/apps/nico/send-comment.sh "$COMMENT" 3000 &
SEND_PID=$!
echo "Comment sent (PID: $SEND_PID)" >> "$LOGFILE"
