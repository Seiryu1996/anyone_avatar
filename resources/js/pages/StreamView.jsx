import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function StreamView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isJoined, setIsJoined] = useState(false);

    useEffect(() => {
        fetchStream();
        return () => {
            // クリーンアップ
            if (isJoined) {
                leaveStream();
            }
        };
    }, [id]);

    const fetchStream = async () => {
        try {
            const response = await axios.get(`/api/streams/${id}`);
            setStream(response.data);

            if (response.data.is_live) {
                joinStream();
            } else {
                navigate('/streams');
            }
        } catch (error) {
            console.error('Stream fetch error:', error);
            navigate('/streams');
        } finally {
            setLoading(false);
        }
    };

    const joinStream = async () => {
        try {
            const response = await axios.post(`/api/streams/${id}/join`);
            setIsJoined(true);
            // WebRTC接続などの処理をここに追加
        } catch (error) {
            console.error('Join stream error:', error);
        }
    };

    const leaveStream = async () => {
        try {
            await axios.post(`/api/streams/${id}/leave`);
            setIsJoined(false);
        } catch (error) {
            console.error('Leave stream error:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // チャットメッセージを送信
        const message = {
            id: Date.now(),
            user: { name: 'You' },
            content: newMessage,
            created_at: new Date().toISOString()
        };

        setMessages([...messages, message]);
        setNewMessage('');

        // TODO: WebSocketでメッセージを送信
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ビデオプレイヤー */}
                    <div className="lg:col-span-2">
                        <div className="bg-black rounded-lg aspect-w-16 aspect-h-9 relative">
                            {stream.type === 'video' ? (
                                <video
                                    ref={videoRef}
                                    className="w-full h-full rounded-lg"
                                    autoPlay
                                    playsInline
                                    controls
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="text-6xl mb-4">🎙️</div>
                                        <p className="text-white text-xl">音声配信中</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 配信情報 */}
                        <div className="bg-white rounded-lg shadow mt-4 p-6">
                            <h1 className="text-2xl font-bold mb-2">{stream.title}</h1>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <img
                                        src={stream.user.avatar_image || '/default-avatar.png'}
                                        alt={stream.user.name}
                                        className="w-10 h-10 rounded-full mr-3"
                                    />
                                    <div>
                                        <p className="font-semibold">{stream.user.name}</p>
                                        <p className="text-sm text-gray-500">@{stream.user.username}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-600">
                                        👁️ {stream.viewers_count} 視聴中
                                    </span>
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                        フォロー
                                    </button>
                                </div>
                            </div>
                            <p className="text-gray-700">{stream.description}</p>
                        </div>
                    </div>

                    {/* チャット */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow h-full flex flex-col">
                            <div className="p-4 border-b">
                                <h2 className="font-semibold">チャット</h2>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ maxHeight: '500px' }}>
                                {messages.map((message) => (
                                    <div key={message.id} className="text-sm">
                                        <span className="font-semibold text-blue-600">
                                            {message.user.name}:
                                        </span>
                                        <span className="ml-2">{message.content}</span>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={sendMessage} className="p-4 border-t">
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="メッセージを入力..."
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                    >
                                        送信
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StreamView;
