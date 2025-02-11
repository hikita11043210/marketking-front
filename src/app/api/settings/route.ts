import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { Setting } from '@/types/settings';

// IPv4形式で明示的に指定
const API_BASE = process.env.API_BASE_URL?.replace('localhost', '127.0.0.1');
async function getAuthHeader() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    return accessToken ? `Bearer ${accessToken}` : '';
}

export async function GET() {
    try {
        const response = await fetch(`${API_BASE}/api/v1/settings/`, {
            headers: {
                'Authorization': await getAuthHeader(),
            },
            cache: 'no-store',
        });
        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({
                error: 'settings_fetch_failed',
                message: data.message || '設定の取得に失敗しました'
            }, { status: response.status });
        }
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({
            error: 'internal_server_error',
            message: 'サーバーエラーが発生しました'
        }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const settings: Setting = await request.json();
        
        const response = await fetch(`${API_BASE}/api/v1/settings/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': await getAuthHeader(),
            },
            body: JSON.stringify(settings),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({
                error: 'settings_update_failed',
                message: data.message || '設定の更新に失敗しました'
            }, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Settings update error:', error);
        return NextResponse.json({
            error: 'internal_server_error',
            message: 'サーバーエラーが発生しました'
        }, { status: 500 });
    }
}