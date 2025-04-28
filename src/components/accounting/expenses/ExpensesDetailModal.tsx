'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ExpenseItem } from '@/types/accounting';
import { formatDate, formatCurrency } from '@/lib/utils';

interface ExpensesDetailModalProps {
    expense: ExpenseItem | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ExpensesDetailModal({ expense, isOpen, onClose }: ExpensesDetailModalProps) {
    if (!expense) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>経費詳細</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm">基本情報</h3>
                        <div className="grid grid-cols-[2fr_3fr] gap-2 text-sm">
                            <div className="text-muted-foreground">取引日</div>
                            <div>{formatDate(expense.transaction_date)}</div>

                            <div className="text-muted-foreground">商品名</div>
                            <div>{expense.product_name}</div>

                            <div className="text-muted-foreground">詳細</div>
                            <div>{expense.detail || '-'}</div>

                            <div className="text-muted-foreground">価格</div>
                            <div>{formatCurrency(expense.price)}</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm">費用情報</h3>
                        <div className="grid grid-cols-[2fr_3fr] gap-2 text-sm">
                            <div className="text-muted-foreground">消費税</div>
                            <div>{formatCurrency(expense.tax)}</div>

                            <div className="text-muted-foreground">送料</div>
                            <div>{formatCurrency(expense.shipping_cost)}</div>

                            <div className="text-muted-foreground">合計金額</div>
                            <div className="font-semibold">{formatCurrency(expense.total_amount)}</div>
                        </div>
                    </div>

                    {expense.url && (
                        <div className="space-y-3">
                            <h3 className="font-semibold text-sm">リンク</h3>
                            <div className="grid grid-cols-[2fr_3fr] gap-2 text-sm">
                                <div className="text-muted-foreground">URL</div>
                                <div>
                                    <a href={expense.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                        {expense.url}
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {(expense.client_name || expense.client_company_name || expense.client_address) && (
                        <div className="space-y-3">
                            <h3 className="font-semibold text-sm">取引先情報</h3>
                            <div className="grid grid-cols-[2fr_3fr] gap-2 text-sm">
                                {expense.client_name && (
                                    <>
                                        <div className="text-muted-foreground">氏名</div>
                                        <div>{expense.client_name}</div>
                                    </>
                                )}

                                {expense.client_company_name && (
                                    <>
                                        <div className="text-muted-foreground">会社名</div>
                                        <div>{expense.client_company_name}</div>
                                    </>
                                )}

                                {expense.client_postal_code && (
                                    <>
                                        <div className="text-muted-foreground">郵便番号</div>
                                        <div>{expense.client_postal_code}</div>
                                    </>
                                )}

                                {expense.client_address && (
                                    <>
                                        <div className="text-muted-foreground">住所</div>
                                        <div>{expense.client_address}</div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
} 