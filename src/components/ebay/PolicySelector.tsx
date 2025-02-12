import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { EbayPolicies } from '@/types/ebay';
import { UseFormReturn } from 'react-hook-form';

interface PolicySelectorProps {
    form: UseFormReturn<any>;
}

export const PolicySelector = ({ form }: PolicySelectorProps) => {
    const [policies, setPolicies] = useState<EbayPolicies>({
        fulfillment: [],
        payment: [],
        return: []
    });

    const { toast } = useToast();

    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const response = await fetch(`/api/ebay/policies`);
                const data = await response.json();

                if (data.success) {
                    setPolicies({
                        fulfillment: data.fulfillment.fulfillmentPolicies,
                        payment: data.payment.paymentPolicies,
                        return: data.return.returnPolicies
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
            }
        };

        fetchPolicies();
    }, [toast]);

    return (
        <div className="space-y-4">
            <FormField
                control={form.control}
                name="fulfillmentPolicyId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-muted-foreground">配送ポリシー（Shipping Policy）</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="配送ポリシーを選択" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {policies.fulfillment.map((policy) => (
                                    <SelectItem key={policy.fulfillmentPolicyId} value={policy.fulfillmentPolicyId}>
                                        {policy.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="paymentPolicyId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-muted-foreground">支払いポリシー（Payment Policy）</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="支払いポリシーを選択" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {policies.payment.map((policy) => (
                                    <SelectItem key={policy.paymentPolicyId} value={policy.paymentPolicyId}>
                                        {policy.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="returnPolicyId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-muted-foreground">返品ポリシー（Return Policy）</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="返品ポリシーを選択" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {policies.return.map((policy) => (
                                    <SelectItem key={policy.returnPolicyId} value={policy.returnPolicyId}>
                                        {policy.name}
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