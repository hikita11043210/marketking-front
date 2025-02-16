import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BaseRegisterModal } from '@/components/shared/modals/BaseRegisterModal';
import { ProductInfo } from './ProductInfo';
import { ProductForm } from './ProductForm';
import type { SearchDetailResult, SearchResult } from '@/types/search';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedItem: SearchResult | null;
}

export const RegisterModal = ({ isOpen, onClose, selectedItem }: RegisterModalProps) => {
    const [detailData, setDetailData] = useState<SearchDetailResult>();
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [translate_title, setTranslateTitle] = useState<string>('');
    const [translate_condition, setTranslateCondition] = useState<string>('');

    useEffect(() => {
        const fetchDetail = async () => {
            if (selectedItem?.url) {
                try {
                    setSelectedImages([]);
                    let response = await fetch(`/api/yahoo-auction/detail?url=${encodeURIComponent(selectedItem.url)}`);
                    let data = await response.json();
                    if (data.success) {
                        setDetailData(data.data.data);
                        setSelectedImages(data.data.data.images.url);

                        // タイトル翻訳
                        response = await fetch(`/api/translate?text=${encodeURIComponent(selectedItem.title)}`);
                        data = await response.json();
                        if (data.success) {
                            setTranslateTitle(data.data.translated_text);
                        } else {
                            setTranslateTitle(selectedItem.title);
                        }

                        // 商品状態翻訳
                        if (detailData?.condition) {
                            response = await fetch(`/api/translate?text=${encodeURIComponent(detailData?.condition || '')}`);
                            data = await response.json();
                            if (data.success) {
                                setTranslateCondition(data.data.translated_text);
                            } else {
                                setTranslateCondition(detailData?.condition || '');
                            }
                        }
                    }
                } catch (error) {
                    console.error('API呼び出しエラー:', error);
                }
            }
        };

        fetchDetail();
    }, [selectedItem]);

    if (!selectedItem) return null;

    return (
        <BaseRegisterModal isOpen={isOpen} onClose={onClose}>
            <div className="grid grid-cols-[1fr,2fr] gap-8">
                {/* 左側：選択商品の情報 */}
                <div className="space-y-6">
                    <ProductInfo selectedItem={selectedItem} detailData={detailData} />
                </div>

                {/* 右側：入力フォーム */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            {selectedImages.length > 0 && translate_title && translate_condition ? (
                                <ProductForm
                                    initialData={detailData}
                                    translateTitle={translate_title}
                                    translateCondition={translate_condition}
                                    onCancel={onClose}
                                />
                            ) : (
                                <div className="flex justify-center items-center h-32 text-muted-foreground">
                                    画像データを読み込み中...
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </BaseRegisterModal>
    );
}; 