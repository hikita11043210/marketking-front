import { NextRequest, NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const response = await serverFetch(`/api/v1/purchases/${id}/`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.detail || '仕入データの取得に失敗しました' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('仕入データ取得エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const response = await serverFetch(`/api/v1/purchases/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.detail || '仕入データの更新に失敗しました' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('仕入データ更新エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    const response = await serverFetch(`/api/v1/purchases/${id}/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ detail: '仕入データの削除に失敗しました' }));
      return NextResponse.json({ error: data.detail || '仕入データの削除に失敗しました' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('仕入データ削除エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
} 