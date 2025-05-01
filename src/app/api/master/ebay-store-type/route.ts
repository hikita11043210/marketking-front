import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export async function GET(request: Request) {
  try {
    // バックエンドAPIにリクエストを送信
    const response = await serverFetch('/api/v1/ebay-store-types/current/', {
      method: 'GET',
    });

    // バックエンドからのレスポンスを取得
    const data = await response.json();

    // クライアントへレスポンスを返す
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Ebayストアタイプ取得にエラーが発生しました:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'ebay_store_type_get_failed',
        message: 'Ebayストアタイプ取得にエラーが発生しました'
      },
      { status: 500 }
    );
  }
}
