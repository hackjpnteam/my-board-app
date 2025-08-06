'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Container, Typography, Box, Alert, CircularProgress } from '@mui/material';

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('認証トークンが見つかりません');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
          // 3秒後にログインページにリダイレクト
          setTimeout(() => {
            router.push('/auth');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'メール認証に失敗しました');
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        setStatus('error');
        setMessage('メール認証に失敗しました');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        {status === 'loading' && (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
              メールアドレスを確認中...
            </Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <Typography variant="h5" component="h1" sx={{ mb: 2, color: 'success.main' }}>
              メール認証完了
            </Typography>
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
            <Typography variant="body1">
              ログインページにリダイレクトします...
            </Typography>
          </>
        )}

        {status === 'error' && (
          <>
            <Typography variant="h5" component="h1" sx={{ mb: 2, color: 'error.main' }}>
              メール認証エラー
            </Typography>
            <Alert severity="error" sx={{ mb: 2 }}>
              {message}
            </Alert>
            <Typography variant="body1">
              ログインページに戻って、再度お試しください。
            </Typography>
          </>
        )}
      </Box>
    </Container>
  );
} 