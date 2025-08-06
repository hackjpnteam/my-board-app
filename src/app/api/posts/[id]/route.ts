import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import mongoose from 'mongoose';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '@/lib/auth';

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

export const GET = requireAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    console.log(`GET /api/posts/${id} - Starting request`);
    
    // Add timeout to database connection
    const connectionPromise = connectDB();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 10000)
    );
    
    await Promise.race([connectionPromise, timeoutPromise]);
    console.log(`GET /api/posts/${id} - Database connected`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const response = NextResponse.json(
        { error: '無効なIDです' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    const post = await Post.findById(id).maxTimeMS(5000);
    
    if (!post) {
      const response = NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }
      );
      return addCorsHeaders(response);
    }

    console.log(`GET /api/posts/${id} - Post found`);
    const response = NextResponse.json(post);
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error fetching post:', error);
    const response = NextResponse.json(
      { error: '投稿の取得に失敗しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
});

export const PUT = requireAuth(async (
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    console.log(`PUT /api/posts/${id} - Starting request`);
    
    // Add timeout to database connection
    const connectionPromise = connectDB();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 10000)
    );
    
    await Promise.race([connectionPromise, timeoutPromise]);
    console.log(`PUT /api/posts/${id} - Database connected`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const response = NextResponse.json(
        { error: '無効なIDです' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

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

    // 投稿を取得して権限をチェック
    const post = await Post.findById(id).maxTimeMS(5000);
    if (!post) {
      const response = NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }
      );
      return addCorsHeaders(response);
    }

    const user = request.user;
    // 管理者または投稿者本人のみ編集可能
    if (user.role !== 'admin' && post.author.userId.toString() !== user.userId) {
      const response = NextResponse.json(
        { error: 'この投稿を編集する権限がありません' },
        { status: 403 }
      );
      return addCorsHeaders(response);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { content: content.trim() },
      { new: true, runValidators: true }
    ).maxTimeMS(5000);

    console.log(`PUT /api/posts/${id} - Post updated successfully`);
    const response = NextResponse.json(updatedPost);
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error updating post:', error);
    const response = NextResponse.json(
      { error: '投稿の更新に失敗しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
});

export const DELETE = requireAuth(async (
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    console.log(`DELETE /api/posts/${id} - Starting request`);
    
    // Add timeout to database connection
    const connectionPromise = connectDB();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 10000)
    );
    
    await Promise.race([connectionPromise, timeoutPromise]);
    console.log(`DELETE /api/posts/${id} - Database connected`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const response = NextResponse.json(
        { error: '無効なIDです' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // 投稿を取得して権限をチェック
    const post = await Post.findById(id).maxTimeMS(5000);
    if (!post) {
      const response = NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }
      );
      return addCorsHeaders(response);
    }

    const user = request.user;
    // 管理者または投稿者本人のみ削除可能
    if (user.role !== 'admin' && post.author.userId.toString() !== user.userId) {
      const response = NextResponse.json(
        { error: 'この投稿を削除する権限がありません' },
        { status: 403 }
      );
      return addCorsHeaders(response);
    }

    await Post.findByIdAndDelete(id).maxTimeMS(5000);

    console.log(`DELETE /api/posts/${id} - Post deleted successfully`);
    const response = NextResponse.json({ message: '投稿を削除しました' });
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error deleting post:', error);
    const response = NextResponse.json(
      { error: '投稿の削除に失敗しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
});