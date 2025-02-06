import { NextResponse } from 'next/server';
import { searchApi } from '@/lib/api/endpoints/search';
import { validateCategorySearchParams } from '@/lib/validations/search';
import type { CategorySearchParams } from '@/lib/types/search';
import type { ErrorResponse } from '@/lib/types/api';


export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const searchCriteria = Object.fromEntries(searchParams) as CategorySearchParams;

        // バリデーション
        const validation = validateCategorySearchParams(searchCriteria);
        if (!validation.isValid) {
            return NextResponse.json<ErrorResponse>(
                {
                    success: false,
                    message: validation.errors.join(', ')
                },
                { status: 400 }
            );
        }

        // カテゴリ検索実行
        const response = await searchApi.searchYahooAuctionCategories(searchCriteria);
        return NextResponse.json(response);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json<ErrorResponse>(
            {
                success: false,
                message: error instanceof Error ? error.message : 'カテゴリ検索に失敗しました'
            },
            { status: 500 }
        );
    }
} 