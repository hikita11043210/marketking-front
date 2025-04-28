'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PurchaseItem } from '@/types/accounting';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { PurchaseTable } from '@/components/accounting/purchases/PurchaseTable';
import { PurchaseDetailModal } from '@/components/accounting/purchases/PurchaseDetailModal';
import { PurchaseForm } from '@/components/accounting/purchases/PurchaseForm';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Pagination } from '@/components/common/Pagination';

export default function PurchasesPage() {
    const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPurchase, setSelectedPurchase] = useState<PurchaseItem | undefined>();
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const router = useRouter();

    const fetchPurchases = async (page = 1, search = '') => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: '10',
                ...(search && { search }),
            }).toString();

            const response = await fetch(`/api/accounting/purchases?${queryParams}`);

            if (!response.ok) {
                throw new Error('仕入データの取得に失敗しました');
            }

            const data = await response.json();

            setPurchases(data.results || []);
            setTotalPages(Math.ceil((data.count || 0) / 10));
            setCurrentPage(page);
        } catch (error) {
            console.error('仕入データ取得エラー:', error);
            toast.error('仕入データの取得に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPurchases(currentPage, searchTerm);
    }, [currentPage]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
        fetchPurchases(1, term);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleRefresh = () => {
        fetchPurchases(currentPage, searchTerm);
    };

    const handleAddNew = () => {
        setSelectedPurchase(undefined);
        setShowFormModal(true);
    };

    const handleViewPurchase = (purchase: PurchaseItem) => {
        setSelectedPurchase(purchase);
        setShowDetailModal(true);
    };

    const handleEditPurchase = (purchase: PurchaseItem) => {
        setSelectedPurchase(purchase);
        setShowFormModal(true);
    };

    const handleDeletePurchase = (id: string) => {
        setDeleteId(id);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/accounting/purchases/${deleteId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('仕入データの削除に失敗しました');
            }

            toast.success('仕入データを削除しました');
            setShowDeleteDialog(false);

            // 再読み込み
            fetchPurchases(currentPage, searchTerm);
        } catch (error) {
            console.error('仕入データ削除エラー:', error);
            toast.error('仕入データの削除に失敗しました');
        } finally {
            setIsSubmitting(false);
            setDeleteId(null);
        }
    };

    const handleSubmit = async (data: Partial<PurchaseItem>) => {
        setIsSubmitting(true);
        try {
            const url = data.id
                ? `/api/accounting/purchases/${data.id}`
                : '/api/accounting/purchases';

            const method = data.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(data.id ? '仕入データの更新に失敗しました' : '仕入データの登録に失敗しました');
            }

            toast.success(data.id ? '仕入データを更新しました' : '仕入データを登録しました');

            // モーダルを閉じる
            setShowFormModal(false);

            // 再読み込み
            fetchPurchases(currentPage, searchTerm);
        } catch (error) {
            toast.error(data.id ? '仕入データの更新に失敗しました' : '仕入データの登録に失敗しました');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">仕入管理</h2>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCcw className="h-4 w-4" />
                        )}
                        <span className="sr-only">更新</span>
                    </Button>
                    <Button onClick={handleAddNew}>
                        <Plus className="mr-2 h-4 w-4" />
                        新規登録
                    </Button>
                </div>
            </div>

            <PurchaseTable
                purchases={purchases}
                onView={handleViewPurchase}
                onEdit={handleEditPurchase}
                onDelete={handleDeletePurchase}
                onSearch={handleSearch}
            />

            {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            <PurchaseDetailModal
                purchase={selectedPurchase || null}
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setTimeout(() => setSelectedPurchase(undefined), 100);
                }}
            />

            <PurchaseForm
                purchase={selectedPurchase}
                isOpen={showFormModal}
                onClose={() => {
                    setShowFormModal(false);
                    setTimeout(() => setSelectedPurchase(undefined), 100);
                }}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>仕入データの削除</AlertDialogTitle>
                        <AlertDialogDescription>
                            この仕入データを削除してもよろしいですか？この操作は取り消せません。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isSubmitting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    削除中...
                                </>
                            ) : (
                                "削除する"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 