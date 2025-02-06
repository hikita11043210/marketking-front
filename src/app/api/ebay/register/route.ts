import { NextResponse } from 'next/server';
import apiClient from '@/lib/api/client';
import { ebayEndpoints } from '@/lib/api/endpoints/ebay';

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        const productData = await request.json();

        const { data } = await apiClient.post(ebayEndpoints.register, productData, {
            headers: {
                'Authorization': authHeader || '',
            }
        });
        
        return NextResponse.json(data);
    } catch (error) {
        console.error('Failed to register product on eBay:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : '商品の登録に失敗しました',
            },
            { status: 400 }
        );
    }
} 