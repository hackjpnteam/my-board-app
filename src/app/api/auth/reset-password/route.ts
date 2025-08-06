import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

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
    await connectDB();
    const { token, password } = await request.json();

    if (!token || !password) {
      const response = NextResponse.json(
        { error: 'トークンと新しいパスワードが必要です' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    if (password.length < 6) {
      const response = NextResponse.json(
        { error: 'パスワードは6文字以上で入力してください' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // トークンでユーザーを検索
    const user = await User.findOne({ 
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() } // 有効期限チェック
    });

    if (!user) {
      const response = NextResponse.json(
        { error: '無効なトークンまたは期限切れです' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // パスワードを更新
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const response = NextResponse.json({
      message: 'パスワードが正常に更新されました'
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error resetting password:', error);
    const response = NextResponse.json(
      { error: 'パスワードリセットに失敗しました' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
} 