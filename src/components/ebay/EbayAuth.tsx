// src/components/ebay/EbayAuth.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { showToast } from '@/lib/toast';

export const EbayAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        checkAuthStatus();

        // URLからcodeパラメータを取得
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            handleCallback(code);
        }
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch('/api/ebay/auth/status');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '認証状態の確認に失敗しました');
            }

            setIsConnected(data.is_connected);
        } catch (error) {
            showToast.error({
                description: error instanceof Error ? error.message : '認証状態の確認に失敗しました'
            });
        }
    };

    const handleAuth = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/ebay/auth/url');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '認証URLの取得に失敗しました');
            }
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('認証URLの取得に失敗しました');
            }
        } catch (error) {
            showToast.error({
                description: error instanceof Error ? error.message : 'eBay認証の開始に失敗しました'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCallback = async (code: string) => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/ebay/auth/callback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '認証処理に失敗しました');
            }

            setIsConnected(true);
            showToast.success({
                description: 'eBayとの連携が完了しました'
            });

            // URLからcodeパラメータを削除
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
            showToast.error({
                description: error instanceof Error ? error.message : '認証処理に失敗しました'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            const response = await fetch('/api/ebay/auth/disconnect', {
                method: 'POST'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '連携解除に失敗しました');
            }

            setIsConnected(false);
            showToast.success({
                description: 'eBayとの連携を解除しました'
            });
        } catch (error) {
            showToast.error({
                description: error instanceof Error ? error.message : '連携解除に失敗しました'
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-medium">連携状態:</span>
                    {isConnected ? (
                        <Badge className="bg-green-500">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            連携中
                        </Badge>
                    ) : (
                        <Badge variant="destructive">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            未連携
                        </Badge>
                    )}
                </div>
                {isConnected && (
                    <Button
                        variant="outline"
                        onClick={handleDisconnect}
                        className="text-red-500 hover:text-red-600"
                    >
                        連携を解除
                    </Button>
                )}
            </div>

            {!isConnected && (
                <Button
                    onClick={handleAuth}
                    disabled={isLoading}
                    className="w-full"
                >
                    {isLoading ? 'eBay認証中...' : 'eBayと連携する'}
                </Button>
            )}
        </div>
    );
};