'use client';

import { useState, useEffect } from 'react';
import { SalesTable } from '@/components/accounting/sales/SalesTable';
import { SalesDetailModal } from '@/components/accounting/sales/SalesDetailModal';
import { SalesForm } from '@/components/accounting/sales/SalesForm';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SalesItem } from '@/types/accounting';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Pagination } from '@/components/common/Pagination';

export default function SalesPage() {
    const [sales, setSales] = useState<SalesItem[]>([]);
    const [selectedSale, setSelectedSale] = useState<SalesItem | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchSales = async (page = 1, search = '') => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: '10',
                ...(search && { search }),
            }).toString();

            const response = await fetch(`/api/accounting/sales?${queryParams}`);

            if (!response.ok) {
                throw new Error('売上データの取得に失敗しました');
            }

            const data = await response.json();

            setSales(data.results || []);
            setTotalPages(Math.ceil((data.count || 0) / 10));
            setCurrentPage(page);
        } catch (error) {
            console.error('売上データ取得エラー:', error);
            toast.error('売上データの取得に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSales(currentPage, searchTerm);
    }, [currentPage]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
        fetchSales(1, term);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleRefresh = () => {
        fetchSales(currentPage, searchTerm);
    };

    const handleViewSale = (sale: SalesItem) => {
        setSelectedSale(sale);
        setShowDetailModal(true);
    };

    const handleEditSale = (sale: SalesItem) => {
        setSelectedSale(sale);
        setShowFormModal(true);
    };

    const handleDeleteSale = (id: string) => {
        setDeleteId(id);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/accounting/sales/${deleteId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('売上データの削除に失敗しました');
            }

            toast.success('売上データを削除しました');

            // 再読み込み
            fetchSales(currentPage, searchTerm);
        } catch (error) {
            toast.error('売上データの削除に失敗しました');
        } finally {
            setIsSubmitting(false);
            setShowDeleteDialog(false);
            setDeleteId(null);
        }
    };

    const handleAddNew = () => {
        setSelectedSale(undefined);
        setShowFormModal(true);
    };

    const handleSubmit = async (data: Partial<SalesItem>) => {
        setIsSubmitting(true);
        try {
            const url = data.id
                ? `/api/accounting/sales/${data.id}`
                : '/api/accounting/sales';

            const method = data.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(data.id ? '売上データの更新に失敗しました' : '売上データの登録に失敗しました');
            }

            toast.success(data.id ? '売上データを更新しました' : '売上データを登録しました');

            // モーダルを閉じる
            setShowFormModal(false);

            // 再読み込み
            fetchSales(currentPage, searchTerm);
        } catch (error) {
            toast.error(data.id ? '売上データの更新に失敗しました' : '売上データの登録に失敗しました');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">売上管理</h2>
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

            <SalesTable
                sales={sales}
                onView={handleViewSale}
                onEdit={handleEditSale}
                onDelete={handleDeleteSale}
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

            <SalesDetailModal
                sale={selectedSale || null}
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setTimeout(() => setSelectedSale(undefined), 100);
                }}
            />

            <SalesForm
                sale={selectedSale}
                isOpen={showFormModal}
                onClose={() => {
                    setShowFormModal(false);
                    setTimeout(() => setSelectedSale(undefined), 100);
                }}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>売上データの削除</AlertDialogTitle>
                        <AlertDialogDescription>
                            この売上データを削除してもよろしいですか？この操作は取り消せません。
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