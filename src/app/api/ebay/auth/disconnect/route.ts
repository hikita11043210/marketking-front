import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export async function POST() {
    try {
        const response = await serverFetch('/api/v1/ebay/auth/disconnect/', {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error('連携解除に失敗しました');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({
            error: 'disconnect_failed',
            message: error instanceof Error ? error.message : '連携解除に失敗しました'
        }, { status: 500 });
    }
}