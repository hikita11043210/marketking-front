import { useState } from 'react';
import { FieldArrayWithId, Control, UseFormRegister, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Checkbox } from "@/components/ui/checkbox";

// 共通のロードボタンコンポーネント
interface LoadingButtonProps {
    loading: boolean;
    loadingText: string;
    defaultText: string;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    size?: 'sm' | 'default' | 'lg';
    type?: 'button' | 'submit' | 'reset';
}

export const LoadingButton = ({
    loading,
    loadingText,
    defaultText,
    onClick,
    disabled,
    className,
    size = 'default',
    type = 'button'
}: LoadingButtonProps) => {
    return (
        <Button
            className={`${className} relative min-w-[64px] px-2`}
            size={size}
            onClick={onClick}
            disabled={disabled || loading}
            type={type}
        >
            <span className={`${loading ? 'invisible' : ''}`}>
                {defaultText}
            </span>
            {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 absolute" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="invisible">{defaultText}</span>
                </span>
            )}
        </Button>
    );
};

// 共通のフォームスキーマ
export const productFormSchema = z.object({
    title: z.string()
        .min(1, { message: 'タイトルを入力してください' })
        .max(80, { message: 'タイトルは80文字以内で入力してください' }),
    titleCondition: z.string().optional(),
    description: z.string()
        .max(4000, { message: '説明は4000文字以内で入力してください' }),
    price: z.string().min(1, { message: '価格を入力してください' }),
    final_profit: z.string(),
    final_profit_dollar: z.string(),
    quantity: z.string().min(1, { message: '数量を入力してください' }),
    condition: z.string().min(1, { message: '商品の状態を選択してください' }),
    conditionDescription: z.string().min(1, { message: '商品の詳細を入力してください' }),
    categoryId: z.string().min(1, { message: 'カテゴリーを選択してください' }),
    currency: z.string().default('USD'),
    shippingPolicyId: z.string().min(1, { message: '配送ポリシーを選択してください' }),
    paymentPolicyId: z.string().min(1, { message: '支払いポリシーを選択してください' }),
    returnPolicyId: z.string().min(1, { message: '返品ポリシーを選択してください' }),
    ebayItemId: z.string().optional(),
    itemSpecifics: z.array(
        z.object({
            name: z.string().min(1, { message: '項目名を入力してください' }),
            value: z.array(
                z.string().min(1, { message: '値を入力してください' })
            ).min(1, { message: '少なくとも1つの値を入力してください' })
        })
    ).min(1, { message: '少なくとも1つの項目を追加してください' }),
    images: z.array(z.string()).min(1, '少なくとも1枚の画像を選択してください'),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

// 画像選択セクションの共通コンポーネント
interface ImageSelectionProps {
    allImages: string[];
    control: Control<ProductFormValues>;
    register: UseFormRegister<ProductFormValues>;
    setValue: UseFormSetValue<ProductFormValues>;
    getValues: UseFormGetValues<ProductFormValues>;
}

export const ImageSelection = ({ allImages, register, setValue, getValues }: ImageSelectionProps) => {
    return (
        <div className="space-y-4">
            <div className="text-sm font-medium text-muted-foreground">選択画像（最大24枚）</div>
            <div className="grid grid-cols-5 gap-2">
                {allImages.map((url) => (
                    url && (
                        <label
                            key={url}
                            className="relative aspect-square cursor-pointer"
                            htmlFor={`image-${url}`}
                        >
                            <Checkbox
                                id={`image-${url}`}
                                checked={getValues('images').includes(url)}
                                onCheckedChange={(checked) => {
                                    const currentSelected = getValues('images');
                                    const newSelected = checked
                                        ? [...currentSelected, url]
                                        : currentSelected.filter(selectedUrl => selectedUrl !== url);
                                    setValue('images', newSelected, { shouldDirty: true, shouldValidate: true });
                                }}
                                className="hidden"
                            />
                            <div
                                className={`w-full h-full bg-cover bg-center border-2 rounded-md ${getValues('images').includes(url)
                                    ? 'border-blue-500'
                                    : 'border-transparent'
                                    }`}
                                style={{ backgroundImage: `url(${url})` }}
                            >
                                {getValues('images').includes(url) && (
                                    <div className="absolute right-1 top-1 bg-blue-500 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs">
                                        ✓
                                    </div>
                                )}
                            </div>
                        </label>
                    )
                ))}
            </div>
        </div>
    );
};

// Item Specificsフィールドの共通コンポーネント
interface ItemSpecificsFieldsProps {
    fields: FieldArrayWithId<ProductFormValues, "itemSpecifics", "id">[];
    control: Control<ProductFormValues>;
    register: UseFormRegister<ProductFormValues>;
    append: (value: { name: string; value: string[] }) => void;
    remove: (index: number) => void;
    handleFetchItemSpecifics: () => Promise<void>;
    handleAddItemSpecific: () => void;
    handleRemoveItemSpecific: (index: number) => void;
}

export const useCommonForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 一般的な翻訳機能
    const translateText = async (text: string, onSuccess: (translatedText: string) => void) => {
        if (!text) {
            toast.error('翻訳するテキストを入力してください');
            return;
        }

        try {
            const response = await fetch(`/api/translate?text=${encodeURIComponent(text)}`);
            const data = await response.json();
            if (data.success) {
                onSuccess(data.data.translated_text);
                toast.success('翻訳が完了しました');
            } else {
                throw new Error(data.message || '翻訳に失敗しました');
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : '翻訳に失敗しました');
        }
    };

    return {
        isSubmitting,
        setIsSubmitting,
        translateText
    };
}; 