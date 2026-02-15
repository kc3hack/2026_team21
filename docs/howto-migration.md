# DBマイグレーションの方法

DBマイグレーションに atlas を使用しています。
このドキュメントでは、atlas を使用して DB マイグレーションを行う方法について説明します。

## リンク集

- [公式ドキュメント](https://atlasgo.io/docs)

## atlas ってなに

Go 製のスタンドアロンなDBマイグレーションツールです。
詳しくは公式ドキュメントを見てください。

このリポジトリでは Versioned Workflows を採用しており、その手法に従います。
[基本的な使い方](#基本的な使い方)については以下で説明します。

## 基本的な使い方

このリポジトリで行う基本的なワークフローについて説明します。

### 1. `./db/schema.sql` に変更を加える。

例えば、以下のような変更を加えます。

```diff
 CREATE TABLE `user_accounts` (
     `id` BINARY(16) NOT NULL,

     `name` VARCHAR(255) NOT NULL,
+    `display_name` VARCHAR(255) NULL DEFAULT NULL,

     `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

     PRIMARY KEY (`id`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2. `task atlas:diff NAME="マイグレーション名"` を実行する。

マイグレーションするSQLを生成するために以下のコマンドを実行します。

```sh
$ task atlas:diff NAME="add_display_name_to_user_accounts"
```

この時、`NAME` にはマイグレーション名を指定します。
今回は `add_display_name_to_user_accounts` という名前でマイグレーションを作成します。

### 3. `./db/migrations/` にマイグレーションファイルが生成されるので、確認する。

`./db/migrations/` に以下のようなファイルが生成されていることを確認します。

```sh
-- Modify "user_accounts" table
ALTER TABLE `user_accounts` ADD COLUMN `display_name` varchar(255) NULL;
```

### 4. `task atlas:apply` を実行する。

最後に、マイグレーションを実行します。

```sh
$ task atlas:apply
Migrating to version 20250302075715 from 20250302072825 (1 migrations in total):

  -- migrating version 20250302075715
    -> ALTER TABLE `user_accounts` ADD COLUMN `display_name` varchar(255) NULL;
  -- ok (11.666208ms)

  -------------------------
  -- 15.98425ms
  -- 1 migration
  -- 1 sql statement
```

## よくある質問

### Dev DB ってなんですか？

atlas がマイグレーション時に実行チェックを行うために必要なDBです。
常にクリーンなデータベースを Dev DB として利用する必要があります。

ローカルから起動する場合は、`docker://`のような URI を使用できます。

### ダウンマイグレーション(下方向)を実施したい

以下のコマンドを実行します。

```shell
$ task atlas:migrate -- down --env local
```

### Q6. 一度 diff して生成されたマイグレーションを変更したい

一度 apply している場合は、先に[ダウンマイグレーション](#q4-ダウンマイグレーション下方向を実施したい)もしくは全てを破壊してください。

その後生成されたファイルを直接変更するなどした後に以下を実行します。

```shell
$ task atlas:migrate -- hash
```

これを実行することで、`./db/migrations/atlas.sum`が更新されます。

### dry-run したい

apply 時に dry-run する時は以下のコマンドを実行してください。

```shell
$ task atlas:apply -- --dry-run
```

実行例として以下のようになります。

```shell
$ task atlas:apply -- --dry-run
Resetting DEV_DATABASE...
Migrating to version 20250302120029 (4 migrations in total):

  -- migrating version 00000000000000
    -> DROP TABLE `user_accounts`;
  -- ok (1.123459ms)

  -- migrating version 00000000000000
    -> CREATE TABLE `user_accounts` (`id` binary(16) NOT NULL, `name` varchar(255) NOT NULL, `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (`id`)) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
  -- ok (1.331792ms)

  -- migrating version 20250302120029
    -> ALTER TABLE `user_accounts` DROP COLUMN `display_name`;
  -- ok (1.193583ms)

  -- migrating version 20250302120029
    -> ALTER TABLE `user_accounts` ADD COLUMN `display_name` varchar(255) NULL;
  -- ok (1.792µs)

  -------------------------
  -- 14.526875ms
  -- 4 migrations
  -- 4 sql statements
```
