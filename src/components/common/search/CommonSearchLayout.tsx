import { ReactNode, RefObject } from 'react';
import { RegisterModal as YahooAuctionRegisterModal } from "@/components/marketplaces/yahoo-auction/product/YahooAuctionRegisterModal";
import { RegisterModal as YahooFreeMarketRegisterModal } from "@/components/marketplaces/yahoo-freemarket/product/YahooFreeMarketRegisterModal";
import type { SearchResult } from "@/types/yahoo-auction";
import type { PayPayFreeMarketSearchResult } from '@/types/yahoo-free-market';

interface CommonSearchLayoutProps {
    containerRef: RefObject<HTMLDivElement>;
    title: string;
    searchFormComponent: ReactNode; // 検索フォーム部分
    resultsComponent: ReactNode; // 検索結果部分
    paginationComponent?: ReactNode; // ページネーション部分（オプション）
    totalCount: number;
    loading: boolean;
    // モーダル関連のプロパティ
    isModalOpen: boolean;
    onModalClose: () => void;
    selectedItem: SearchResult | PayPayFreeMarketSearchResult | null | undefined;
    sourceType: 'yahoo-auction' | 'yahoo-free-market';
}

export const CommonSearchLayout = ({
    containerRef,
    title,
    searchFormComponent,
    resultsComponent,
    paginationComponent,
    totalCount,
    loading,
    isModalOpen,
    onModalClose,
    selectedItem,
    sourceType,
}: CommonSearchLayoutProps) => {
    return (
        <div className="flex-1 overflow-auto">
            <div ref={containerRef} className="container mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-6">{title}</h1>
                    {searchFormComponent}
                </div>

                {totalCount > 0 && (
                    <p className="text-sm text-muted-foreground mb-4">
                        検索結果: {totalCount}件
                    </p>
                )}

                {resultsComponent}

                {paginationComponent}

                {/* モーダルの表示 - ソースタイプに応じて異なるモーダルを表示 */}
                {sourceType === 'yahoo-auction' ? (
                    <YahooAuctionRegisterModal
                        isOpen={isModalOpen}
                        onClose={onModalClose}
                        selectedItem={selectedItem as SearchResult}
                    />
                ) : (
                    <YahooFreeMarketRegisterModal
                        isOpen={isModalOpen}
                        onClose={onModalClose}
                        selectedItem={selectedItem as PayPayFreeMarketSearchResult}
                    />
                )}
            </div>
        </div>
    );
}; 