# Development Guide

## ローカル開発環境が起動できるまで

### Node.js のインストール

Node.js をお好みの方法でインストールしてください。
バージョンは[.node-version](../.node-version) ファイルに記載されているものを使用してください。

### pnpm のインストール

お好みの方法で pnpm をインストールしてください。

```
$ corepack enable
$ corepack use pnpm@latest-10
```

### デフォルトブランチに commit しないために

```sh
chmod +x .githooks/*
git config core.hooksPath .githooks/
```

### リポジトリをミラーする

origin に push した時の remote を増やす。

```sh
$ git remote set-url --add --push origin git@github.com:yaken-org/kc3hack-team-1

$ git remote -v
origin  git@github.com:kc3hack/2026_team21 (fetch)
origin  git@github.com:yaken-org/kc3hack-team-1 (push)
origin  git@github.com:kc3hack/2026_team21 (push)
```

追加でリモートを追加しておくと個別対応できて便利です。

```sh
$ git remote add yaken https://github.com/yaken-org/kc3hack-team-1
```


### 起動

```
$ pnpm dev
```
