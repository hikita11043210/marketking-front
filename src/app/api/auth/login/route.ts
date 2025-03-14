import { NextResponse } from 'next/server';
import type { User } from '@/lib/auth/types';

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

const API_BASE = process.env.BACKEND_URL?.replace('localhost', '127.0.0.1');

export async function POST(request: Request) {
    try {
        const credentials = await request.json();
        
        const response = await fetch(`${API_BASE}/api/v1/auth/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({
                error: 'login_failed',
                message: data.message || 'ログインに失敗しました'
            }, { status: response.status });
        }

        // レスポンスの型を保証
        const loginData = data as LoginResponse;

        // レスポンスヘッダーにCookieを設定
        const headers = new Headers();
        headers.append('Set-Cookie', `accessToken=${loginData.accessToken}; Path=/; HttpOnly; Max-Age=3600`);
        headers.append('Set-Cookie', `refreshToken=${loginData.refreshToken}; Path=/; HttpOnly; Max-Age=604800`);
        return NextResponse.json(loginData, {
            headers,
            status: 200,
        });
    } catch (error) {
        return NextResponse.json({
            error: 'internal_server_error',
            message: 'サーバーエラーが発生しました'
        }, { status: 500 });
    }
} 