import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AvatarCreate from './pages/AvatarCreate';
import StreamList from './pages/StreamList';
import StreamView from './pages/StreamView';
import StreamStart from './pages/StreamStart';
import PostNew from './pages/PostNew';
import ProfileEdit from './pages/ProfileEdit';
import '../css/app.css';

function App() {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="avatar/create" element={<AvatarCreate />} />
                <Route path="streams" element={<StreamList />} />
                <Route path="streams/:id" element={<StreamView />} />
                <Route path="stream/start" element={<StreamStart />} />
                <Route path="posts/new" element={<PostNew />} />
                <Route path="profile/edit" element={<ProfileEdit />} />
            </Route>
        </Routes>
    );
}

export default App;
