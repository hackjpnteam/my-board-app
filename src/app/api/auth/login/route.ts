import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/jwt';

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
    const { email, password } = await request.json();

    // バリデーション
    if (!email || !password) {
      const response = NextResponse.json(
        { error: 'メールアドレスとパスワードは必須です' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // ユーザーを検索
    const user = await User.findOne({ email });

    if (!user) {
      const response = NextResponse.json(
        { error: 'メールアドレスまたはパスワードが正しくありません' },
        { status: 401 }
      );
      return addCorsHeaders(response);
    }

    // パスワードを確認
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      const response = NextResponse.json(
        { error: 'メールアドレスまたはパスワードが正しくありません' },
        { status: 401 }
      );
      return addCorsHeaders(response);
    }

    // JWTトークンを生成
    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role
    });

    const response = NextResponse.json({
      message: 'ログインに成功しました',
      user: user.toJSON(),
      token
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error logging in:', error);
    const response = NextResponse.json(
      { error: 'ログインに失敗しました' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
} 