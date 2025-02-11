import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export async function GET() {
    try {
        const response = await serverFetch('/api/v1/ebay/auth/url/');

        if (!response.ok) {
            throw new Error('認証URLの取得に失敗しました');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({
            error: 'auth_url_failed',
            message: error instanceof Error ? error.message : '認証URLの取得に失敗しました'
        }, { status: 500 });
    }
}