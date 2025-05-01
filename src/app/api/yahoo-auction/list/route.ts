import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const search = url.searchParams.get('search') || '';
        const sku = url.searchParams.get('sku') || '';
        const status = url.searchParams.get('status') || '';
        const yahoo_status = url.searchParams.get('yahoo_status') || '';
        const page = url.searchParams.get('page') || '1';
        const limit = url.searchParams.get('limit') || '';

        const queryParams = new URLSearchParams();
        if (search) queryParams.set('search', search);
        if (sku) queryParams.set('sku', sku);
        if (status) queryParams.set('status', status);
        if (yahoo_status) queryParams.set('yahoo_status', yahoo_status);
        if (page) queryParams.set('page', page);
        if (limit) queryParams.set('limit', limit);

        const response = await serverFetch(`/api/v1/yahoo-auction/list?${queryParams.toString()}`, {
            cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            return NextResponse.json({
                error: 'yahoo_auction_list_fetch_failed',
                message: data.message || '一覧の取得に失敗しました'
            }, { status: response.status });
        }

        // データが存在しない場合のデフォルト値を設定
        const items = Array.isArray(data.data.items) ? data.data.items : [];
        const total = items.length; // 現状はtotalが返却されていないため、配列の長さを使用

        // バックエンドからのレスポンスをフロントエンド用に整形
        return NextResponse.json({
            items: items,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total,
            counts: data.data.counts
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({
            error: 'yahoo_auction_list_fetch_failed',
            message: '一覧の取得に失敗しました'
        }, { status: 500 });
    }
} 

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const sku = url.searchParams.get('sku') || '';

        const response = await serverFetch(`/api/v1/yahoo-auction/delete?sku=${sku}`, {
            method: 'DELETE',
            cache: 'no-store',
        });

        const data = await response.json();
        
        if (!response.ok || !data.success) {
            return NextResponse.json({
                error: 'yahoo_auction_delete_failed',
                message: data.message || '削除に失敗しました'
            }, { status: response.status });
        }

        return NextResponse.json({
            message: '削除に成功しました'
        }, { status: 200 });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({
            error: 'yahoo_auction_delete_failed',
            message: '削除に失敗しました'
        }, { status: 500 });
    }
}
