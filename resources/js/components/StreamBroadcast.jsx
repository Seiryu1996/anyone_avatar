import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';

const StreamBroadcast = ({ streamType = 'video' }) => {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const startStream = async () => {
        try {
            const constraints = streamType === 'video'
                ? { video: true, audio: true }
                : { audio: true };
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            if (videoRef.current && streamType === 'video') {
                videoRef.current.srcObject = mediaStream;
            }
            setStream(mediaStream);

            // 配信開始APIコール
            const response = await axios.post('/api/streams/start', {
                title: 'ライブ配信',
                type: streamType
            });

            // MediaRecorderでストリーミング
            const recorder = new MediaRecorder(mediaStream);
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    // WebSocketでデータを送信
                    sendStreamData(event.data);
                }
            };
            recorder.start(1000); // 1秒ごとにデータを送信
            setMediaRecorder(recorder);
            setIsStreaming(true);
        } catch (error) {
            console.error('配信開始エラー:', error);
        }
    };

    const stopStream = async () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        // 配信終了APIコール
        await axios.post(`/api/streams/${currentStreamId}/end`);
        setIsStreaming(false);
    };

    const sendStreamData = (data) => {
        // WebSocket実装
        // ws.send(data);
    };

    return (
        <div className="stream-broadcast">
            {streamType === 'video' && (
                <video ref={videoRef} autoPlay muted className="stream-video" />
            )}
            <div className="stream-controls">
                {!isStreaming ? (
                    <button onClick={startStream} className="btn-primary">
                        配信開始
                    </button>
                ) : (
                    <button onClick={stopStream} className="btn-danger">
                        配信終了
                    </button>
                )}
            </div>
        </div>
    );
};

export default StreamBroadcast;
