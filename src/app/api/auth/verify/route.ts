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

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      const response = NextResponse.json(
        { error: '認証トークンが必要です' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // トークンでユーザーを検索
    const user = await User.findOne({ 
      emailVerificationToken: token,
      isEmailVerified: false 
    });

    if (!user) {
      const response = NextResponse.json(
        { error: '無効な認証トークンです' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // メール認証を完了
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    const response = NextResponse.json({
      message: 'メールアドレスの確認が完了しました',
      user: user.toJSON()
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error verifying email:', error);
    const response = NextResponse.json(
      { error: 'メール認証に失敗しました' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
} 