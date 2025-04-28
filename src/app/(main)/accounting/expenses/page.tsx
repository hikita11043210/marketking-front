'use client';

import { useState, useEffect } from 'react';
import { ExpensesTable } from '@/components/accounting/expenses/ExpensesTable';
import { ExpensesDetailModal } from '@/components/accounting/expenses/ExpensesDetailModal';
import { ExpensesForm } from '@/components/accounting/expenses/ExpensesForm';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ExpenseItem } from '@/types/accounting';
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

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
    const [selectedExpense, setSelectedExpense] = useState<ExpenseItem | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchExpenses = async (page = 1, search = '') => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: '10',
                ...(search && { search }),
            }).toString();

            const response = await fetch(`/api/accounting/expenses?${queryParams}`);

            if (!response.ok) {
                throw new Error('経費データの取得に失敗しました');
            }

            const data = await response.json();

            setExpenses(data.results || []);
            setTotalPages(Math.ceil((data.count || 0) / 10));
            setCurrentPage(page);
        } catch (error) {
            console.error('経費データ取得エラー:', error);
            toast.error('経費データの取得に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses(currentPage, searchTerm);
    }, [currentPage]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
        fetchExpenses(1, term);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleRefresh = () => {
        fetchExpenses(currentPage, searchTerm);
    };

    const handleViewExpense = (expense: ExpenseItem) => {
        setSelectedExpense(expense);
        setShowDetailModal(true);
    };

    const handleEditExpense = (expense: ExpenseItem) => {
        setSelectedExpense(expense);
        setShowFormModal(true);
    };

    const handleDeleteExpense = (id: string) => {
        setDeleteId(id);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/accounting/expenses/${deleteId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('経費データの削除に失敗しました');
            }

            toast.success('経費データを削除しました');

            // 再読み込み
            fetchExpenses(currentPage, searchTerm);
        } catch (error) {
            toast.error('経費データの削除に失敗しました');
        } finally {
            setIsSubmitting(false);
            setShowDeleteDialog(false);
            setDeleteId(null);
        }
    };

    const handleAddNew = () => {
        setSelectedExpense(undefined);
        setShowFormModal(true);
    };

    const handleSubmit = async (data: Partial<ExpenseItem>) => {
        setIsSubmitting(true);
        try {
            const url = data.id
                ? `/api/accounting/expenses/${data.id}`
                : '/api/accounting/expenses';

            const method = data.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(data.id ? '経費データの更新に失敗しました' : '経費データの登録に失敗しました');
            }

            toast.success(data.id ? '経費データを更新しました' : '経費データを登録しました');

            // モーダルを閉じる
            setShowFormModal(false);

            // 再読み込み
            fetchExpenses(currentPage, searchTerm);
        } catch (error) {
            toast.error(data.id ? '経費データの更新に失敗しました' : '経費データの登録に失敗しました');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">経費管理</h2>
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

            <ExpensesTable
                expenses={expenses}
                onView={handleViewExpense}
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
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

            <ExpensesDetailModal
                expense={selectedExpense || null}
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setTimeout(() => setSelectedExpense(undefined), 100);
                }}
            />

            <ExpensesForm
                expense={selectedExpense}
                isOpen={showFormModal}
                onClose={() => {
                    setShowFormModal(false);
                    setSelectedExpense(undefined);
                }}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>経費データの削除</AlertDialogTitle>
                        <AlertDialogDescription>
                            この経費データを削除してもよろしいですか？この操作は取り消せません。
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