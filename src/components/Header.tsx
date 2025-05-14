import React, { useState, useRef, useEffect } from 'react';
import { GraduationCap, Settings, History, LogOut, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginModal } from './LoginModal';

export function Header() {
  const { user, signIn, signUp, signInWithGoogle, signOut } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdminClick = () => {
    setIsMenuOpen(false);
    navigate('/admin');
  };

  const handleHistoryClick = () => {
    setIsMenuOpen(false);
    navigate('/history');
  };

  return (
    <>
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-text">
              クリプトセンセイ
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="btn btn-outline flex items-center gap-2"
                >
                  <span>{user.email}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-border py-1 z-50">
                    <button
                      onClick={handleAdminClick}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Settings className="h-4 w-4" />
                      管理画面
                    </button>
                    <button
                      onClick={handleHistoryClick}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <History className="h-4 w-4" />
                      履歴
                    </button>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="btn btn-primary"
              >
                ログイン
              </button>
            )}
          </div>
        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onEmailLogin={signIn}
        onEmailSignUp={signUp}
        onGoogleLogin={signInWithGoogle}
      />
    </>
  );
}