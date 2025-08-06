import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth';
import { sendAdminNotification } from '@/lib/email';
import { mockDB } from '@/lib/mock-db';

// CORS headers function with specific origins
function addCorsHeaders(response: NextResponse) {
  // Allow specific origins - add your Amplify domain here
  const allowedOrigins = [
    'https://main.d35dfe9fel2z6w.amplifyapp.com',
    'http://localhost:3000', // For local development
    'https://your-vercel-app.vercel.app' // Your Vercel domain if needed
  ];
  
  // For now, we'll use * to fix the immediate issue, but you can replace with specific origins
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

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    console.log('GET /api/posts - Starting request');
    
    // モックモードの確認
    const useMockDB = process.env.USE_MOCK_DB === 'true';
    
    if (useMockDB) {
      // モックデータベースを使用
      const posts = await mockDB.findPosts();
      console.log(`GET /api/posts - Found ${posts.length} posts (mock)`);
      
      const response = NextResponse.json(posts);
      return addCorsHeaders(response);
    } else {
      // 実際のデータベースを使用
      const connectionPromise = connectDB();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 10000)
      );
      
      await Promise.race([connectionPromise, timeoutPromise]);
      console.log('GET /api/posts - Database connected');
      
      const posts = await Post.find({}).sort({ createdAt: -1 }).maxTimeMS(5000);
      console.log(`GET /api/posts - Found ${posts.length} posts`);
      
      const response = NextResponse.json(posts);
      return addCorsHeaders(response);
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    const response = NextResponse.json(
      { error: '投稿の取得に失敗しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
});

export const POST = requireAuth(async (request: AuthenticatedRequest) => {
  try {
    console.log('POST /api/posts - Starting request');
    
    // モックモードの確認
    const useMockDB = process.env.USE_MOCK_DB === 'true';
    
    if (useMockDB) {
      // モックデータベースを使用
      const { content } = await request.json();
      
      if (!content || content.trim().length === 0) {
        const response = NextResponse.json(
          { error: '投稿内容を入力してください' },
          { status: 400 }
        );
        return addCorsHeaders(response);
      }

      if (content.length > 200) {
        const response = NextResponse.json(
          { error: '投稿は200文字以内で入力してください' },
          { status: 400 }
        );
        return addCorsHeaders(response);
      }

      // 認証されたユーザー情報を取得
      const user = request.user;
      if (!user) {
        const response = NextResponse.json(
          { error: '認証が必要です' },
          { status: 401 }
        );
        return addCorsHeaders(response);
      }

      const post = await mockDB.createPost({
        content: content.trim(),
        author: {
          userId: user.userId,
          username: user.username
        }
      });
      
      console.log('POST /api/posts - Post saved successfully (mock)');

      const response = NextResponse.json(post, { status: 201 });
      return addCorsHeaders(response);
    } else {
      // 実際のデータベースを使用
      const connectionPromise = connectDB();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 10000)
      );
      
      await Promise.race([connectionPromise, timeoutPromise]);
      console.log('POST /api/posts - Database connected');
      
            const { content } = await request.json();

      if (!content || content.trim().length === 0) {
        const response = NextResponse.json(
          { error: '投稿内容を入力してください' },
          { status: 400 }
        );
        return addCorsHeaders(response);
      }

      if (content.length > 200) {
        const response = NextResponse.json(
          { error: '投稿は200文字以内で入力してください' },
          { status: 400 }
        );
        return addCorsHeaders(response);
      }

      // 認証されたユーザー情報を取得
      const user = request.user;
      if (!user) {
        const response = NextResponse.json(
          { error: '認証が必要です' },
          { status: 401 }
        );
        return addCorsHeaders(response);
      }

      const post = new Post({
        content: content.trim(),
        author: {
          userId: user.userId,
          username: user.username
        }
      });
      
      await post.save();
      console.log('POST /api/posts - Post saved successfully');

      // 管理者に通知メールを送信（非同期で実行）
      sendAdminNotification(
        '新しい投稿が作成されました',
        `ユーザー: ${user.username}\n投稿内容: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`
      ).catch(error => {
        console.error('Failed to send admin notification:', error);
      });

      const response = NextResponse.json(post, { status: 201 });
      return addCorsHeaders(response);
    }
  } catch (error) {
    console.error('Error creating post:', error);
    const response = NextResponse.json(
      { error: '投稿の作成に失敗しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
});