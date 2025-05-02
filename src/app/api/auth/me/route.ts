import { NextResponse } from 'next/server';
import type { User } from '@/context/AuthContext';
import { serverFetch } from '@/app/api/server';
export async function POST(request: Request) {
    try {
        // ユーザ情報を取得
        const response = await serverFetch(`/api/v1/auth/me/`, {
            method: 'POST',
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return NextResponse.json(
                { message: data.detail || 'ユーザー情報の取得に失敗しました' },
                { status: response.status }
            );
        }
        
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