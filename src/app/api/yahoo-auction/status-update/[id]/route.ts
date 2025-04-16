import { NextResponse } from 'next/server';
import { serverFetch } from '@/app/api/server';

interface Params {
  params: {
    id: string;
  };
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const requestData = await request.json();
    
    const response = await serverFetch(`/api/v1/yahoo-auction/status-update/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        error: 'status_update_failed',
        message: data.detail || 'ステータスの更新に失敗しました'
      }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Yahoo auction status update error:', error);
    return NextResponse.json({
      error: 'internal_server_error',
      message: 'サーバーエラーが発生しました'
    }, { status: 500 });
  }
} 