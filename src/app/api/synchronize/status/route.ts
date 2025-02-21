import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export async function GET(request: Request) {
    try {
        console.log('synchronize server');
        const response = await serverFetch(`/api/v1/synchronize/status/`, {
            cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({
                error: 'synchronize_status_fetch_failed',
                message: data.message || 'ステータスの同期に失敗しました'
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