# データベース仕様書

## 1. データベース概要

### 1.1 基本情報
- **データベース**: MongoDB
- **ODM**: Mongoose 8.17.0
- **接続管理**: `src/lib/mongodb.ts`
- **モデル定義**: `src/models/Post.ts`

### 1.2 接続設定
- **環境変数**: `MONGODB_URI`
- **フォールバック**: `mongodb://localhost:27017/board-app`
- **データベース名**: `board-app`
- **接続オプション**: `bufferCommands: false`

## 2. データベース接続

### 2.1 接続ファイル
**ファイル**: `src/lib/mongodb.ts`

### 2.2 接続設定詳細
```typescript
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/board-app';

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

interface GlobalWithMongoose {
  mongoose: Cached;
}
```

### 2.3 接続管理機能
- **接続キャッシュ**: グローバル変数で接続をキャッシュ
- **再接続処理**: 接続が切れた場合の自動再接続
- **エラーハンドリング**: 接続エラー時の適切なエラーレスポンス
- **型安全性**: TypeScriptによる型定義

## 3. コレクション設計

### 3.1 投稿コレクション（posts）

#### 3.1.1 コレクション概要
- **コレクション名**: `posts`
- **モデルファイル**: `src/models/Post.ts`
- **説明**: 掲示板の投稿データを格納

#### 3.1.2 スキーマ定義
```typescript
const PostSchema: Schema = new Schema(
  {
    content: {
      type: String,
      required: [true, '投稿内容を入力してください'],
      maxlength: [200, '投稿は200文字以内で入力してください'],
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  }
);
```

#### 3.1.3 フィールド詳細

##### content（投稿内容）
- **型**: String
- **必須**: true
- **最大長**: 200文字
- **トリム**: true（前後の空白を削除）
- **バリデーション**: 
  - 必須チェック: `required: [true, '投稿内容を入力してください']`
  - 文字数チェック: `maxlength: [200, '投稿は200文字以内で入力してください']`

##### createdAt（作成日時）
- **型**: Date
- **自動生成**: true
- **説明**: 投稿作成時のタイムスタンプ
- **形式**: ISO 8601形式（例: "2025-08-05T07:59:23.247Z"）

##### updatedAt（更新日時）
- **型**: Date
- **自動更新**: true
- **説明**: 投稿更新時のタイムスタンプ
- **形式**: ISO 8601形式（例: "2025-08-05T08:30:15.123Z"）

##### _id（ドキュメントID）
- **型**: ObjectId
- **自動生成**: true
- **説明**: MongoDBの一意識別子
- **形式**: 24文字の16進数文字列（例: "6891b9db09a7a65c7a3c199d"）

##### __v（バージョンキー）
- **型**: Number
- **自動生成**: true
- **説明**: Mongooseの内部バージョン管理用

## 4. データ型定義

### 4.1 TypeScriptインターフェース
```typescript
export interface IPost extends Document {
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.2 フロントエンド用インターフェース
```typescript
interface Post {
  _id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
```

## 5. インデックス設計

### 5.1 現在のインデックス
- **デフォルトインデックス**: `_id`フィールド（自動生成）
- **作成日時インデックス**: 新着順表示のため暗黙的に使用

### 5.2 推奨インデックス
```javascript
// 作成日時降順インデックス（新着順表示用）
db.posts.createIndex({ "createdAt": -1 });

// 更新日時降順インデックス（更新順表示用）
db.posts.createIndex({ "updatedAt": -1 });
```

## 6. クエリパターン

### 6.1 全投稿取得（新着順）
```typescript
const posts = await Post.find({}).sort({ createdAt: -1 });
```

### 6.2 特定投稿取得
```typescript
const post = await Post.findById(postId);
```

### 6.3 投稿更新
```typescript
const post = await Post.findByIdAndUpdate(
  postId,
  { content: newContent },
  { new: true, runValidators: true }
);
```

### 6.4 投稿削除
```typescript
const post = await Post.findByIdAndDelete(postId);
```

### 6.5 新規投稿作成
```typescript
const post = new Post({ content: content.trim() });
await post.save();
```

## 7. バリデーション

### 7.1 スキーマレベルバリデーション
- **必須チェック**: contentフィールドは必須
- **文字数チェック**: contentフィールドは200文字以内
- **トリム処理**: 前後の空白文字を自動削除

### 7.2 アプリケーションレベルバリデーション
- **空文字チェック**: 空白文字のみの投稿は無効
- **ID形式チェック**: MongoDB ObjectId形式の検証
- **データ型チェック**: 文字列型の検証

## 8. データ整合性

### 8.1 制約事項
- **投稿内容**: 200文字以内の文字列
- **作成日時**: 投稿作成時に自動設定
- **更新日時**: 投稿更新時に自動更新
- **ID**: MongoDB ObjectId形式

### 8.2 データ整合性チェック
- **必須フィールド**: contentフィールドの存在確認
- **文字数制限**: 200文字以内の確認
- **日時整合性**: createdAt ≤ updatedAt

## 9. パフォーマンス考慮事項

### 9.1 クエリ最適化
- **インデックス活用**: createdAtフィールドの降順インデックス
- **プロジェクション**: 必要なフィールドのみ取得
- **ページネーション**: 大量データ対応（将来実装予定）

### 9.2 接続管理
- **接続プール**: Mongooseのデフォルト接続プール使用
- **接続キャッシュ**: グローバル変数での接続キャッシュ
- **エラーハンドリング**: 接続エラー時の適切な処理

## 10. バックアップ・復旧

### 10.1 バックアップ戦略
- **定期バックアップ**: 日次バックアップ
- **バックアップ形式**: MongoDB dump形式
- **保存期間**: 30日間

### 10.2 復旧手順
1. MongoDBサービスの停止
2. データディレクトリのバックアップ
3. バックアップファイルの復元
4. MongoDBサービスの再起動

## 11. セキュリティ

### 11.1 現在の実装
- **認証**: 環境変数による接続情報管理
- **認可**: データベースレベルでの認可なし
- **暗号化**: TLS/SSL接続（推奨）

### 11.2 セキュリティ強化
- **ネットワークアクセス制御**: 特定IPからのアクセスのみ許可
- **認証**: MongoDB認証の有効化
- **監査ログ**: データベース操作のログ記録

## 12. 監視・運用

### 12.1 監視項目
- **接続数**: アクティブな接続数
- **クエリパフォーマンス**: スロークエリの検出
- **ディスク使用量**: データベースサイズ
- **メモリ使用量**: インデックスとデータのメモリ使用量

### 12.2 運用タスク
- **定期メンテナンス**: インデックスの再構築
- **ログローテーション**: 古いログファイルの削除
- **パフォーマンス監視**: クエリ実行時間の監視

## 13. 将来の拡張

### 13.1 機能拡張
- **ユーザー管理**: ユーザーコレクションの追加
- **コメント機能**: コメントコレクションの追加
- **カテゴリ機能**: カテゴリコレクションの追加
- **タグ機能**: タグコレクションの追加

### 13.2 パフォーマンス改善
- **シャーディング**: 水平分割による負荷分散
- **レプリケーション**: 読み取り専用レプリカの追加
- **キャッシュ**: Redisによるキャッシュ層の追加 