#!/bin/bash

# tool-result フック: ツールの結果が返ってきた時に実行される

LOGFILE="/tmp/hook-debug.log"
echo "=== PostToolUse Hook ===" >> "$LOGFILE"
date >> "$LOGFILE"

# JSON をパース
read -r INPUT
echo "INPUT: $INPUT" >> "$LOGFILE"

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
IS_ERROR=$(echo "$INPUT" | jq -r '.tool_response.isError // false')
RESULT=$(echo "$INPUT" | jq -r '.tool_response // empty' | head -c 2000)

echo "TOOL_NAME: $TOOL_NAME" >> "$LOGFILE"
echo "IS_ERROR: $IS_ERROR" >> "$LOGFILE"

# エラーの場合は別のコメント
if [ "$IS_ERROR" = "true" ]; then
  echo "Error detected" >> "$LOGFILE"
  case "$TOOL_NAME" in
    "Edit" | "Write")
      echo "Sending error comment for Edit/Write" >> "$LOGFILE"
      /Users/km3/repo/github.com/kc3hack/2026_team21/apps/nico/send-comment.sh "❌ 編集失敗..." 4000 32 &
      ;;
    "Bash")
      echo "Sending error comment for Bash" >> "$LOGFILE"
      /Users/km3/repo/github.com/kc3hack/2026_team21/apps/nico/send-comment.sh "❌ コマンド実行エラー" 4000 32 &
      ;;
  esac
  exit 0
fi

# 成功時の作業完了コメント
echo "Processing success case for: $TOOL_NAME" >> "$LOGFILE"
case "$TOOL_NAME" in
  "Edit")
    # 編集内容を AI が分析してコメント生成
    echo "Generating AI comment for Edit" >> "$LOGFILE"
    FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // "ファイル"')
    /Users/km3/repo/github.com/kc3hack/2026_team21/apps/nico/generate-comment-cli.sh \
      "Edit" "false" "ファイル編集: $FILE_PATH" &
    ;;
  "Write")
    # 作成したファイルを AI が分析してコメント生成
    echo "Generating AI comment for Write" >> "$LOGFILE"
    FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // "ファイル"')
    /Users/km3/repo/github.com/kc3hack/2026_team21/apps/nico/generate-comment-cli.sh \
      "Write" "false" "ファイル作成: $FILE_PATH" &
    ;;
  "Bash")
    # コマンド実行結果を AI が分析してコメント生成
    echo "Generating AI comment for Bash" >> "$LOGFILE"
    /Users/km3/repo/github.com/kc3hack/2026_team21/apps/nico/generate-comment-cli.sh \
      "$TOOL_NAME" "$IS_ERROR" "$RESULT" &
    ;;
  "TaskUpdate")
    # タスク完了時に AI がコメント生成
    STATUS=$(echo "$INPUT" | jq -r '.tool_input.status // empty')
    if [ "$STATUS" = "completed" ]; then
      echo "Generating AI comment for TaskUpdate" >> "$LOGFILE"
      TASK_INFO=$(echo "$INPUT" | jq -r '.tool_input.subject // .tool_input.description // "タスク"')
      /Users/km3/repo/github.com/kc3hack/2026_team21/apps/nico/generate-comment-cli.sh \
        "TaskUpdate" "false" "タスク完了: $TASK_INFO" &
    fi
    ;;
  "Read" | "Grep" | "Glob")
    # 感想を生成したいツールはClaude CLIで生成（バックグラウンドで実行）
    echo "Generating AI comment for $TOOL_NAME" >> "$LOGFILE"
    /Users/km3/repo/github.com/kc3hack/2026_team21/apps/nico/generate-comment-cli.sh \
      "$TOOL_NAME" "$IS_ERROR" "$RESULT" &
    ;;
  *)
    # それ以外は何もしない
    echo "No action for tool: $TOOL_NAME" >> "$LOGFILE"
    exit 0
    ;;
esac
