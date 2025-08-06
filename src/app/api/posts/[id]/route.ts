import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import mongoose from 'mongoose';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const response = NextResponse.json(
        { error: '無効なIDです' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    const post = await Post.findById(id);
    
    if (!post) {
      const response = NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }
      );
      return addCorsHeaders(response);
    }

    const response = NextResponse.json(post);
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error fetching post:', error);
    const response = NextResponse.json(
      { error: '投稿の取得に失敗しました' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
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

    const post = await Post.findByIdAndUpdate(
      id,
      { content: content.trim() },
      { new: true, runValidators: true }
    );

    if (!post) {
      const response = NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }
      );
      return addCorsHeaders(response);
    }

    const response = NextResponse.json(post);
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error updating post:', error);
    const response = NextResponse.json(
      { error: '投稿の更新に失敗しました' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const response = NextResponse.json(
        { error: '無効なIDです' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    const post = await Post.findByIdAndDelete(id);

    if (!post) {
      const response = NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }
      );
      return addCorsHeaders(response);
    }

    const response = NextResponse.json({ message: '投稿を削除しました' });
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error deleting post:', error);
    const response = NextResponse.json(
      { error: '投稿の削除に失敗しました' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}