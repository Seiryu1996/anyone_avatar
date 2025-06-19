import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const CameraCapture = ({ onCapture }) => {
    const webcamRef = useRef(null);
    const [capturing, setCapturing] = useState(false);

    const capture = useCallback(async () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setCapturing(true);

        try {
            const response = await axios.post('/api/avatar/capture', {
                image: imageSrc
            });
            onCapture(response.data.avatar_url);
        } catch (error) {
            console.error('アバター作成エラー:', error);
        } finally {
            setCapturing(false);
        }
    }, [webcamRef, onCapture]);

    return (
        <div className="camera-capture">
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/png"
                className="webcam"
            />
            <button
                onClick={capture}
                disabled={capturing}
                className="capture-button"
            >
                {capturing ? '処理中...' : '撮影'}
            </button>
        </div>
    );
};

export default CameraCapture;
