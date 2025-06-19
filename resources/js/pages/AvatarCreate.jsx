import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

function AvatarCreate() {
    const webcamRef = useRef(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [loading, setLoading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImageSrc(imageSrc);
    }, [webcamRef]);

    const retake = () => {
        setImageSrc(null);
        setAvatarUrl(null);
    };

    const saveAvatar = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/avatar/capture', {
                image: imageSrc
            });
            setAvatarUrl(response.data.avatar_url);
        } catch (error) {
            console.error('アバター作成エラー:', error);
            alert('アバターの作成に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8 text-center">アバター作成</h1>

            <div className="bg-white rounded-lg shadow-md p-6">
                {!imageSrc ? (
                    <div className="text-center">
                        <div className="mb-4">
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/png"
                                className="mx-auto rounded-lg"
                                videoConstraints={{
                                    width: 640,
                                    height: 480,
                                    facingMode: "user"
                                }}
                            />
                        </div>
                        <button
                            onClick={capture}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            撮影する
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="mb-4">
                            <img src={imageSrc} alt="撮影した写真" className="mx-auto rounded-lg" />
                        </div>
                        {!avatarUrl ? (
                            <div className="space-x-4">
                                <button
                                    onClick={retake}
                                    className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
                                >
                                    撮り直す
                                </button>
                                <button
                                    onClick={saveAvatar}
                                    disabled={loading}
                                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                                >
                                    {loading ? 'アバター作成中...' : 'アバターを作成'}
                                </button>
                            </div>
                        ) : (
                            <div>
                                <p className="text-green-600 font-semibold mb-4">
                                    アバターが作成されました！
                                </p>
                                <button
                                    onClick={retake}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                                >
                                    新しいアバターを作成
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-8 bg-blue-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">アバター作成のヒント</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>明るい場所で撮影しましょう</li>
                    <li>顔がはっきりと映るようにカメラに正面を向いてください</li>
                    <li>背景はシンプルなものがおすすめです</li>
                    <li>笑顔で撮影すると、より魅力的なアバターになります</li>
                </ul>
            </div>
        </div>
    );
}

export default AvatarCreate;
