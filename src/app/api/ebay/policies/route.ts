import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const marketplaceId = searchParams.get('marketplaceId');
        const token = searchParams.get('token');

        if (!marketplaceId || !token) {
            return NextResponse.json({
                error: 'invalid_parameters',
                message: 'マーケットプレイスIDまたはトークンが指定されていません'
            }, { status: 400 });
        }

        const response = await serverFetch(`/api/v1/ebay/policies?marketplaceId=${marketplaceId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({
                error: 'ebay_policies_fetch_failed',
                message: data.message || 'ポリシー情報の取得に失敗しました'
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