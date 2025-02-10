import { NextResponse } from 'next/server';
import { settingApi } from '@/lib/api/endpoint/settings';
import { validateSettingParams } from '@/validations/setting';
import type { Setting } from '@/lib/types/setting';
import type { ErrorResponse } from '@/lib/types/api';

export async function GET() {
    try {
        const response = await settingApi.get();
        return NextResponse.json(response);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json<ErrorResponse>(
            {
                success: false,
                message: error instanceof Error ? error.message : '設定の取得に失敗しました'
            },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json() as Setting;

        // バリデーション
        const validation = validateSettingParams(body);
        if (!validation.isValid) {
            return NextResponse.json<ErrorResponse>(
                {
                    success: false,
                    message: validation.errors.join(', ')
                },
                { status: 400 }
            );
        }

        const response = await settingApi.update(body);
        return NextResponse.json(response);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json<ErrorResponse>(
            {
                success: false,
                message: error instanceof Error ? error.message : '設定の更新に失敗しました'
            },
            { status: 500 }
        );
    }
} 