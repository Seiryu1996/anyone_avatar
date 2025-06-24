import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import axios from 'axios';

function MainLayout() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // ユーザー情報を取得
        axios.get('/api/user')
            .then(response => {
                setUser(response.data);
            })
            .catch(error => {
                console.log('Not authenticated');
            });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-sans antialiased">
            {/* Custom Styles */}
            <style jsx>{`
                .gradient-bg {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .glass-effect {
                backdrop-filter: blur(16px) saturate(180%);
                background-color: rgba(255, 255, 255, 0.75);
                border: 1px solid rgba(209, 213, 219, 0.3);
                }

                .fade-in {
                animation: fadeIn 0.5s ease-in;
                }

                @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
                }

                .loading {
                animation: spin 1s linear infinite;
                }

                @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
                }
            `}</style>
            {/* Navigation */}
            <Navigation user={user} />
            <main className="min-h-screen">
                <Outlet />
            </main>
        </div>
    );
}

export default MainLayout;
