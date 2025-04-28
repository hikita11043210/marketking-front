'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PurchaseItem } from '@/types/accounting';
import { formatDate, formatCurrency } from '@/lib/utils';

interface PurchaseDetailModalProps {
    purchase: PurchaseItem | null;
    isOpen: boolean;
    onClose: () => void;
}

export function PurchaseDetailModal({ purchase, isOpen, onClose }: PurchaseDetailModalProps) {
    if (!purchase) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>仕入詳細</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm">基本情報</h3>
                        <div className="grid grid-cols-[2fr_3fr] gap-2 text-sm">
                            <div className="text-muted-foreground">取引日</div>
                            <div>{formatDate(purchase.transaction_date)}</div>

                            <div className="text-muted-foreground">商品名</div>
                            <div>{purchase.product_name}</div>

                            <div className="text-muted-foreground">管理コード</div>
                            <div>{purchase.management_code || '-'}</div>

                            <div className="text-muted-foreground">数量</div>
                            <div>{purchase.quantity}</div>

                            <div className="text-muted-foreground">単価</div>
                            <div>{formatCurrency(purchase.price)}</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm">金額情報</h3>
                        <div className="grid grid-cols-[2fr_3fr] gap-2 text-sm">
                            <div className="text-muted-foreground">消費税</div>
                            <div>{formatCurrency(purchase.tax)}</div>

                            <div className="text-muted-foreground">送料</div>
                            <div>{formatCurrency(purchase.shipping_cost)}</div>

                            <div className="text-muted-foreground">合計金額</div>
                            <div className="font-semibold">{formatCurrency(purchase.total_amount)}</div>

                            <div className="text-muted-foreground">請求書番号</div>
                            <div>{purchase.invoice_number || '-'}</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm">顧客情報</h3>
                        <div className="grid grid-cols-[2fr_3fr] gap-2 text-sm">
                            <div className="text-muted-foreground">顧客名</div>
                            <div>{purchase.client_name || '-'}</div>

                            <div className="text-muted-foreground">会社名</div>
                            <div>{purchase.client_company_name || '-'}</div>

                            <div className="text-muted-foreground">郵便番号</div>
                            <div>{purchase.client_postal_code || '-'}</div>

                            <div className="text-muted-foreground">住所</div>
                            <div>{purchase.client_address || '-'}</div>

                            <div className="text-muted-foreground">職業</div>
                            <div>{purchase.client_occupation || '-'}</div>

                            <div className="text-muted-foreground">年齢</div>
                            <div>{purchase.client_age || '-'}</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm">その他情報</h3>
                        <div className="grid grid-cols-[2fr_3fr] gap-2 text-sm">
                            <div className="text-muted-foreground">URL</div>
                            <div>
                                {purchase.url ? (
                                    <a
                                        href={purchase.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        {purchase.url}
                                    </a>
                                ) : (
                                    '-'
                                )}
                            </div>

                            <div className="text-muted-foreground">識別タイプ</div>
                            <div>{purchase.identification_type || '-'}</div>

                            <div className="text-muted-foreground">識別番号</div>
                            <div>{purchase.identification_number || '-'}</div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>閉じる</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}