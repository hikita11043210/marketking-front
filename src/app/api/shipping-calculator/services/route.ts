import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export async function GET() {
    try {
        const response = await serverFetch('/api/v1/shipping-calculator/services/', {
            cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({
                error: 'shipping_services_fetch_failed',
                message: data.message || '配送サービス一覧の取得に失敗しました'
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