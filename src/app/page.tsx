'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, AppBar, Toolbar, Button, Avatar } from '@mui/material';
import PostForm from '@/components/PostForm';
import PostList from '@/components/PostList';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';

interface Post {
  _id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const { user, logout, isLoading } = useAuth();
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEdit = (post: Post) => {
    setEditingPost(post);
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
  };

  const handlePostSubmit = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDeleteClick = (postId: string) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/posts/${postToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRefreshTrigger(prev => prev + 1);
        setDeleteDialogOpen(false);
        setPostToDelete(null);
      } else {
        const data = await response.json();
        setError(data.error || '削除に失敗しました');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  // クライアントサイドでのみレンダリング
  if (!mounted || isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 4, textAlign: 'center' }}>
          掲示板
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center' }}>
          読み込み中...
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            掲示板アプリ
          </Typography>
          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2">
                {user.username}
              </Typography>
              <Button color="inherit" onClick={logout}>
                ログアウト
              </Button>
            </Box>
          ) : (
            <Button color="inherit" href="/auth">
              ログイン
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 4, textAlign: 'center' }}>
          掲示板
        </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <PostForm
          editingPost={editingPost}
          onPostSubmit={handlePostSubmit}
          onCancelEdit={handleCancelEdit}
        />
      </Box>

      <PostList
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        refreshTrigger={refreshTrigger}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </Container>
    </>
  );
}
