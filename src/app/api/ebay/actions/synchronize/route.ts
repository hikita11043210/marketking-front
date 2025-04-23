import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const response = await serverFetch(`/api/v1/ebay/actions/synchronize/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({
                error: 'ebay_synchronize_failed',
                message: data.message || '商品情報の同期に失敗しました'
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