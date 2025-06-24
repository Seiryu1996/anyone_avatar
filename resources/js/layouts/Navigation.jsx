import React, { useState } from 'react';

const Navigation = ({ user }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <a href="/" className="text-2xl font-bold gradient-bg bg-clip-text text-transparent">
                Avatar App
              </a>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <a href="/" className="text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                ホーム
              </a>
              <a href="/posts" className="text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                投稿一覧
              </a>
              <a href="/streams" className="text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                配信一覧
              </a>
              {user && (
                <>
                    <a href="/dashboard" className="text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                        ダッシュボード
                    </a>
                    <a href="/profile" className="text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                        プロフィール
                    </a>
                    <a href="/avatar/create" className="text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                        アバター作成
                    </a>
                </>
              )}
            </div>
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={user.avatar_url || '/images/default-avatar.png'}
                    alt={user.name}
                  />
                  <span className="ml-2 text-gray-700">{user.name}</span>
                  <svg className="ml-1 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      プロフィール
                    </a>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <a href="/login" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  ログイン
                </a>
                <a href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  新規登録
                </a>
              </>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="md:hidden bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="/" className="text-gray-900 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium">
                ホーム
              </a>
              <a href="/posts" className="text-gray-900 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium">
                投稿一覧
              </a>
              <a href="/streams" className="text-gray-900 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium">
                配信一覧
              </a>
              {user && (
                <>
                    <a href="/dashboard" className="text-gray-900 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium">
                        ダッシュボード
                    </a>
                    <a href="/profile" className="text-gray-900 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium">
                        プロフィール
                    </a>
                    <a href="/avatar/create" className="text-gray-900 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium">
                        アバター作成
                    </a>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
