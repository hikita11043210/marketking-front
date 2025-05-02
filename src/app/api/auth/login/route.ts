import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { User } from '@/context/AuthContext';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const API_BASE = (process.env.BACKEND_URL || 'http://localhost:8000').replace('localhost', '127.0.0.1');
        
        // バックエンドAPIにログインリクエストを送信
        const response = await fetch(`${API_BASE}/api/v1/auth/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: body.username,
                password: body.password,
            }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return NextResponse.json(
                { message: data.detail || 'ログインに失敗しました' },
                { status: response.status }
            );
        }
        
        // クッキーにトークンを保存
        cookies().set('accessToken', data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 1, // 1時間
        });
        
        cookies().set('refreshToken', data.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7日間
        });
        
        // ユーザーデータを正規化
        const user: User = {
            id: data.user?.id || 0,
            name: data.user?.name || data.user?.username || 'Unknown',
            email: data.user?.email || 'no-email@example.com'
        };
        
        // レスポンスにユーザー情報を含める
        return NextResponse.json({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            user: user,
        });
        
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'サーバーエラーが発生しました' },
            { status: 500 }
        );
    }
} 