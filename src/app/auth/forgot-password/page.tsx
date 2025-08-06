'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Alert, 
  TextField, 
  Button, 
  Paper,
  Link 
} from '@mui/material';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setStatus('error');
      setMessage('メールアドレスを入力してください');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.error || 'パスワードリセット要求に失敗しました');
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setStatus('error');
      setMessage('パスワードリセット要求に失敗しました');
    }
  };

  if (!mounted) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center' }}>
            パスワードを忘れた場合
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center' }}>
            読み込み中...
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center' }}>
          パスワードを忘れた場合
        </Typography>

        <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
          登録したメールアドレスを入力してください。パスワードリセット用のリンクを送信します。
        </Typography>

        {status === 'success' && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {status === 'error' && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="メールアドレス"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            disabled={status === 'loading' || status === 'success'}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={status === 'loading' || status === 'success'}
          >
            {status === 'loading' ? '送信中...' : 'リセットリンクを送信'}
          </Button>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Link href="/auth" variant="body2">
            ログインページに戻る
          </Link>
        </Box>
      </Paper>
    </Container>
  );
} 