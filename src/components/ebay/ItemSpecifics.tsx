import { useFormContext, useFieldArray } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface ItemSpecificsProps {
    isLoading: boolean;
    handleFetchItemSpecifics: () => void;
}

export const ItemSpecifics = ({ }: ItemSpecificsProps) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const { control, getValues, setValue } = useFormContext();
    const { fields, append } = useFieldArray({
        control,
        name: "itemSpecifics"
    });

    const handleFetchItemSpecifics = async () => {
        setIsLoading(true);
        const ebayItemId = getValues('ebayItemId');

        if (!ebayItemId) {
            toast({
                title: 'エラー',
                description: 'eBay商品IDを入力してください',
                variant: 'destructive',
            });
            return;
        }

        try {
            const response = await fetch(`/api/ebay/itemSpecifics?ebayItemId=${ebayItemId}`);
            const data = await response.json();

            if (data.success) {
                setValue('itemSpecifics', []);
                data.item_specifics.forEach((spec: any) => {
                    append({
                        name: spec.name,
                        value: spec.values
                    });
                });
                toast({
                    title: '成功',
                    description: 'Item Specificsを取得しました',
                });

            } else {
                throw new Error(data.message || 'ポリシー情報の取得に失敗しました');
            }
        } catch (error) {
            toast({
                title: 'エラー',
                description: error instanceof Error ? error.message : 'ポリシー情報の取得に失敗しました',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-specifics">
                <div className="flex items-center justify-between">
                    <AccordionTrigger className="flex-1 text-muted-foreground">Item Specifics</AccordionTrigger>
                    <div className="flex items-center gap-2 px-4">
                        <FormField
                            control={control}
                            name="ebayItemId"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input {...field} placeholder="eBay商品ID" className="h-9 w-[200px]" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleFetchItemSpecifics}
                            disabled={isLoading}
                            className="h-9"
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm mr-2"></span>
                                    取得中...
                                </>
                            ) : (
                                'Item Specificsを取得'
                            )}
                        </Button>
                    </div>
                </div>
                <AccordionContent>
                    <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 gap-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-center gap-4">
                                    <FormField
                                        control={control}
                                        name={`itemSpecifics.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="項目名"
                                                        className="w-full"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name={`itemSpecifics.${index}.value`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        value={field.value?.join(', ')}
                                                        onChange={(e) => field.onChange(e.target.value.split(', '))}
                                                        placeholder="値（複数ある場合はカンマ区切り）"
                                                        className="w-full"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            ))}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => append({ name: '', value: [''] })}
                            className="w-full mt-4"
                        >
                            項目を追加
                        </Button>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};
