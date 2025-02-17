import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const price = searchParams.get('price');
        if (!price) {
            return NextResponse.json({
                success: false,
                error: 'invalid_parameter',
                message: '価格が指定されていません'
            }, { status: 400 });
        }

        // 価格計算APIを呼び出し（POSTメソッドで送信）
        const response = await serverFetch(`/api/v1/calculator-price/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                money: price
            }),
            cache: 'no-store',
        });
        const data = await response.json();
        if (!response.ok) {
            return NextResponse.json({
                success: false,
                error: 'price_calculation_failed',
                message: data.message || '価格計算に失敗しました'
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
