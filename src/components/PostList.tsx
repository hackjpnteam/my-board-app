'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Stack,
  Chip,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

interface Post {
  _id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface PostListProps {
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
  refreshTrigger: number;
}

const PostList: React.FC<PostListProps> = ({ onEdit, onDelete, refreshTrigger }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('投稿の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP');
  };

  if (loading) {
    return <Typography>読み込み中...</Typography>;
  }

  if (posts.length === 0) {
    return (
      <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
        まだ投稿がありません
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {posts.map((post) => (
        <Card key={post._id} variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flexGrow: 1, mr: 2 }}>
                <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                  {post.content}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip
                    label={`投稿: ${formatDate(post.createdAt)}`}
                    size="small"
                    variant="outlined"
                  />
                  {post.createdAt !== post.updatedAt && (
                    <Chip
                      label={`更新: ${formatDate(post.updatedAt)}`}
                      size="small"
                      variant="outlined"
                      color="secondary"
                    />
                  )}
                </Box>
              </Box>
              <Box>
                <IconButton
                  size="small"
                  onClick={() => onEdit(post)}
                  color="primary"
                >
                  <Edit />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onDelete(post._id)}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

export default PostList;