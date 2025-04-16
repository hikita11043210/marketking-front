import { NextRequest, NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export async function GET(request: NextRequest) {
  try {
    // URLから検索パラメータを取得
    const searchParams = request.nextUrl.searchParams;
    const url = `/api/v1/antique-ledger/transactions/?${searchParams.toString()}`;

    const response = await serverFetch(url, {
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        error: 'transactions_fetch_failed',
        message: data.message || '古物台帳の取得に失敗しました'
      }, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Transactions fetch error:', error);
    return NextResponse.json({
      error: 'internal_server_error',
      message: 'サーバーエラーが発生しました'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const transactionData = await request.json();
    
    const response = await serverFetch('/api/v1/antique-ledger/transactions/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        error: 'transaction_create_failed',
        message: data.message || '古物台帳の登録に失敗しました'
      }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Transaction create error:', error);
    return NextResponse.json({
      error: 'internal_server_error',
      message: 'サーバーエラーが発生しました'
    }, { status: 500 });
  }
} 