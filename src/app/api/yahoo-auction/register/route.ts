import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');
        const title = searchParams.get('title');

        if (!url || !title) {
            return NextResponse.json({
                success: false,
                error: 'invalid_parameter',
                message: '必要なパラメータが不足しています'
            }, { status: 400 });
        }

        // 並列で各APIリクエストを実行
        const [detailResponse, titleTranslateResponse] = await Promise.all([
            serverFetch(`/api/v1/yahoo-auction/detail?url=${encodeURIComponent(url)}`),
            serverFetch(`/api/v1/translate?text=${encodeURIComponent(title)}`),
        ]);

        const [detailData, titleTranslateData] = await Promise.all([
            detailResponse.json(),
            titleTranslateResponse.json(),
        ]);

        if (!detailResponse.ok || !detailData.success) {
            return NextResponse.json({
                success: false,
                error: 'detail_fetch_failed',
                message: '商品詳細の取得に失敗しました'
            }, { status: detailResponse.status });
        }

        // 商品状態の翻訳を実行（商品詳細が取得できた場合のみ）
        let conditionTranslateData = { success: false, data: { translated_text: '' } };
        if (detailData.data.data.condition) {
            const conditionResponse = await serverFetch(`/api/v1/translate?text=${encodeURIComponent(detailData.data.data.condition)}`);
            conditionTranslateData = await conditionResponse.json();
        }

        // 価格計算
        const priceArray = [
            detailData.data.data.buy_now_price || detailData.data.data.price || '0',
            detailData.data.data.shipping || '0',
        ];
        const priceResponse = await serverFetch(`/api/v1/price-calculator?${priceArray.map(price => `money[]=${encodeURIComponent(price)}`).join('&')}`);
        const priceData = await priceResponse.json();

        return NextResponse.json({
            success: true,
            data: {
                detail: detailData.data.data,
                translated_title: titleTranslateData.success ? titleTranslateData.data.translated_text : title,
                translated_condition: conditionTranslateData.success ? conditionTranslateData.data.translated_text : detailData.data.data.condition || '',
                price: priceData.success ? priceData.data.calculated_price : '0',
            }
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'internal_server_error',
            message: 'サーバーエラーが発生しました'
        }, { status: 500 });
    }
} 