class StreamingService {
    constructor() {
        this.peerConnection = null;
        this.localStream = null;
        this.ws = null;
    }

    async initialize(streamKey) {
        // WebSocket接続
        this.ws = new WebSocket(`wss://your-domain.com/streaming/${streamKey}`);
        this.ws.onopen = () => {
            console.log('WebSocket接続完了');
        };

        this.ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case 'offer':
                    await this.handleOffer(data.offer);
                    break;
                case 'answer':
                    await this.handleAnswer(data.answer);
                    break;
                case 'ice-candidate':
                    await this.handleIceCandidate(data.candidate);
                    break;
            }
        };

        // RTCPeerConnection設定
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                {
                    urls: 'turn:your-turn-server.com:3478',
                    username: 'username',
                    credential: 'password'
                }
            ]
        };

        this.peerConnection = new RTCPeerConnection(configuration);

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.ws.send(JSON.stringify({
                    type: 'ice-candidate',
                    candidate: event.candidate
                }));
            }
        };
    }

    async startBroadcast(stream) {
        this.localStream = stream;
        // トラックを追加
        stream.getTracks().forEach(track => {
            this.peerConnection.addTrack(track, stream);
        });

        // オファー作成
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        this.ws.send(JSON.stringify({
            type: 'offer',
            offer: offer
        }));
    }

    async handleAnswer(answer) {
        await this.peerConnection.setRemoteDescription(answer);
    }

    async handleIceCandidate(candidate) {
        await this.peerConnection.addIceCandidate(candidate);
    }

    stopBroadcast() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        if (this.ws) {
            this.ws.close();
        }
    }
}

export default StreamingService;
