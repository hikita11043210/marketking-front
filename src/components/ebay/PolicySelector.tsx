import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ebayApi } from '@/lib/api/endpoints/ebay';
import { EbayPolicy } from '@/lib/types/ebay';
import { UseFormReturn } from 'react-hook-form';


interface PolicySelectorProps {
    form: UseFormReturn<any>;
    marketplaceId?: string;
}

export const PolicySelector = ({ form, marketplaceId = 'EBAY_US' }: PolicySelectorProps) => {
    const [policies, setPolicies] = useState<{
        fulfillment: EbayPolicy[];
        payment: EbayPolicy[];
        return: EbayPolicy[];
    }>({
        fulfillment: [],
        payment: [],
        return: []
    });

    const { toast } = useToast();

    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const response = await ebayApi.getPolicies(marketplaceId, localStorage.getItem('ebayToken') || '');
                if (response.success) {
                    setPolicies({
                        fulfillment: response.data.fulfillment_policies,
                        payment: response.data.payment_policies,
                        return: response.data.return_policies
                    });
                } else {
                    throw new Error('ポリシー情報の取得に失敗しました');
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
    }, [marketplaceId, toast]);

    return (
        <div className="space-y-4">
            <FormField
                control={form.control}
                name="fulfillmentPolicyId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-foreground">出荷ポリシー</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="出荷ポリシーを選択" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {policies.fulfillment.map((policy) => (
                                    <SelectItem key={policy.policyId} value={policy.policyId}>
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
                        <FormLabel className="text-foreground">支払いポリシー</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="支払いポリシーを選択" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {policies.payment.map((policy) => (
                                    <SelectItem key={policy.policyId} value={policy.policyId}>
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
                        <FormLabel className="text-foreground">返品ポリシー</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="返品ポリシーを選択" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {policies.return.map((policy) => (
                                    <SelectItem key={policy.policyId} value={policy.policyId}>
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