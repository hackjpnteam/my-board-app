'use client';

import React, { useState, useEffect } from 'react';
import { Container, Box, Typography } from '@mui/material';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // ログイン済みの場合は掲示板ページにリダイレクト
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography>読み込み中...</Typography>
        </Box>
      </Container>
    );
  }

  if (user) {
    return null; // リダイレクト中
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2 }}>
          掲示板アプリ
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          会員制掲示板にようこそ
        </Typography>
      </Box>

      {isLogin ? (
        <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </Container>
  );
} 