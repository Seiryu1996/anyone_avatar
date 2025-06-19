import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function MainLayout() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // ユーザー情報を取得
        axios.get('/api/user')
            .then(response => {
                setUser(response.data);
            })
            .catch(error => {
                console.log('Not authenticated');
            });
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post('/api/logout');
            setUser(null);
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center">
                                <span className="text-xl font-semibold">Avatar Streaming</span>
                            </Link>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link to="/streams" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                    配信一覧
                                </Link>
                                {user && (
                                    <>
                                        <Link to="/avatar/create" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                            アバター作成
                                        </Link>
                                        <Link to="/dashboard" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                            ダッシュボード
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <>
                                    <span className="text-gray-700">{user.name}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        ログアウト
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                        ログイン
                                    </Link>
                                    <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                                        新規登録
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            <main>
                <Outlet />
            </main>
        </div>
    );
}

export default MainLayout;
