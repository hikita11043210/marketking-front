import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export async function POST(request: Request) {
    try {
        const { code } = await request.json();
        
        const response = await serverFetch('/api/v1/ebay/auth/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
        });

        if (!response.ok) {
            throw new Error('認証処理に失敗しました');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({
            error: 'auth_callback_failed',
            message: error instanceof Error ? error.message : '認証処理に失敗しました'
        }, { status: 500 });
    }
}