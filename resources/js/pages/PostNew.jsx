import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function PostNew() {
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [media, setMedia] = useState([]);
    const [mediaPreview, setMediaPreview] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleMediaChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 4) {
            alert('画像は最大4枚まで選択できます');
            return;
        }

        setMedia(files);

        // プレビュー作成
        const previews = [];
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                previews.push({
                    url: reader.result,
                    type: file.type.startsWith('video/') ? 'video' : 'image'
                });
                if (previews.length === files.length) {
                    setMediaPreview(previews);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeMedia = (index) => {
        const newMedia = [...media];
        newMedia.splice(index, 1);
        setMedia(newMedia);

        const newPreviews = [...mediaPreview];
        newPreviews.splice(index, 1);
        setMediaPreview(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim() && media.length === 0) {
            alert('投稿内容を入力するか、画像を選択してください');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('content', content);
            media.forEach((file, index) => {
                formData.append(`media[${index}]`, file);
            });

            const response = await axios.post('/api/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('投稿が作成されました！');
            navigate('/dashboard');
        } catch (error) {
            console.error('投稿エラー:', error);
            alert('投稿の作成に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">新規投稿</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
                <div className="mb-6">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="いま何してる？"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows="6"
                        maxLength="280"
                    />
                    <div className="mt-2 text-sm text-gray-500 text-right">
                        {content.length} / 280
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        画像/動画を追加（最大4つ）
                    </label>
                    <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleMediaChange}
                        className="w-full"
                        disabled={media.length >= 4}
                    />
                    {mediaPreview.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            {mediaPreview.map((preview, index) => (
                                <div key={index} className="relative">
                                    {preview.type === 'image' ? (
                                        <img
                                            src={preview.url}
                                            alt={`プレビュー ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <video
                                            src={preview.url}
                                            className="w-full h-32 object-cover rounded-lg"
                                            controls
                                        />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeMedia(index)}
                                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            className="text-gray-500 hover:text-gray-700"
                            title="絵文字"
                        >
                            😊
                        </button>
                        <button
                            type="button"
                            className="text-gray-500 hover:text-gray-700"
                            title="GIF"
                        >
                            GIF
                        </button>
                        <button
                            type="button"
                            className="text-gray-500 hover:text-gray-700"
                            title="アンケート"
                        >
                            📊
                        </button>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 text-gray-700 hover:text-gray-900"
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            disabled={loading || (!content.trim() && media.length === 0)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? '投稿中...' : '投稿'}
                        </button>
                    </div>
                </div>
            </form>

            <div className="mt-8 bg-blue-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-3">投稿のヒント</h2>
                <ul className="space-y-2 text-sm text-gray-700">
                    <li>• 280文字以内で投稿できます</li>
                    <li>• 画像や動画は最大4つまで追加できます</li>
                    <li>• ハッシュタグを使って投稿を分類できます（例：#アバター配信）</li>
                    <li>• @ユーザー名 でメンションできます</li>
                </ul>
            </div>
        </div>
    );
}

export default PostNew;
