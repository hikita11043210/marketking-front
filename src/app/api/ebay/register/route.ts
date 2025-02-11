import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({
                error: 'unauthorized',
                message: '認証情報が不足しています'
            }, { status: 401 });
        }

        const response = await serverFetch('/api/v1/ebay/register', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({
                error: 'ebay_register_failed',
                message: data.message || '商品の登録に失敗しました'
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