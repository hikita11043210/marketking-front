import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const money = searchParams.getAll('money[]');

        if (!money.length) {
            return NextResponse.json({
                success: false,
                error: 'invalid_parameter',
                message: 'URLパラメータが指定されていません'
            }, { status: 400 });
        }

        const response = await serverFetch(`/api/v1/calculator-price-init?${money.map(money => `money[]=${encodeURIComponent(money)}`).join('&')}`, {
            cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({
                success: false,
                error: 'ebay_price_fetch_failed',
                message: data.message || '価格情報の取得に失敗しました'
            }, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'internal_server_error',
            message: 'サーバーエラーが発生しました'
        }, { status: 500 });
    }
} 