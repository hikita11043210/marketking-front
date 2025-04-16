import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

export async function GET() {
  try {
    const response = await serverFetch('/api/v1/antique-ledger/transaction-types/', {
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        error: 'transaction_types_fetch_failed',
        message: data.message || '取引区分の取得に失敗しました'
      }, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Transaction types fetch error:', error);
    return NextResponse.json({
      error: 'internal_server_error',
      message: 'サーバーエラーが発生しました'
    }, { status: 500 });
  }
} 