'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'ログインに失敗しました');
            }

            showToast.success({ description: "ログインに成功しました" });

            // リダイレクト処理を修正
            router.refresh();
            router.push('/dashboard');

        } catch (error) {
            showToast.error({
                description: error instanceof Error ? error.message : "ログインに失敗しました"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>ログイン</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                placeholder="ユーザー名"
                                value={credentials.username}
                                onChange={(e) => setCredentials(prev => ({
                                    ...prev,
                                    username: e.target.value
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="パスワード"
                                value={credentials.password}
                                onChange={(e) => setCredentials(prev => ({
                                    ...prev,
                                    password: e.target.value
                                }))}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'ログイン中...' : 'ログイン'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
} 