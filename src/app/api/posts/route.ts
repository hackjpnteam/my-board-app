import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';

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

export async function GET() {
  try {
    console.log('GET /api/posts - Starting request');
    
    // Add timeout to database connection
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
  } catch (error) {
    console.error('Error fetching posts:', error);
    const response = NextResponse.json(
      { error: '投稿の取得に失敗しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/posts - Starting request');
    
    // Add timeout to database connection
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

    const post = new Post({ content: content.trim() });
    await post.save();
    console.log('POST /api/posts - Post saved successfully');

    const response = NextResponse.json(post, { status: 201 });
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error creating post:', error);
    const response = NextResponse.json(
      { error: '投稿の作成に失敗しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}