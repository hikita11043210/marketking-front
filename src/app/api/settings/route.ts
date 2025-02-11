import { NextResponse } from 'next/server';
import type { Setting } from '@/types/settings';
import { serverFetch } from '@/app/api/server';

export async function GET() {
    try {
        const response = await serverFetch('/api/v1/settings/', {
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
        
        const response = await serverFetch('/api/v1/settings/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
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