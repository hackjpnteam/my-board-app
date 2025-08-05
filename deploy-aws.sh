#!/bin/bash

# AWS EC2 デプロイスクリプト

echo "🚀 AWS EC2 デプロイ開始..."

# Node.js のインストール
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 のインストール
npm install -g pm2

# プロジェクトディレクトリに移動
cd /var/www/my-board-app

# 依存関係のインストール
npm install

# 本番ビルド
npm run build

# 環境変数の設定
export MONGODB_URI="your-mongodb-connection-string"

# PM2でアプリケーションを起動
pm2 start npm --name "my-board-app" -- start
pm2 save
pm2 startup

echo "✅ デプロイ完了！" 