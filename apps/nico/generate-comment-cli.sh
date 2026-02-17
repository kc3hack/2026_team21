#!/bin/bash

# Claude CLI (subagent) を使ってコメントを生成

TOOL_NAME="$1"
IS_ERROR="$2"
RESULT="$3"

# 結果を要約（長すぎる場合）
RESULT_SUMMARY=$(echo "$RESULT" | head -c 1000)

if [ "$IS_ERROR" = "true" ]; then
  PROMPT="あなたはプログラマーです。エラーが起きたようです。カジュアルにリアクションしてください。

何が起きたか: ${TOOL_NAME} でエラー
${RESULT_SUMMARY}

コメントや一言、アドバイスなど:"
else
  PROMPT="あなたはプログラマーです。以下の作業を見て、カジュアルにリアクションしてください。

何をしたか: ${TOOL_NAME}
${RESULT_SUMMARY}

コメントや一言、アドバイスなど:"
fi

# Claude CLIでコメント生成（haiku使用）
# CLAUDECODE環境変数を一時的にunsetしてネストセッションを許可
# 最初の1行のみ取得（文字数制限なし）
COMMENT=$(echo "$PROMPT" | env -u CLAUDECODE claude --model haiku 2>/dev/null | head -n 1 | tr -d '"' | tr -d '\n')

# コメントをクリーンアップ
COMMENT=$(echo "$COMMENT" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')  # 前後の空白削除
COMMENT=$(echo "$COMMENT" | sed 's/^コメント://;s/^一言://')  # 「コメント:」「一言:」を削除
COMMENT=$(echo "$COMMENT" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')  # 再度空白削除

if [ -n "$COMMENT" ] && \
   [ "${#COMMENT}" -ge 2 ]; then  # 2文字以上
  /Users/km3/repo/github.com/kc3hack/2026_team21/apps/nico/send-comment.sh "$COMMENT" 4000 &
fi
