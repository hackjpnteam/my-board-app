'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';

interface Post {
  _id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface PostFormProps {
  editingPost: Post | null;
  onPostSubmit: () => void;
  onCancelEdit: () => void;
}

const PostForm: React.FC<PostFormProps> = ({ editingPost, onPostSubmit, onCancelEdit }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingPost) {
      setContent(editingPost.content);
    } else {
      setContent('');
    }
    setError('');
  }, [editingPost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('投稿内容を入力してください');
      return;
    }

    if (content.length > 200) {
      setError('投稿は200文字以内で入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingPost ? `/api/posts/${editingPost._id}` : '/api/posts';
      const method = editingPost ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setContent('');
        onPostSubmit();
        if (editingPost) {
          onCancelEdit();
        }
      } else {
        setError(data.error || '投稿に失敗しました');
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      setError('投稿に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent('');
    setError('');
    onCancelEdit();
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {editingPost ? '投稿を編集' : '新しい投稿'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="投稿内容を入力してください (200文字以内)"
            variant="outlined"
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {content.length}/200文字
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              {editingPost && (
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  キャンセル
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || !content.trim() || content.length > 200}
              >
                {isSubmitting ? '投稿中...' : editingPost ? '更新' : '投稿'}
              </Button>
            </Box>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default PostForm;