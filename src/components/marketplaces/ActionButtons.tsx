'use client';

import {
    ArrowDown01Icon,
    ArrowUpIcon,
    RefreshCcwIcon,
    ShoppingCartIcon,
    BanknoteIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';

interface LoadingButtonProps {
    loading: boolean;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
    icon: React.ReactNode;
    tooltipText: string;
}

const LoadingButton = ({
    loading,
    onClick,
    disabled,
    className,
    icon,
    tooltipText
}: LoadingButtonProps) => (
    <TooltipProvider delayDuration={300}>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    className={className}
                    size="sm"
                    onClick={onClick}
                    disabled={loading || disabled}
                >
                    {loading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                    ) : (
                        icon
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-gray-800 text-white border-none px-3 py-1 text-xs rounded">
                <p>{tooltipText}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

interface MarketplaceActionButtonsProps {
    itemType: 'auction' | 'freemarket';
    marketStatus: string;
    purchaseStatus: string;
    sku: string;
    actionLoading: string | null;
    onWithdraw: (sku: string) => void;
    onRelist: (sku: string) => void;
    onSynchronize: (sku: string) => void;
    onPurchase: (sku: string) => void;
    onSalesRegistration?: (sku: string) => void;
}

export function MarketplaceActionButtons({
    itemType,
    marketStatus,
    purchaseStatus,
    sku,
    actionLoading,
    onWithdraw,
    onRelist,
    onSynchronize,
    onPurchase,
    onSalesRegistration
}: MarketplaceActionButtonsProps) {
    const buttons = [];

    // 出品中の商品に対するアクション
    if (marketStatus === '出品中') {
        // 取下げボタン
        buttons.push(
            <LoadingButton
                key="withdraw"
                className="bg-gray-500 hover:bg-gray-600 text-white"
                onClick={() => onWithdraw(sku)}
                loading={actionLoading === `withdraw-${sku}`}
                icon={<ArrowDown01Icon className="h-4 w-4" />}
                disabled={!!actionLoading}
                tooltipText="取下げ"
            />
        );

        // 仕入ボタン（仕入可の場合のみ）
        if (purchaseStatus === '仕入可') {
            buttons.push(
                <LoadingButton
                    key="purchase"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => onPurchase(sku)}
                    loading={actionLoading === `purchase-${sku}`}
                    icon={<ShoppingCartIcon className="h-4 w-4" />}
                    disabled={!!actionLoading}
                    tooltipText="仕入"
                />
            );
        }

        // 同期ボタン
        buttons.push(
            <LoadingButton
                key="sync"
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => onSynchronize(sku)}
                loading={actionLoading === `sync-${sku}`}
                icon={<RefreshCcwIcon className="h-4 w-4" />}
                disabled={!!actionLoading}
                tooltipText="同期"
            />
        );
    }
    // 取下げ状態の商品に対するアクション
    else if (marketStatus === '取下げ') {
        // 再出品ボタン（仕入可または仕入済の場合）
        if (purchaseStatus === '仕入可' || purchaseStatus === '仕入済') {
            buttons.push(
                <LoadingButton
                    key="republish"
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => onRelist(sku)}
                    loading={actionLoading === `relist-${sku}`}
                    icon={<ArrowUpIcon className="h-4 w-4" />}
                    disabled={!!actionLoading}
                    tooltipText="再出品済"
                />
            );
        }

        // 同期ボタン（仕入不可の場合のみ）
        if (purchaseStatus === '仕入不可') {
            buttons.push(
                <LoadingButton
                    key="sync"
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => onSynchronize(sku)}
                    loading={actionLoading === `sync-${sku}`}
                    icon={<RefreshCcwIcon className="h-4 w-4" />}
                    disabled={!!actionLoading}
                    tooltipText="同期"
                />
            );
        }
    }
    // 売却状態の商品に対するアクション
    else if (marketStatus === '売却') {
        // 仕入ボタン（仕入可の場合）
        if (purchaseStatus === '仕入可') {
            buttons.push(
                <LoadingButton
                    key="purchase"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => onPurchase(sku)}
                    loading={actionLoading === `purchase-${sku}`}
                    icon={<ShoppingCartIcon className="h-4 w-4" />}
                    disabled={!!actionLoading}
                    tooltipText="仕入"
                />
            );
        }

        // 売上登録ボタン（オークションのみ）
        buttons.push(
            <LoadingButton
                key="sales"
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                onClick={() => onSalesRegistration?.(sku)}
                loading={actionLoading === `sales-${sku}`}
                icon={<BanknoteIcon className="h-4 w-4" />}
                disabled={!!actionLoading}
                tooltipText="売上登録"
            />
        );

        // 同期ボタン
        buttons.push(
            <LoadingButton
                key="sync"
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => onSynchronize(sku)}
                loading={actionLoading === `sync-${sku}`}
                icon={<RefreshCcwIcon className="h-4 w-4" />}
                disabled={!!actionLoading}
                tooltipText="同期"
            />
        );
    }

    return (
        <div className="flex gap-1 justify-center">
            {buttons}
        </div>
    );
} 