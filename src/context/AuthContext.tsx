'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ユーザー情報の型定義
export interface User {
    id: number;
    name: string;
    email: string;
}

// 認証情報の型定義
interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    setAuth: (data: { user: User; accessToken: string; refreshToken: string }) => void;
    clearAuth: () => void;
}

// デフォルト値
const defaultContext: AuthContextType = {
    user: null,
    isLoading: true,
    setAuth: () => { },
    clearAuth: () => { },
};

// コンテキストの作成
const AuthContext = createContext<AuthContextType>(defaultContext);

// ローカルストレージのキー
const USER_STORAGE_KEY = 'market_king_user';

// AuthProviderコンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
    const [auth, setAuthState] = useState<{
        user: User | null;
        isLoading: boolean;
    }>({
        user: null,  // サーバーサイドレンダリング時はnullで初期化
        isLoading: true,
    });

    useEffect(() => {
        const loadUser = async () => {
            // 1. localStorageを確認
            const storedUser = localStorage.getItem(USER_STORAGE_KEY);
            if (storedUser) {
                setAuthState({ user: JSON.parse(storedUser), isLoading: false });
                return;
            }
            // 2. なければme API
            try {
                console.log('meAPI');
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
                    setAuthState({ user: data.user, isLoading: false });
                    return;
                }
            } catch (e) {
                // エラー時は何もしない
            }
            // 3. それでもなければログアウト状態
            setAuthState({ user: null, isLoading: false });
        };
        loadUser();
    }, []);

    // setAuth, clearAuthをreturnの下に移動
    const contextValue = {
        user: auth.user,
        isLoading: auth.isLoading,
        setAuth,
        clearAuth,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );

    function setAuth(data: { user: User; accessToken: string; refreshToken: string }) {
        if (typeof window !== 'undefined' && data.user) {
            try {
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
            } catch (error) {
                console.error('Failed to save user to localStorage:', error);
            }
        }
        setAuthState({ user: data.user, isLoading: false });
    }

    function clearAuth() {
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem(USER_STORAGE_KEY);
            } catch (error) {
                console.error('Failed to remove user from localStorage:', error);
            }
        }
        setAuthState({ user: null, isLoading: false });
    }
}

// カスタムフック
export const useAuth = () => useContext(AuthContext); 