import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProfileEdit() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        bio: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await axios.get('/api/user');
            const user = response.data;
            setFormData({
                name: user.name || '',
                username: user.username || '',
                bio: user.bio || '',
                email: user.email || ''
            });
            setAvatarPreview(user.avatar_image);
        } catch (error) {
            console.error('ユーザー情報の取得エラー:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // プロフィール情報を更新
            await axios.put('/api/user/profile', formData);

            // アバター画像がある場合はアップロード
            if (avatar) {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    try {
                        await axios.post('/api/avatar/capture', {
                            image: reader.result
                        });
                    } catch (error) {
                        console.error('アバターアップロードエラー:', error);
                    }
                };
                reader.readAsDataURL(avatar);
            }

            alert('プロフィールを更新しました！');
            navigate('/dashboard');
        } catch (error) {
            console.error('プロフィール更新エラー:', error);
            alert('プロフィールの更新に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">プロフィール編集</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                <div className="text-center">
                    <div className="mb-4">
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="アバター"
                                className="w-32 h-32 rounded-full mx-auto object-cover"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-gray-300 mx-auto flex items-center justify-center">
                                <span className="text-4xl text-gray-600">
                                    {formData.name?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                            </div>
                        )}
                    </div>
                    <label className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700">
                            プロフィール画像を変更
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />
                    </label>
                </div>

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        名前
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                        ユーザー名
                    </label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                            @
                        </span>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            pattern="[a-zA-Z0-9_]+"
                            required
                        />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                        半角英数字とアンダースコアのみ使用可能
                    </p>
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        メールアドレス
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                        自己紹介
                    </label>
                    <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows="4"
                        maxLength="160"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="自己紹介を入力（160文字まで）"
                    />
                    <p className="mt-1 text-sm text-gray-500 text-right">
                        {formData.bio.length} / 160
                    </p>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        キャンセル
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? '保存中...' : '保存'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProfileEdit;
