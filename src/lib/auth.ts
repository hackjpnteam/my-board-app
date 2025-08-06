import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export const authenticateToken = async (request: NextRequest): Promise<NextResponse | null> => {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return NextResponse.json(
        { error: 'アクセストークンが必要です' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    (request as AuthenticatedRequest).user = user;
    
    return null; // 認証成功
  } catch {
    return NextResponse.json(
      { error: '無効なトークンです' },
      { status: 401 }
    );
  }
};

type RequestHandler<T = Record<string, string>> = (request: NextRequest, context: { params: Promise<T> }) => Promise<NextResponse>;

export const requireAuth = <T = Record<string, string>>(handler: RequestHandler<T>): RequestHandler<T> => {
  return async (request: NextRequest, context: { params: Promise<T> }) => {
    const authResult = await authenticateToken(request);
    if (authResult) return authResult;
    
    return handler(request, context);
  };
};

export const requireAdmin = <T = Record<string, string>>(handler: RequestHandler<T>): RequestHandler<T> => {
  return async (request: NextRequest, context: { params: Promise<T> }) => {
    const authResult = await authenticateToken(request);
    if (authResult) return authResult;
    
    const user = (request as AuthenticatedRequest).user;
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      );
    }
    
    return handler(request, context);
  };
}; 