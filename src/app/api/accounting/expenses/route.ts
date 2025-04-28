import { NextRequest, NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export const dynamic = 'force-dynamic';

// 経費一覧取得
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = searchParams.get('page') || '1';
        const pageSize = searchParams.get('pageSize') || '10';
        const search = searchParams.get('search') || '';

        // 検索パラメータを構築
        const queryParams = new URLSearchParams({
            page,
            page_size: pageSize,
            ...(search && { search }),
        });

        const response = await serverFetch(`/api/v1/expenses/?${queryParams.toString()}`);

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { message: errorData.message || '経費データの取得に失敗しました' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('経費データ取得エラー:', error);
        return NextResponse.json(
            { message: '経費データの取得に失敗しました' },
            { status: 500 }
        );
    }
}

// 経費新規登録
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        const response = await serverFetch('/api/v1/expenses/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { message: errorData.message || '経費データの登録に失敗しました' },
                { status: response.status }
            );
        }

        const responseData = await response.json();
        return NextResponse.json(responseData);
    } catch (error) {
        console.error('経費データ登録エラー:', error);
        return NextResponse.json(
            { message: '経費データの登録に失敗しました' },
            { status: 500 }
        );
    }
} 