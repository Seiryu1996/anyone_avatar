import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function StreamList() {
    const [streams, setStreams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, video, audio

    useEffect(() => {
        fetchStreams();
    }, [filter]);

    const fetchStreams = async () => {
        try {
            const response = await axios.get('/api/streams', {
                params: { type: filter === 'all' ? null : filter }
            });
            setStreams(response.data.data);
        } catch (error) {
            console.error('Streams fetch error:', error);
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
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">ライブ配信</h1>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                                filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            すべて
                        </button>
                        <button
                            onClick={() => setFilter('video')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                                filter === 'video'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            動画
                        </button>
                        <button
                            onClick={() => setFilter('audio')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                                filter === 'audio'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            音声
                        </button>
                    </div>
                </div>

                {streams.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {streams.map((stream) => (
                            <Link
                                key={stream.id}
                                to={`/streams/${stream.id}`}
                                className="bg-white rounded-lg shadow hover:shadow-lg transition"
                            >
                                <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-t-lg relative">
                                    {stream.thumbnail ? (
                                        <img
                                            src={stream.thumbnail}
                                            alt={stream.title}
                                            className="object-cover rounded-t-lg"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg">
                                            <span className="text-white text-4xl">
                                                {stream.type === 'video' ? '🎥' : '🎙️'}
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                                        LIVE
                                    </div>
                                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                                        👁️ {stream.viewers_count}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                                        {stream.title}
                                    </h3>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <img
                                            src={stream.user.avatar_image || '/default-avatar.png'}
                                            alt={stream.user.name}
                                            className="w-6 h-6 rounded-full mr-2"
                                        />
                                        <span>{stream.user.name}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                        {stream.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">現在配信中のストリームはありません</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StreamList;
