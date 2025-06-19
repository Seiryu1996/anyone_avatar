import React, { useState } from 'react';
import axios from 'axios';

function PostComposer({ onNewPost }) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '💯', '🙏'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() || loading) return;

        setLoading(true);
        try {
            const response = await axios.post('/api/posts', { content });
            onNewPost(response.data.post);
            setContent('');
        } catch (error) {
            console.error('Post creation error:', error);
            alert('投稿に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const addEmoji = (emoji) => {
        setContent(content + emoji);
        setShowEmojiPicker(false);
    };

    return (
        <div className="bg-white rounded-lg shadow mb-6">
            <form onSubmit={handleSubmit} className="p-4">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="いまどうしてる？"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="3"
                />
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            😊
                        </button>
                        <span className="text-sm text-gray-500">
                            {280 - content.length} 文字
                        </span>
                    </div>
                    <button
                        type="submit"
                        disabled={!content.trim() || loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? '投稿中...' : '投稿'}
                    </button>
                </div>
                {showEmojiPicker && (
                    <div className="mt-2 p-2 bg-gray-100 rounded-md">
                        {emojis.map((emoji) => (
                            <button
                                key={emoji}
                                type="button"
                                onClick={() => addEmoji(emoji)}
                                className="text-2xl p-1 hover:bg-gray-200 rounded"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
            </form>
        </div>
    );
}

export default PostComposer;
