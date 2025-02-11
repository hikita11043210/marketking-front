import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';
import { cookies } from 'next/headers';

export async function getAuthHeader() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;
    return accessToken ? `Bearer ${accessToken}` : refreshToken ? `Bearer ${refreshToken}` : '';
}

export async function POST(request: Request) {
    try {
        // バックエンドのログアウトAPIを呼び出し
        const response = await serverFetch('/api/v1/auth/logout/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': await getAuthHeader(),
            },
        });

        if (!response.ok) {
            const data = await response.json();
            return NextResponse.json({
                success: false,
                message: data.message || 'ログアウトに失敗しました'
            }, { status: response.status });
        }

        // レスポンスを作成
        const nextResponse = NextResponse.json({
            success: true,
            message: 'ログアウトしました'
        });

        // クッキーを削除（過去の日付を設定）
        nextResponse.headers.set(
            'Set-Cookie',
            [
                'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
                'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
            ].join(', ')
        );

        return nextResponse;
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: 'ログアウトに失敗しました'
        }, { status: 500 });
    }
} 
