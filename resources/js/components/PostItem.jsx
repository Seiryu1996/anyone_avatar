import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function PostItem({ post, onLike, onDelete }) {
    const [isLiked, setIsLiked] = useState(post.is_liked || false);
    const [likesCount, setLikesCount] = useState(post.likes_count || 0);
    const [showMenu, setShowMenu] = useState(false);

    const handleLike = async () => {
        try {
            const response = await axios.post(`/api/posts/${post.id}/like`);
            setIsLiked(response.data.liked);
            setLikesCount(response.data.likes_count);
            if (onLike) onLike(post.id, response.data);
        } catch (error) {
            console.error('Like error:', error);
        }
    };

    const handleDelete = async () => {
        if (!confirm('この投稿を削除しますか？')) return;

        try {
            await axios.delete(`/api/posts/${post.id}`);
            if (onDelete) onDelete(post.id);
        } catch (error) {
            console.error('Delete error:', error);
            alert('削除に失敗しました');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return '今';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}時間前`;
        return date.toLocaleDateString();
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex items-start">
                <Link to={`/users/${post.user.username}`}>
                    <img
                        src={post.user.avatar_image || '/default-avatar.png'}
                        alt={post.user.name}
                        className="w-12 h-12 rounded-full mr-3"
                    />
                </Link>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <Link
                                to={`/users/${post.user.username}`}
                                className="font-semibold hover:underline"
                            >
                                {post.user.name}
                            </Link>
                            <span className="text-gray-500 text-sm ml-2">
                                @{post.user.username} · {formatDate(post.created_at)}
                            </span>
                        </div>
                        {post.can_delete && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    •••
                                </button>
                                {showMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                                        <button
                                            onClick={handleDelete}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            削除
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <p className="mt-2 text-gray-800 whitespace-pre-wrap">{post.content}</p>
                    {post.media && post.media.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            {post.media.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt=""
                                    className="rounded-lg max-h-64 object-cover"
                                />
                            ))}
                        </div>
                    )}
                    <div className="mt-4 flex items-center space-x-6">
                        <button
                            onClick={handleLike}
                            className={`flex items-center space-x-1 ${
                                isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                            }`}
                        >
                            <span>{isLiked ? '❤️' : '🤍'}</span>
                            <span className="text-sm">{likesCount}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600">
                            <span>💬</span>
                            <span className="text-sm">{post.comments_count || 0}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-gray-500 hover:text-green-600">
                            <span>🔁</span>
                            <span className="text-sm">{post.shares_count || 0}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PostItem;
