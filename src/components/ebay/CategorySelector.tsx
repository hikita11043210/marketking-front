import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface CategorySelectorProps {
    form: UseFormReturn<any>;
}

interface Category {
    categoryId: string;
    categoryName: string;
    path: string;
}

export const CategorySelector = ({ form }: CategorySelectorProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const searchCategories = async () => {
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/ebay/category?q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();

            if (data.success && Array.isArray(data.categories)) {
                setCategories(data.categories);
            } else {
                setCategories([]);
                throw new Error(data.message || 'カテゴリーの検索に失敗しました');
            }
        } catch (error) {
            setCategories([]);
            toast({
                title: 'エラー',
                description: error instanceof Error ? error.message : 'カテゴリーの検索に失敗しました',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            await searchCategories();
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input
                    placeholder="カテゴリーを検索... (Enterで検索)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                    disabled={isLoading}
                />
                <Button
                    type="button"
                    onClick={searchCategories}
                    disabled={isLoading}
                >
                    検索
                </Button>
            </div>

            <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-muted-foreground">カテゴリー選択</FormLabel>
                        <Select
                            value={field.value}
                            onValueChange={(value) => {
                                field.onChange(value);
                                const selectedCategory = categories.find(cat => cat.categoryId === value);
                                if (selectedCategory) {
                                    form.setValue('categoryName', selectedCategory.categoryName);
                                }
                            }}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="カテゴリーを選択">
                                        {form.watch('categoryId') && (
                                            <div className="flex flex-col items-start">
                                                <span className="text-sm block">{categories.find(c => c.categoryId === form.watch('categoryId'))?.categoryName}</span>
                                                <span className="text-xs text-muted-foreground block">{categories.find(c => c.categoryId === form.watch('categoryId'))?.path}</span>
                                            </div>
                                        )}
                                    </SelectValue>
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem
                                        key={category.categoryId}
                                        value={category.categoryId}
                                        className="flex flex-col items-start"
                                    >
                                        <span className="text-sm block">{category.categoryName}</span>
                                        <span className="text-xs text-muted-foreground block">{category.path}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
};
