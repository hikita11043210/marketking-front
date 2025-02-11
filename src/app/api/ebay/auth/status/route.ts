import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export async function GET() {
    try {
        const response = await serverFetch('/api/v1/ebay/auth/status/');

        if (!response.ok) {
            throw new Error('認証状態の確認に失敗しました');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({
            error: 'status_check_failed',
            message: error instanceof Error ? error.message : '認証状態の確認に失敗しました'
        }, { status: 500 });
    }
}