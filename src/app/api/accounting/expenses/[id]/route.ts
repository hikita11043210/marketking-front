import { NextRequest, NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export const dynamic = 'force-dynamic';

// 経費詳細取得
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        
        const response = await serverFetch(`/api/v1/expenses/${id}/`);
        
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

// 経費更新
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const data = await request.json();
        
        const response = await serverFetch(`/api/v1/expenses/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { message: errorData.message || '経費データの更新に失敗しました' },
                { status: response.status }
            );
        }
        
        const responseData = await response.json();
        return NextResponse.json(responseData);
    } catch (error) {
        console.error('経費データ更新エラー:', error);
        return NextResponse.json(
            { message: '経費データの更新に失敗しました' },
            { status: 500 }
        );
    }
}

// 経費削除
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        
        const response = await serverFetch(`/api/v1/expenses/${id}/`, {
            method: 'DELETE',
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { message: errorData.message || '経費データの削除に失敗しました' },
                { status: response.status }
            );
        }
        
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('経費データ削除エラー:', error);
        return NextResponse.json(
            { message: '経費データの削除に失敗しました' },
            { status: 500 }
        );
    }
} 