import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const cookieStore = cookies();
        
        // クッキーを削除
        cookieStore.delete('accessToken');
        cookieStore.delete('refreshToken');
        
        return NextResponse.json({ message: 'ログアウトに成功しました' });
    } catch (error) {
        return NextResponse.json({ message: 'ログアウト処理に失敗しました' }, { status: 500 });
    }
} 
