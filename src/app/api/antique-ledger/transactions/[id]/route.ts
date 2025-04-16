import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = params;
    
    const response = await serverFetch(`/api/v1/antique-ledger/transactions/${id}/`, {
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        error: 'transaction_fetch_failed',
        message: data.message || '古物台帳の取得に失敗しました'
      }, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Transaction fetch error:', error);
    return NextResponse.json({
      error: 'internal_server_error',
      message: 'サーバーエラーが発生しました'
    }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const transactionData = await request.json();
    
    const response = await serverFetch(`/api/v1/antique-ledger/transactions/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        error: 'transaction_update_failed',
        message: data.message || '古物台帳の更新に失敗しました'
      }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Transaction update error:', error);
    return NextResponse.json({
      error: 'internal_server_error',
      message: 'サーバーエラーが発生しました'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = params;
    
    const response = await serverFetch(`/api/v1/antique-ledger/transactions/${id}/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json({
        error: 'transaction_delete_failed',
        message: data.message || '古物台帳の削除に失敗しました'
      }, { status: response.status });
    }

    return NextResponse.json({}, { status: 204 });
  } catch (error) {
    console.error('Transaction delete error:', error);
    return NextResponse.json({
      error: 'internal_server_error',
      message: 'サーバーエラーが発生しました'
    }, { status: 500 });
  }
} 