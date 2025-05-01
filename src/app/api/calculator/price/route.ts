import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export async function POST(request: Request) {
    try {
        const { input_price, purchasePrice, purchaseShipping, shippingCost } = await request.json();

        // 価格計算APIを呼び出し（POSTメソッドで送信）
        const response = await serverFetch(`/api/v1/calculator-price/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input_price: input_price,
                purchasePrice: purchasePrice,
                purchaseShipping: purchaseShipping,
                shippingCost: shippingCost,
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

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const purchasePrice = searchParams.get('purchasePrice');
        const purchaseShipping = searchParams.get('purchaseShipping');
        const shippingCost = searchParams.get('shippingCost');
        // 価格計算APIを呼び出し（POSTメソッドで送信）
        const response = await serverFetch(`/api/v1/calculator-price?purchase_price=${purchasePrice}&purchase_shipping_price=${purchaseShipping}&ebay_shipping_cost=${shippingCost}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
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