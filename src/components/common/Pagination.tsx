'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    // 表示するページ番号を計算
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            // 5ページ以下の場合はすべて表示
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // 現在のページの前後に表示するページ数
            const leftSiblingCount = Math.floor(maxPagesToShow / 2);
            const rightSiblingCount = Math.floor(maxPagesToShow / 2);

            // 左端が1より小さくならないようにする
            const startPage = Math.max(1, currentPage - leftSiblingCount);
            // 右端が総ページ数を超えないようにする
            const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            // 左側の省略記号
            if (startPage > 1) {
                pageNumbers.unshift('leftEllipsis');
                pageNumbers.unshift(1);
            }

            // 右側の省略記号
            if (endPage < totalPages) {
                pageNumbers.push('rightEllipsis');
                pageNumbers.push(totalPages);
            }
        }

        return pageNumbers;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex items-center gap-1">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">前のページ</span>
            </Button>

            {pageNumbers.map((page, index) => {
                if (page === 'leftEllipsis' || page === 'rightEllipsis') {
                    return (
                        <Button
                            key={`ellipsis-${index}`}
                            variant="outline"
                            size="icon"
                            disabled
                        >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">...</span>
                        </Button>
                    );
                }

                return (
                    <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => onPageChange(page as number)}
                    >
                        {page}
                        <span className="sr-only">ページ {page}</span>
                    </Button>
                );
            })}

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">次のページ</span>
            </Button>
        </div>
    );
} 