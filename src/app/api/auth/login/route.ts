import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/jwt';
import { mockDB, comparePassword } from '@/lib/mock-db';

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
    const { email, password } = await request.json();
    
    // モックモードの確認
    const useMockDB = process.env.USE_MOCK_DB === 'true';
    
    if (useMockDB) {
      // モックデータベースを使用

      // バリデーション
      if (!email || !password) {
        const response = NextResponse.json(
          { error: 'メールアドレスとパスワードは必須です' },
          { status: 400 }
        );
        return addCorsHeaders(response);
      }

      // ユーザーを検索
      const user = await mockDB.findUserByEmail(email);
      console.log('Mock login attempt:', { email, userFound: !!user });

      if (!user) {
        const response = NextResponse.json(
          { error: 'メールアドレスまたはパスワードが正しくありません' },
          { status: 401 }
        );
        return addCorsHeaders(response);
      }

      // パスワードを確認
      const isPasswordValid = await comparePassword(user.password, password);

      if (!isPasswordValid) {
        const response = NextResponse.json(
          { error: 'メールアドレスまたはパスワードが正しくありません' },
          { status: 401 }
        );
        return addCorsHeaders(response);
      }

      // モックモードではダミートークンを使用
      const token = 'mock-token-' + Date.now();

      const response = NextResponse.json({
        message: 'ログインに成功しました',
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        token
      });

      return addCorsHeaders(response);
    } else {
      // 実際のデータベースを使用
      await connectDB();

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

    // メール認証の確認
    if (!user.isEmailVerified) {
      const response = NextResponse.json(
        { error: 'メールアドレスの確認が完了していません。メールを確認して認証を完了してください。' },
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
    }
  } catch (error) {
    console.error('Error logging in:', error);
    console.error('Login error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      useMockDB: process.env.USE_MOCK_DB
    });
    
    let errorMessage = 'ログインに失敗しました';
    if (error instanceof Error) {
      errorMessage = `ログインに失敗しました: ${error.message}`;
    }
    
    const response = NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
} 