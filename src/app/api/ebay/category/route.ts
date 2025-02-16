import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q');

        const response = await serverFetch(`/api/v1/category?q=${q}`, {
            cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({
                success: false,
                error: 'ebay_category_fetch_failed',
                message: data.message || 'カテゴリー情報の取得に失敗しました'
            }, { status: response.status });
        }

        // データをそのまま返す
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'internal_server_error',
            message: 'サーバーエラーが発生しました'
        }, { status: 500 });
    }
} 