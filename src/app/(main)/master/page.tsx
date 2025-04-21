'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MasterPage() {
    const router = useRouter();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        マスターデータインポート
                    </CardTitle>
                    <CardDescription>
                        配送料金マスターや国マスターをExcelファイルからインポートします
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={() => router.push('/master/import')}
                        className="w-full"
                    >
                        インポート画面へ
                        <Upload className="ml-2 h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>

            {/* 将来的に他のマスタ管理機能を追加する場合はここに追加 */}
        </div>
    );
} 