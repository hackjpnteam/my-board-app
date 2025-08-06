import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';

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

export async function GET() {
  try {
    await connectDB();
    const posts = await Post.find({}).sort({ createdAt: -1 });
    const response = NextResponse.json(posts);
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error fetching posts:', error);
    const response = NextResponse.json(
      { error: '投稿の取得に失敗しました' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
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

    const post = new Post({ content: content.trim() });
    await post.save();

    const response = NextResponse.json(post, { status: 201 });
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error creating post:', error);
    const response = NextResponse.json(
      { error: '投稿の作成に失敗しました' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}