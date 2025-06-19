class ViewerService {
    constructor() {
        this.peerConnection = null;
        this.remoteStream = null;
        this.ws = null;
    }

    async joinStream(streamKey, videoElement) {
        // WebSocket接続
        this.ws = new WebSocket(`wss://your-domain.com/viewer/${streamKey}`);
        this.ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case 'offer':
                    await this.handleOffer(data.offer, videoElement);
                    break;
                case 'ice-candidate':
                    await this.handleIceCandidate(data.candidate);
                    break;
            }
        };

        // RTCPeerConnection設定
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        };

        this.peerConnection = new RTCPeerConnection(configuration);

        this.peerConnection.ontrack = (event) => {
            if (videoElement) {
                videoElement.srcObject = event.streams[0];
            }
            this.remoteStream = event.streams[0];
        };

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.ws.send(JSON.stringify({
                    type: 'ice-candidate',
                    candidate: event.candidate
                }));
            }
        };
    }

    async handleOffer(offer, videoElement) {
        await this.peerConnection.setRemoteDescription(offer);
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        this.ws.send(JSON.stringify({
            type: 'answer',
            answer: answer
        }));
    }

    async handleIceCandidate(candidate) {
        await this.peerConnection.addIceCandidate(candidate);
    }

    leaveStream() {
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        if (this.ws) {
            this.ws.close();
        }
    }
}

export default ViewerService;
