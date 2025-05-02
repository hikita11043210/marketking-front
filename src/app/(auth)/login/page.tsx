'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LockKeyhole, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
    const router = useRouter();
    const { setAuth } = useAuth();
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

            // ユーザー情報をコンテキストに保存
            setAuth({
                user: data.user,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken
            });

            toast.success("ログインに成功しました");
            router.refresh();
            router.push('/dashboard');

        } catch (error) {
            toast.error(error instanceof Error ? error.message : "ログインに失敗しました");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
            <div className="w-full max-w-md px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Market King</h1>
                </div>

                <Card className="border-0 shadow-lg">
                    <CardContent>
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">ユーザー名</Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-3 text-gray-400">
                                        <User size={20} />
                                    </div>
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="ユーザー名を入力"
                                        className="pl-10"
                                        value={credentials.username}
                                        onChange={(e) => setCredentials(prev => ({
                                            ...prev,
                                            username: e.target.value
                                        }))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">パスワード</Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-3 text-gray-400">
                                        <LockKeyhole size={20} />
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="パスワードを入力"
                                        className="pl-10"
                                        value={credentials.password}
                                        onChange={(e) => setCredentials(prev => ({
                                            ...prev,
                                            password: e.target.value
                                        }))}
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-2 rounded-lg transition-all duration-200"
                                disabled={loading}
                            >
                                {loading ? 'ログイン中...' : 'ログイン'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-gray-600 mt-4">
                    アカウントをお持ちでない場合は、管理者にお問い合わせください。
                </p>
            </div>
        </div>
    );
} 