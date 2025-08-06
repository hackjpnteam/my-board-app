'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Container, 
  Typography, 
  Box, 
  Alert, 
  TextField, 
  Button, 
  Paper 
} from '@mui/material';

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('パスワードが一致しません');
      return;
    }

    if (password.length < 6) {
      setStatus('error');
      setMessage('パスワードは6文字以上で入力してください');
      return;
    }

    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('リセットトークンが見つかりません');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

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
        setMessage(data.error || 'パスワードリセットに失敗しました');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setStatus('error');
      setMessage('パスワードリセットに失敗しました');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center' }}>
          パスワードリセット
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
            label="新しいパスワード"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            disabled={status === 'loading' || status === 'success'}
          />
          <TextField
            fullWidth
            label="新しいパスワード（確認）"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            {status === 'loading' ? '更新中...' : 'パスワードを更新'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 