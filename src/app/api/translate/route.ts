import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const text = searchParams.get('text');

        if (!text) {
            return NextResponse.json({
                success: false,
                error: 'invalid_parameter',
                message: '翻訳するテキストが指定されていません'
            }, { status: 400 });
        }

        if (process.env.MODE === 'dev') {
            return NextResponse.json({
                success: true,
                data: {
                    translated_text: text // 開発モードでは元のテキストをそのまま返す
                }
            });
        }

        const response = await serverFetch(`/api/v1/translate/?${searchParams}`, {
            cache: 'no-store',
        });
        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({
                success: false,
                error: 'translation_fetch_failed',
                message: data.message || '翻訳の取得に失敗しました'
            }, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'internal_server_error',
            message: 'サーバーエラーが発生しました'
        }, { status: 500 });
    }
} 