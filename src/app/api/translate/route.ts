import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        if (process.env.MODE === 'dev') {
            return NextResponse.json(NextResponse.json({
                error: 'dev mode',
                message: 'dev mode'
            }, { status: 400 })
            );
        }

        const response = await serverFetch(`/api/v1/translate/?${searchParams}`, {
            cache: 'no-store',
        });
        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({
                error: 'translation_fetch_failed',
                message: data.message || '翻訳の取得に失敗しました'
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