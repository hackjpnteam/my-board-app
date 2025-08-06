import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';
import { mockDB } from '@/lib/mock-db';

// CORS headers function
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    // モックモードの確認（デフォルトはtrue）
    const useMockDB = process.env.USE_MOCK_DB !== 'false';
    
    if (useMockDB) {
      // モックデータベースを使用
      if (!email) {
        const response = NextResponse.json(
          { error: 'メールアドレスが必要です' },
          { status: 400 }
        );
        return addCorsHeaders(response);
      }

      // ユーザーを検索
      const user = await mockDB.findUserByEmail(email);

      if (!user) {
        // セキュリティのため、ユーザーが存在しない場合でも成功レスポンスを返す
        const response = NextResponse.json({
          message: 'パスワードリセット用のメールを送信しました（メールアドレスが登録されている場合）'
        });
        return addCorsHeaders(response);
      }

      // モックモードでは実際のメール送信は行わず、成功レスポンスを返す
      const response = NextResponse.json({
        message: 'パスワードリセット用のメールを送信しました（モックモード）'
      });

      return addCorsHeaders(response);
    } else {
      // 実際のデータベースを使用
      await connectDB();

      if (!email) {
        const response = NextResponse.json(
          { error: 'メールアドレスが必要です' },
          { status: 400 }
        );
        return addCorsHeaders(response);
      }

      // ユーザーを検索
      const user = await User.findOne({ email });

      if (!user) {
        // セキュリティのため、ユーザーが存在しない場合でも成功レスポンスを返す
        const response = NextResponse.json({
          message: 'パスワードリセット用のメールを送信しました（メールアドレスが登録されている場合）'
        });
        return addCorsHeaders(response);
      }

      // リセットトークンを生成
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1時間後

      // ユーザー情報を更新
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = resetExpires;
      await user.save();

      // パスワードリセットメールを送信
      const emailResult = await sendPasswordResetEmail(email, user.username, resetToken);

      if (!emailResult.success) {
        console.error('Failed to send password reset email:', emailResult.error);
        const response = NextResponse.json(
          { error: 'メール送信に失敗しました。しばらく時間をおいてから再度お試しください。' },
          { status: 500 }
        );
        return addCorsHeaders(response);
      }

      const response = NextResponse.json({
        message: 'パスワードリセット用のメールを送信しました'
      });

      return addCorsHeaders(response);
    }
  } catch (error) {
    console.error('Error in forgot password:', error);
    const response = NextResponse.json(
      { error: 'パスワードリセット処理に失敗しました' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
} 