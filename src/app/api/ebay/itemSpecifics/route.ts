import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const ebayItemId = url.searchParams.get('ebayItemId');

        const response = await serverFetch(`/api/v1/ebay/itemSpecifics?ebayItemId=${ebayItemId}`, {
            cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({
                error: 'ebay_item_specifics_fetch_failed',
                message: data.message || '商品の詳細情報の取得に失敗しました'
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