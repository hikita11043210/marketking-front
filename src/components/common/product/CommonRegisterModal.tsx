import { Card, CardContent } from "@/components/ui/card";
import { BaseRegisterModal } from '@/components/common/modals/BaseRegisterModal';
import { ReactNode } from 'react';

export interface CommonRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    productInfoComponent: ReactNode; // 左側の商品情報コンポーネント
    productFormComponent: ReactNode; // 右側のフォームコンポーネント 
    isLoading?: boolean; // データ読み込み中かどうか
}

export const CommonRegisterModal = ({
    isOpen,
    onClose,
    productInfoComponent,
    productFormComponent,
    isLoading = false,
}: CommonRegisterModalProps) => {
    return (
        <BaseRegisterModal isOpen={isOpen} onClose={onClose}>
            <div className="grid grid-cols-[1fr,2fr] gap-8">
                {/* 左側：選択商品の情報 */}
                <div className="space-y-6">
                    {productInfoComponent}
                </div>

                {/* 右側：入力フォーム */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            {!isLoading ? (
                                productFormComponent
                            ) : (
                                <div className="flex justify-center items-center h-32 text-muted-foreground">
                                    データを読み込み中...
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </BaseRegisterModal>
    );
}; 