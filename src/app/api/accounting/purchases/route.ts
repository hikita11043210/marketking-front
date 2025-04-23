import { NextRequest, NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '10';
    const searchTerm = searchParams.get('search') || '';

    const queryParams = new URLSearchParams({
      page,
      page_size: pageSize,
      ...(searchTerm && { search: searchTerm }),
    }).toString();

    const response = await serverFetch(`/api/v1/purchases/?${queryParams}`);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await serverFetch('/api/v1/purchases/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.detail || '仕入データの登録に失敗しました' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('仕入データ登録エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
} 