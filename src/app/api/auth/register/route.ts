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
    const { username, email, password } = await request.json();

    // バリデーション
    if (!username || !email || !password) {
      const response = NextResponse.json(
        { error: 'ユーザー名、メールアドレス、パスワードは必須です' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    if (username.length < 3 || username.length > 20) {
      const response = NextResponse.json(
        { error: 'ユーザー名は3文字以上20文字以内で入力してください' },
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

    // 既存ユーザーの確認
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const response = NextResponse.json(
        { error: 'このメールアドレスまたはユーザー名は既に使用されています' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // 新しいユーザーを作成
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // JWTトークンを生成
    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role
    });

    const response = NextResponse.json({
      message: 'ユーザー登録が完了しました',
      user: user.toJSON(),
      token
    }, { status: 201 });

    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error registering user:', error);
    const response = NextResponse.json(
      { error: 'ユーザー登録に失敗しました' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
} 