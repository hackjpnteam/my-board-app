# 画面仕様書

## 1. 画面構成概要

### 1.1 画面一覧
| 画面名 | ファイルパス | 説明 |
|--------|-------------|------|
| メインページ | `src/app/page.tsx` | 掲示板のメイン画面（投稿フォーム + 投稿一覧） |

### 1.2 コンポーネント構成
| コンポーネント名 | ファイルパス | 役割 |
|-----------------|-------------|------|
| PostForm | `src/components/PostForm.tsx` | 投稿作成・編集フォーム |
| PostList | `src/components/PostList.tsx` | 投稿一覧表示 |
| DeleteConfirmDialog | `src/components/DeleteConfirmDialog.tsx` | 削除確認ダイアログ |
| ThemeRegistry | `src/components/ThemeRegistry.tsx` | Material-UIテーマ設定 |

## 2. メインページ（掲示板）

### 2.1 画面概要
- **URL**: `/`
- **ファイル**: `src/app/page.tsx`
- **レイアウト**: `src/app/layout.tsx`

### 2.2 画面レイアウト

#### 2.2.1 ヘッダー部分
- **タイトル**: "掲示板" (h3要素)
- **配置**: 中央揃え
- **スタイル**: Material-UI Typography h3

#### 2.2.2 投稿フォーム部分
- **コンポーネント**: PostForm
- **配置**: ページ上部
- **スタイル**: Material-UI Card

#### 2.2.3 投稿一覧部分
- **コンポーネント**: PostList
- **配置**: ページ下部
- **スタイル**: Material-UI Stack

#### 2.2.4 エラー表示部分
- **コンポーネント**: Material-UI Alert
- **表示条件**: エラー発生時
- **配置**: タイトルとフォームの間

### 2.3 レスポンシブ対応
- **コンテナ**: Material-UI Container (maxWidth="md")
- **パディング**: py: 4 (上下32px)
- **ブレークポイント**: 
  - xs: 16px padding
  - sm: 24px padding
  - md: max-width 900px

## 3. 投稿フォーム（PostForm）

### 3.1 コンポーネント概要
- **ファイル**: `src/components/PostForm.tsx`
- **機能**: 投稿作成・編集フォーム

### 3.2 画面要素

#### 3.2.1 カードヘッダー
- **タイトル**: 
  - 新規投稿時: "新しい投稿"
  - 編集時: "投稿を編集"
- **スタイル**: Material-UI Typography h6

#### 3.2.2 エラー表示
- **コンポーネント**: Material-UI Alert
- **表示条件**: エラー発生時
- **色**: error (赤色)

#### 3.2.3 テキストエリア
- **コンポーネント**: Material-UI TextField
- **プロパティ**:
  - `fullWidth`: true
  - `multiline`: true
  - `rows`: 4
  - `placeholder`: "投稿内容を入力してください (200文字以内)"
  - `variant`: "outlined"

#### 3.2.4 文字数カウンター
- **表示**: "現在の文字数/200文字"
- **スタイル**: Material-UI Typography caption
- **色**: text.secondary

#### 3.2.5 ボタン群
- **配置**: 右寄せ
- **ボタン構成**:
  - キャンセルボタン（編集時のみ表示）
  - 投稿/更新ボタン

##### キャンセルボタン
- **表示条件**: 編集モード時
- **スタイル**: Material-UI Button (variant="outlined")
- **無効化条件**: 投稿中

##### 投稿/更新ボタン
- **テキスト**: 
  - 新規投稿時: "投稿"
  - 編集時: "更新"
  - 投稿中: "投稿中..." / "更新中..."
- **スタイル**: Material-UI Button (variant="contained")
- **無効化条件**: 
  - 投稿内容が空
  - 200文字超過
  - 投稿中

### 3.3 状態管理
- **編集モード**: editingPost propで制御
- **投稿中状態**: isSubmitting state
- **エラー状態**: error state
- **文字数**: content state

## 4. 投稿一覧（PostList）

