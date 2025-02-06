import { NextResponse } from 'next/server';
import { searchYahooAuctionItems } from '@/lib/api/endpoints/search';
import { validateItemSearchParams } from '@/lib/validations/search';
import type { ItemSearchParams } from '@/lib/types/search';
import type { ErrorResponse } from '@/lib/types/api';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const searchCriteria = Object.fromEntries(searchParams) as ItemSearchParams;

        // バリデーション
        const validation = validateItemSearchParams(searchCriteria);
        if (!validation.isValid) {
            return NextResponse.json<ErrorResponse>(
                {
                    success: false,
                    message: validation.errors.join(', ')
                },
                { status: 400 }
            );
        }

        // 検索実行
        const response = await searchYahooAuctionItems(searchCriteria);
        return NextResponse.json(response);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json<ErrorResponse>(
            {
                success: false,
                message: error instanceof Error ? error.message : '商品検索に失敗しました'
            },
            { status: 500 }
        );
    }
} 