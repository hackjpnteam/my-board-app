# 掲示板アプリ (Board App)

シンプルで使いやすい掲示板アプリケーション。投稿の作成、編集、削除が簡単にできます。Next.jsとMaterial-UIで構築されたモダンなWebアプリ。

## 🚀 機能

- ✅ ユーザー認証（ログイン・登録）
- ✅ 投稿の作成・編集・削除
- ✅ レスポンシブデザイン
- ✅ モックデータベース対応
- ✅ AWS DynamoDB対応
- ✅ パスワードリセット機能

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 15, React, TypeScript
- **UI**: Material-UI (MUI)
- **認証**: JWT
- **データベース**: MongoDB (開発) / DynamoDB (本番)
- **メール**: AWS SES
- **デプロイ**: AWS Amplify

## 📦 インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 🔧 環境設定

1. `.env.example` を `.env.local` にコピー
2. 必要な環境変数を設定

```bash
cp env.example .env.local
```

### 開発環境設定

```env
# 開発モード設定
USE_MOCK_DB=true

# アプリケーションURL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 本番環境設定

```env
# AWS設定
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# DynamoDB設定
DYNAMODB_TABLE_NAME=board-app-users
DYNAMODB_POSTS_TABLE_NAME=board-app-posts

# AWS Cognito設定
COGNITO_USER_POOL_ID=ap-northeast-1_xxxxxxxxx
COGNITO_CLIENT_ID=your-client-id

# Amazon SES設定
SES_FROM_EMAIL=noreply@yourdomain.com
SES_REGION=ap-northeast-1
```

## 🚀 AWS デプロイ

### 1. AWS Amplify でのデプロイ

1. AWS Amplify コンソールにアクセス
2. 「新しいアプリを作成」→「GitHubからホスト」
3. リポジトリを選択
4. ビルド設定を確認（`amplify.yml`を使用）
5. 環境変数を設定
6. デプロイ実行

### 2. 必要なAWSサービス

- **AWS Amplify**: フロントエンドホスティング
- **DynamoDB**: データベース
- **AWS Cognito**: ユーザー認証
- **Amazon SES**: メール送信
- **IAM**: アクセス権限管理

### 3. DynamoDBテーブル作成

```bash
# ユーザーテーブル
aws dynamodb create-table \
  --table-name board-app-users \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=email,AttributeType=S \
    AttributeName=username,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=email-index,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL} \
    IndexName=username-index,KeySchema=[{AttributeName=username,KeyType=HASH}],Projection={ProjectionType=ALL} \
  --billing-mode PAY_PER_REQUEST

# 投稿テーブル
aws dynamodb create-table \
  --table-name board-app-posts \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

## 🧪 テスト

### モックモードでのテスト

```bash
# テスト用アカウント
Email: test@example.com
Password: password123

Email: admin@example.com
Password: admin123
```

## 📝 開発メモ

- モックモード: `USE_MOCK_DB=true` でローカル開発
- 本番モード: AWS DynamoDBを使用
- Hydrationエラー対策済み
- レスポンシブデザイン対応

## 🤝 コントリビューション

1. フォークを作成
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT License

## 👨‍💻 作者

Hikaru
