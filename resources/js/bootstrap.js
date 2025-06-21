import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import axios from 'axios';
window.axios = axios;
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'mt1',
    wsHost: import.meta.env.VITE_PUSHER_HOST ?? window.location.hostname,
    wsPort: import.meta.env.VITE_PUSHER_PORT ?? 6001,
    wssPort: import.meta.env.VITE_PUSHER_PORT ?? 6001,
    forceTLS: false,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
});

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// CSRFトークンの設定
let token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found');
}

// 認証トークンの設定
const authToken = localStorage.getItem('auth_token');
if (authToken) {
    window.axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
}
pageYOffset
// レスポンスインターセプター
window.axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // 認証エラーの場合
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
