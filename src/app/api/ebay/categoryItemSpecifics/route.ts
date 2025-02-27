import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const categoryId = url.searchParams.get('categoryId');
        const title = url.searchParams.get('title');
        const description = url.searchParams.get('description');

        const response = await serverFetch(`/api/v1/ebay/categoryItemSpecifics?categoryId=${categoryId}&title=${title}&description=${description}`, {
            cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({
                error: 'ebay_category_item_specifics_fetch_failed',
                message: data.message || 'カテゴリーのItem Specificsの取得に失敗しました'
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