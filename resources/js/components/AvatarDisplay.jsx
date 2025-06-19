import React, { useRef, useEffect, useState } from 'react';
import * as FaceMesh from '@mediapipe/face_mesh';
import * as CameraUtils from '@mediapipe/camera_utils';

const AvatarDisplay = ({ avatarImage, isStreaming, audioStream }) => {
    const canvasRef = useRef(null);
    const [faceMesh, setFaceMesh] = useState(null);
    const avatarImageRef = useRef(null);

    useEffect(() => {
        // FaceMesh初期化
        const mesh = new FaceMesh.FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });

        mesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        mesh.onResults(onResults);
        setFaceMesh(mesh);

        // アバター画像読み込み
        const img = new Image();
        img.src = avatarImage;
        img.onload = () => {
            avatarImageRef.current = img;
        };
    }, [avatarImage]);

    useEffect(() => {
        if (isStreaming && audioStream) {
            // 音声解析でアニメーション
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(audioStream);
            source.connect(analyser);

            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const animate = () => {
                if (!isStreaming) return;
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / bufferLength;
                // 音量に応じて口を動かす
                animateMouth(average / 255);
                requestAnimationFrame(animate);
            };

            animate();
        }
    }, [isStreaming, audioStream]);

    const onResults = (results) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (results.multiFaceLandmarks && avatarImageRef.current) {
            for (const landmarks of results.multiFaceLandmarks) {
                // 顔の向きを計算
                const nose = landmarks[1];
                const forehead = landmarks[10];
                const chin = landmarks[152];
                // アバター画像を描画
                ctx.drawImage(
                    avatarImageRef.current,
                    0, 0,
                    canvas.width, canvas.height
                );

                // 目や口のアニメーション
                animateEyes(ctx, landmarks);
            }
        }
        ctx.restore();
    };

    const animateMouth = (volume) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        // 音量に応じて口の開き具合を調整
        const mouthOpenness = volume * 20;
        // 口の描画処理
        // ...
    };

    const animateEyes = (ctx, landmarks) => {
        // まばたきアニメーション
        const leftEye = landmarks[159];
        const rightEye = landmarks[386];
        // 目の描画処理
        // ...
    };

    return (
        <div className="avatar-display">
            <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="avatar-canvas"
            />
        </div>
    );
};

export default AvatarDisplay;
