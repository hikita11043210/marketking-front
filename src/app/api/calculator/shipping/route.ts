import { NextRequest, NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

// 送料計算API - GET: 国リスト取得 / POST: 送料計算
export async function GET(req: NextRequest) {
  try {
    // バックエンドAPIから国リストを取得
    const response = await serverFetch('/api/v1/utils/calculator-shipping/', {
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, message: errorData.message || '国リストの取得に失敗しました' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('国リスト取得エラー:', error);
    return NextResponse.json(
      { success: false, message: '予期せぬエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // リクエストボディを取得
    const requestBody = await req.json();
    
    // バリデーション
    if (!requestBody.country_code || !requestBody.weight) {
      return NextResponse.json(
        { success: false, message: '必須パラメータが不足しています' },
        { status: 400 }
      );
    }

    // バックエンドAPIに送料計算リクエストを送信
    const response = await serverFetch('/api/v1/utils/calculator-shipping/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, message: errorData.message || '送料計算に失敗しました' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('送料計算エラー:', error);
    return NextResponse.json(
      { success: false, message: '予期せぬエラーが発生しました' },
      { status: 500 }
    );
  }
} 