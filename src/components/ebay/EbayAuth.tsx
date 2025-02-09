import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ebayApi } from '@/lib/api/endpoint/ebay';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const EbayAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        // eBayトークンの存在確認
        const ebayToken = localStorage.getItem('ebayToken');
        setIsConnected(!!ebayToken);

        // URLからcodeパラメータを取得
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            handleExchangeCode(code);
        }
    }, []);

    // 認証URLを取得してリダイレクト
    const handleAuth = async () => {
        try {
            setIsLoading(true);
            const response = await ebayApi.getAuthUrl();
            if (response.success && response.data?.auth_url) {
                window.location.href = response.data.auth_url;
            } else {
                throw new Error('認証URLの取得に失敗しました');
            }
        } catch (error) {
            toast({
                title: 'エラー',
                description: error instanceof Error ? error.message : 'eBay認証の開始に失敗しました',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // 認証コードをトークンと交換
    const handleExchangeCode = async (code: string) => {
        try {
            setIsLoading(true);
            const response = await ebayApi.exchangeCodeForToken(code);

            if (response.success && response.data?.access_token) {
                // トークンを保存
                localStorage.setItem('ebayToken', response.data.access_token);
                if (response.data.refresh_token) {
                    localStorage.setItem('ebayRefreshToken', response.data.refresh_token);
                }

                setIsConnected(true);
                toast({
                    title: '成功',
                    description: 'eBayとの連携が完了しました',
                });

                // URLからcodeパラメータを削除
                const newUrl = window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
            } else {
                throw new Error('トークンの取得に失敗しました');
            }
        } catch (error) {
            toast({
                title: 'エラー',
                description: error instanceof Error ? error.message : 'eBayトークンの取得に失敗しました',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // 連携解除
    const handleDisconnect = () => {
        localStorage.removeItem('ebayToken');
        localStorage.removeItem('ebayRefreshToken');
        setIsConnected(false);
        toast({
            title: '連携解除',
            description: 'eBayとの連携を解除しました',
        });
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