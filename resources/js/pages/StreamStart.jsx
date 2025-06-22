import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function StreamStart() {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'video'
    });
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [stream, setStream] = useState(null);
    const [isStreaming, setIsStreaming] = useState(false);

    useEffect(() => {
        return () => {
            // クリーンアップ
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnail(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const startMediaStream = async () => {
        try {
            const constraints = formData.type === 'video'
                ? { video: true, audio: true }
                : { audio: true };
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            if (videoRef.current && formData.type === 'video') {
                videoRef.current.srcObject = mediaStream;
            }
            setStream(mediaStream);
            return true;
        } catch (error) {
            console.error('メディアアクセスエラー:', error);
            alert('カメラ/マイクへのアクセスが拒否されました');
            return false;
        }
    };

    const handleStartStream = async (e) => {
        e.preventDefault();
        if (!formData.title) {
            alert('タイトルを入力してください');
            return;
        }

        setLoading(true);

        try {
            // メディアストリームを開始
            const mediaStarted = await startMediaStream();
            if (!mediaStarted) {
                setLoading(false);
                return;
            }

            // 配信情報を送信
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('type', formData.type);
            if (thumbnail) {
                formDataToSend.append('thumbnail', thumbnail);
            }

            const response = await axios.post('/api/streams/start', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setIsStreaming(true);
            alert('配信を開始しました！');
            // 配信ページへリダイレクト（オプション）
            // navigate(`/streams/${response.data.stream.id}`);
        } catch (error) {
            console.error('配信開始エラー:', error);
            alert('配信の開始に失敗しました');
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        } finally {
            setLoading(false);
        }
    };

    const handleStopStream = async () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsStreaming(false);
        navigate('/streams');
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">ライブ配信を開始</h1>

            {!isStreaming ? (
                <form onSubmit={handleStartStream} className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                配信タイプ
                            </label>
                            <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="video"
                                        checked={formData.type === 'video'}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">動画配信</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="audio"
                                        checked={formData.type === 'audio'}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">音声配信</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                配信タイトル <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="配信のタイトルを入力"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                配信の説明
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="配信の内容を説明してください"
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                サムネイル画像
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleThumbnailChange}
                                className="w-full"
                            />
                            {thumbnailPreview && (
                                <img
                                    src={thumbnailPreview}
                                    alt="サムネイルプレビュー"
                                    className="mt-4 w-32 h-32 object-cover rounded"
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? '準備中...' : '配信を開始'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">配信中: {formData.title}</h2>
                    {formData.type === 'video' && (
                        <div className="mb-6">
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                className="w-full max-w-2xl mx-auto rounded-lg bg-black"
                            />
                        </div>
                    )}
                    {formData.type === 'audio' && (
                        <div className="mb-6 text-center py-12 bg-gray-100 rounded-lg">
                            <div className="text-6xl mb-4">🎙️</div>
                            <p className="text-xl">音声配信中...</p>
                        </div>
                    )}
                    <div className="text-center">
                        <button
                            onClick={handleStopStream}
                            className="px-8 py-3 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            配信を終了
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StreamStart;
