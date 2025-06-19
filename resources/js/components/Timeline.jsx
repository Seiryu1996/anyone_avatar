import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostItem from './PostItem';
import PostComposer from './PostComposer';

const Timeline = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchPosts();
    }, [page]);

    const fetchPosts = async () => {
        try {
            const response = await axios.get(`/api/timeline?page=${page}`);
            setPosts(prev => [...prev, ...response.data.data]);
            setLoading(false);
        } catch (error) {
            console.error('投稿の取得エラー:', error);
            setLoading(false);
        }
    };

    const handleNewPost = (post) => {
        setPosts([post, ...posts]);
    };

    const handleLike = async (postId) => {
        try {
            const response = await axios.post(`/api/posts/${postId}/like`);
            setPosts(posts.map(post =>
                post.id === postId
                    ? { ...post, likes_count: response.data.likes_count, is_liked: response.data.liked }
                    : post
            ));
        } catch (error) {
            console.error('いいねエラー:', error);
        }
    };

    return (
        <div className="timeline">
            <PostComposer onNewPost={handleNewPost} />
            <div className="posts-list">
                {posts.map(post => (
                    <PostItem
                        key={post.id}
                        post={post}
                        onLike={handleLike}
                    />
                ))}
            </div>
            {loading && <div className="loading">読み込み中...</div>}
        </div>
    );
};

export default Timeline;
