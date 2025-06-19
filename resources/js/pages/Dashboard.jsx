import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        posts: 0,
        followers: 0,
        following: 0,
        streams: 0
    });
    const [recentPosts, setRecentPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [userResponse, statsResponse, postsResponse] = await Promise.all([
                axios.get('/api/user'),
                axios.get('/api/user/stats'),
                axios.get('/api/posts?limit=5')
            ]);

            setUser(userResponse.data);
            setStats(statsResponse.data);
            setRecentPosts(postsResponse.data.data);
        } catch (error) {
            console.error('Dashboard data fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">ダッシュボード</h1>

                {/* ユーザー情報 */}
                <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-20 w-20">
                                {user?.avatar_image ? (
                                    <img
                                        className="h-20 w-20 rounded-full"
                                        src={user.avatar_image}
                                        alt={user.name}
                                    />
                                ) : (
                                    <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                                        <span className="text-2xl text-gray-600">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="ml-5">
                                <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                                <p className="text-gray-500">@{user?.username}</p>
                                <p className="text-sm text-gray-600 mt-1">{user?.bio || 'プロフィールを設定してください'}</p>
                            </div>
                            <div className="ml-auto">
                                <Link
                                    to="/profile/edit"
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    プロフィール編集
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 統計情報 */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">投稿数</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.posts}</dd>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">フォロワー</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.followers}</dd>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">フォロー中</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.following}</dd>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">配信回数</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.streams}</dd>
                        </div>
                    </div>
                </div>

                {/* クイックアクション */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
                    <Link
                        to="/avatar/create"
                        className="bg-blue-600 text-white rounded-lg p-6 hover:bg-blue-700 transition"
                    >
                        <h3 className="text-lg font-semibold mb-2">アバター作成</h3>
                        <p className="text-blue-100">新しいアバターを作成する</p>
                    </Link>
                    <Link
                        to="/stream/start"
                        className="bg-green-600 text-white rounded-lg p-6 hover:bg-green-700 transition"
                    >
                        <h3 className="text-lg font-semibold mb-2">配信開始</h3>
                        <p className="text-green-100">ライブ配信を始める</p>
                    </Link>
                    <Link
                        to="/posts/new"
                        className="bg-purple-600 text-white rounded-lg p-6 hover:bg-purple-700 transition"
                    >
                        <h3 className="text-lg font-semibold mb-2">新規投稿</h3>
                        <p className="text-purple-100">投稿を作成する</p>
                    </Link>
                </div>

                {/* 最近の投稿 */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">最近の投稿</h3>
                        {recentPosts.length > 0 ? (
                            <div className="space-y-4">
                                {recentPosts.map((post) => (
                                    <div key={post.id} className="border-b border-gray-200 pb-4 last:border-0">
                                        <p className="text-gray-800">{post.content}</p>
                                        <div className="mt-2 flex items-center text-sm text-gray-500">
                                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                            <span className="mx-2">•</span>
                                            <span>❤️ {post.likes_count}</span>
                                            <span className="mx-2">•</span>
                                            <span>💬 {post.comments_count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">まだ投稿がありません</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
