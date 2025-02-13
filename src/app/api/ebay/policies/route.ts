import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

// サーバーサイドキャッシュ（推奨）
const cache = new Map<string, { data: any; timestamp: number }>();

export async function GET(request: Request) {
    try {
        // キャッシュキー（ユーザー別に分ける場合はセッションIDなどを追加）
        const cacheKey = 'ebay-policies';

        // キャッシュチェック（有効期間5分）
        if (cache.has(cacheKey) && Date.now() - cache.get(cacheKey)!.timestamp < 300_000) {
            return NextResponse.json(cache.get(cacheKey)!.data);
        }

        const response = await serverFetch(`/api/v1/ebay/policies`, {
            cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({
                error: 'ebay_policies_fetch_failed',
                message: data.message || 'ポリシー情報の取得に失敗しました'
            }, { status: response.status });
        }

        // キャッシュに保存
        cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({
            error: 'internal_server_error',
            message: 'サーバーエラーが発生しました'
        }, { status: 500 });
    }
} 