### 4.1 コンポーネント概要
- **ファイル**: `src/components/PostList.tsx`
- **機能**: 投稿一覧表示

### 4.2 画面要素

#### 4.2.1 ローディング表示
- **表示条件**: データ読み込み中
- **テキスト**: "読み込み中..."
- **スタイル**: Material-UI Typography

#### 4.2.2 空状態表示
- **表示条件**: 投稿が存在しない
- **テキスト**: "まだ投稿がありません"
- **配置**: 中央揃え
- **スタイル**: Material-UI Typography body1

#### 4.2.3 投稿カード
各投稿はMaterial-UI Cardで表示

##### カードレイアウト
- **配置**: フレックスボックス（space-between）
- **左側**: 投稿内容とメタ情報
- **右側**: 操作ボタン

##### 投稿内容
- **表示**: 投稿テキスト
- **スタイル**: Material-UI Typography body1
- **改行**: white-space: pre-wrap

##### メタ情報
- **投稿日時**: "投稿: YYYY/MM/DD HH:MM:SS"
- **更新日時**: "更新: YYYY/MM/DD HH:MM:SS"（作成日時と異なる場合のみ）
- **スタイル**: Material-UI Chip (variant="outlined")

##### 操作ボタン
- **編集ボタン**: Material-UI IconButton (Editアイコン)
- **削除ボタン**: Material-UI IconButton (Deleteアイコン)
- **色**: 
  - 編集: primary (青色)
  - 削除: error (赤色)

### 4.3 データ取得
- **API**: `/api/posts`
- **更新トリガー**: refreshTrigger prop
- **エラーハンドリング**: console.errorでログ出力

## 5. 削除確認ダイアログ（DeleteConfirmDialog）

### 5.1 コンポーネント概要
- **ファイル**: `src/components/DeleteConfirmDialog.tsx`
- **機能**: 投稿削除の確認ダイアログ

### 5.2 画面要素

#### 5.2.1 ダイアログタイトル
- **テキスト**: "投稿を削除"
- **スタイル**: Material-UI DialogTitle

#### 5.2.2 ダイアログ内容
- **テキスト**: "この投稿を削除してもよろしいですか？この操作は取り消せません。"
- **スタイル**: Material-UI Typography

#### 5.2.3 ダイアログアクション
- **キャンセルボタン**:
  - テキスト: "キャンセル"
  - 無効化条件: 削除中
- **削除ボタン**:
  - テキスト: 削除中 ? "削除中..." : "削除"
  - スタイル: Material-UI Button (variant="contained", color="error")
  - 無効化条件: 削除中

### 5.3 状態管理
- **表示制御**: open prop
- **削除中状態**: isDeleting prop
- **イベント**: onClose, onConfirm

## 6. テーマ設定（ThemeRegistry）

### 6.1 コンポーネント概要
- **ファイル**: `src/components/ThemeRegistry.tsx`
- **機能**: Material-UIテーマ設定

### 6.2 テーマ設定
- **カラーモード**: light
- **フォント**: "Noto Sans JP", "Roboto", "Helvetica", "Arial", sans-serif
- **背景色**: #f5f9ff
- **テキスト色**: #1a237e

## 7. エラーハンドリング

### 7.1 エラー表示
- **コンポーネント**: Material-UI Alert
- **色**: error (赤色)
- **閉じる機能**: onCloseでエラーをクリア

### 7.2 エラーメッセージ
- **バリデーションエラー**: 
  - "投稿内容を入力してください"
  - "投稿は200文字以内で入力してください"
- **ネットワークエラー**: "投稿に失敗しました"
- **削除エラー**: "削除に失敗しました"

## 8. レスポンシブデザイン

### 8.1 ブレークポイント
- **xs**: 0px以上
- **sm**: 600px以上
- **md**: 900px以上
- **lg**: 1200px以上
- **xl**: 1536px以上

### 8.2 対応要素
- **コンテナ**: maxWidth="md" (900px)
- **パディング**: レスポンシブ対応
- **ボタン**: タッチフレンドリーなサイズ
- **テキスト**: 読みやすいフォントサイズ 