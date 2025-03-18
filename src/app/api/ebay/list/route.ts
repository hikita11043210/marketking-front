import { NextRequest, NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search') || '';
        const page = searchParams.get('page') || '1';
        const limit = searchParams.get('limit') || '10';

        const response = await serverFetch(`/api/v1/list?search=${search}&page=${page}&limit=${limit}`, {
            cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            return NextResponse.json({
                error: 'list_fetch_failed',
                message: data.message || '一覧の取得に失敗しました'
            }, { status: response.status });
        }

        // データが存在しない場合のデフォルト値を設定
        const items = Array.isArray(data.data) ? data.data : [];
        const total = items.length; // 現状はtotalが返却されていないため、配列の長さを使用

        // バックエンドからのレスポンスをフロントエンド用に整形
        return NextResponse.json({
            items: items,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total,
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({
            error: 'internal_server_error',
            message: 'サーバーエラーが発生しました'
        }, { status: 500 });
    }
} 