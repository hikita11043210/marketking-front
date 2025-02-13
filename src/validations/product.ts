import * as z from 'zod';

export const productFormSchema = z.object({
    title: z.string().min(1, '商品名を入力してください'),
    description: z.string().min(1, '商品の説明を入力してください'),
    price: z.string().transform((val) => val.replace(/,/g, '')),
    quantity: z.string().min(1, '数量を入力してください'),
    condition: z.string().min(1, '商品の状態を選択してください'),
    conditionDescription: z.string().optional(),
    categoryId: z.string().min(1, 'カテゴリーを選択してください'),
    fulfillmentPolicyId: z.string().min(1, '配送ポリシーを選択してください'),
    paymentPolicyId: z.string().min(1, '支払いポリシーを選択してください'),
    returnPolicyId: z.string().min(1, '返品ポリシーを選択してください'),
    ebayItemId: z.string().optional(),
    itemSpecifics: z.array(
        z.object({
            name: z.string(),
            value: z.array(z.string())
        })
    ).default([
        { name: 'Brand', value: [''] },
        { name: 'Type', value: [''] },
        { name: 'Model', value: [''] }
    ]),
    currency: z.string().default('USD'),
    images: z.array(z.string()).default([]),
});

export type ProductFormValues = z.infer<typeof productFormSchema>; 