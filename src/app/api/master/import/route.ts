import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export async function POST(request: Request) {
  try {
    // フォームデータを取得
    const formData = await request.formData();
    
    // バックエンドAPIにリクエストを送信
    const response = await serverFetch('/api/v1/master/import/', {
      method: 'POST',
      body: formData,
    });

    // バックエンドからのレスポンスを取得
    const data = await response.json();

    // クライアントへレスポンスを返す
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('インポート処理中にエラーが発生しました:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'import_failed',
        message: 'インポート処理中にエラーが発生しました'
      },
      { status: 500 }
    );
  }
} 