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

    // クライアントサイドでローカルストレージからユーザー情報を読み込む
    useEffect(() => {
        // ローカルストレージからユーザー情報を取得
        const loadUserFromStorage = () => {
            try {
                const storedUser = localStorage.getItem(USER_STORAGE_KEY);
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    setAuthState({
                        user,
                        isLoading: false,
                    });
                } else {
                    setAuthState({
                        user: null,
                        isLoading: false,
                    });
                }
            } catch (error) {
                console.error('Failed to load user from localStorage:', error);
                setAuthState({
                    user: null,
                    isLoading: false,
                });
            }
        };

        loadUserFromStorage();
    }, []);

    // ログイン情報を設定
    const setAuth = (data: { user: User; accessToken: string; refreshToken: string }) => {
        // ユーザー情報をローカルストレージに保存（クライアントサイドのみ）
        if (typeof window !== 'undefined' && data.user) {
            try {
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
            } catch (error) {
                console.error('Failed to save user to localStorage:', error);
            }
        }

        setAuthState({
            user: data.user,
            isLoading: false,
        });
    };

    // ログイン情報をクリア
    const clearAuth = () => {
        // ローカルストレージからユーザー情報を削除（クライアントサイドのみ）
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem(USER_STORAGE_KEY);
            } catch (error) {
                console.error('Failed to remove user from localStorage:', error);
            }
        }

        setAuthState({
            user: null,
            isLoading: false,
        });
    };

    return (
        <AuthContext.Provider
            value={{
                user: auth.user,
                isLoading: auth.isLoading,
                setAuth,
                clearAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// カスタムフック
export const useAuth = () => useContext(AuthContext); 