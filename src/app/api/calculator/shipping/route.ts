import { NextRequest, NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

// 送料計算API - GET: 国リスト取得 / POST: 送料計算
export async function GET(req: NextRequest) {
  try {
    // バックエンドAPIから国リストを取得
    const response = await serverFetch('/api/v1/shipping-calculator/', {
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
    
    // 重複するcodeを持つ国を除外（一意のcodeを持つ国リストを作成）
    if (data?.success && Array.isArray(data?.data?.countries)) {
      const uniqueCountries: { code: string; name: string }[] = [];
      const codeSet = new Set<string>();
      
      data.data.countries.forEach((country: any) => {
        // codeとnameがnullまたはundefinedでないことを確認
        if (country && country.code && country.name) {
          if (!codeSet.has(country.code)) {
            codeSet.add(country.code);
            uniqueCountries.push({
              code: country.code,
              name: country.name
            });
          }
        }
      });
      
      // 一意の国リストで置き換え
      data.data.countries = uniqueCountries;
    }
    
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
    if (!requestBody?.country_code || !requestBody?.weight) {
      return NextResponse.json(
        { success: false, message: '必須パラメータが不足しています' },
        { status: 400 }
      );
    }

    // 重量のバリデーション
    const weight = Number(requestBody.weight);
    if (isNaN(weight) || weight <= 0) {
      return NextResponse.json(
        { success: false, message: '重量は0より大きい値を入力してください' },
        { status: 400 }
      );
    }

    // 寸法のバリデーション（存在する場合）
    if ((requestBody.length !== undefined && (isNaN(Number(requestBody.length)) || Number(requestBody.length) < 0)) ||
        (requestBody.width !== undefined && (isNaN(Number(requestBody.width)) || Number(requestBody.width) < 0)) ||
        (requestBody.height !== undefined && (isNaN(Number(requestBody.height)) || Number(requestBody.height) < 0))) {
      return NextResponse.json(
        { success: false, message: '寸法には0以上の値を入力してください' },
        { status: 400 }
      );
    }

    // バックエンドAPIに送料計算リクエストを送信
    const response = await serverFetch('/api/v1/shipping-calculator/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, message: errorData?.message || '送料計算に失敗しました' },
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