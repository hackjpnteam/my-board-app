import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';
import { mockDB, hashPassword } from '@/lib/mock-db';

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
    const { username, email, password } = await request.json();
    
    // モックモードの確認
    const useMockDB = process.env.USE_MOCK_DB === 'true';
    
    if (useMockDB) {
      // モックデータベースを使用

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
      const existingUser = await mockDB.findUserByEmail(email) || await mockDB.findUserByUsername(username);

      if (existingUser) {
        const response = NextResponse.json(
          { error: 'このメールアドレスまたはユーザー名は既に使用されています' },
          { status: 400 }
        );
        return addCorsHeaders(response);
      }

      // 新しいユーザーを作成
      const hashedPassword = await hashPassword(password);
      const user = await mockDB.createUser({
        username,
        email,
        password: hashedPassword,
        role: 'user',
        isEmailVerified: true // モックモードでは認証済みとして扱う
      });

      // モックモードではダミートークンを使用
      const token = 'mock-token-' + Date.now();

      const response = NextResponse.json({
        message: 'ユーザー登録が完了しました',
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
      }, { status: 201 });

      return addCorsHeaders(response);
    } else {
      // 実際のデータベースを使用
      await connectDB();

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

    // メール認証トークンを生成
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 新しいユーザーを作成
    const user = new User({
      username,
      email,
      password,
      emailVerificationToken: verificationToken,
      isEmailVerified: false
    });

    await user.save();

    // メール認証メールを送信
    const emailResult = await sendVerificationEmail(email, username, verificationToken);

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // メール送信に失敗してもユーザーは作成されているので、警告メッセージを返す
      const response = NextResponse.json({
        message: 'ユーザー登録が完了しましたが、メール認証メールの送信に失敗しました。管理者にお問い合わせください。',
        user: user.toJSON(),
        warning: 'メール認証メールの送信に失敗しました'
      }, { status: 201 });
      return addCorsHeaders(response);
    }

    const response = NextResponse.json({
      message: 'ユーザー登録が完了しました。メール認証メールを確認してください。',
      user: user.toJSON()
    }, { status: 201 });

    return addCorsHeaders(response);
    }
  } catch (error) {
    console.error('Error registering user:', error);
    const response = NextResponse.json(
      { error: 'ユーザー登録に失敗しました' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
} 