'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface PriceCalculation {
    original_price: number;
    shipping_cost: number;
    rate: number;
    ebay_fee: number;
    international_fee: number;
    tax_rate: number;
    calculated_price_yen: number;
    calculated_price_dollar: number;
    exchange_rate: number;
    final_profit_yen: number;
    final_profit_dollar: number;
}

interface PriceCalculationResponse {
    success: boolean;
    data: PriceCalculation;
}

export default function PriceCalculatorPage() {
    const [purchasePrice, setPurchasePrice] = useState<string>('');
    const [shippingCost, setShippingCost] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<PriceCalculation | null>(null);

    const handleCalculate = async () => {
        if (!purchasePrice || !shippingCost) {
            toast.error('入力値を確認してください');
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`/api/calculator/price-init?money[]=${purchasePrice}&money[]=${shippingCost}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '計算に失敗しました');
            }

            const responseData = await response.json() as PriceCalculationResponse;
            console.log(responseData);

            if (responseData.success) {
                setResult(responseData.data);
            } else {
                throw new Error('計算に失敗しました');
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : '計算に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container py-10">
            <h1 className="text-2xl font-bold mb-6">販売価格計算</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>入力情報</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="purchasePrice">仕入れ価格（円）</Label>
                            <Input
                                id="purchasePrice"
                                type="number"
                                value={purchasePrice}
                                onChange={(e) => setPurchasePrice(e.target.value)}
                                placeholder="仕入れ価格を入力"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shippingCost">送料（円）</Label>
                            <Input
                                id="shippingCost"
                                type="number"
                                value={shippingCost}
                                onChange={(e) => setShippingCost(e.target.value)}
                                placeholder="送料を入力"
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            onClick={handleCalculate}
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? '計算中...' : '計算する'}
                        </Button>
                    </CardFooter>
                </Card>

                {result && (
                    <Card>
                        <CardHeader>
                            <CardTitle>計算結果</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="text-sm font-medium">仕入れ価格:</div>
                                <div className="text-sm">{result.original_price.toLocaleString()}円</div>

                                <div className="text-sm font-medium">送料:</div>
                                <div className="text-sm">{result.shipping_cost.toLocaleString()}円</div>

                                <div className="text-sm font-medium">利益率:</div>
                                <div className="text-sm">{(result.rate * 100).toFixed(2)}%</div>

                                <div className="text-sm font-medium">eBay手数料:</div>
                                <div className="text-sm">{(result.ebay_fee * 100).toFixed(2)}%</div>

                                <div className="text-sm font-medium">国際決済手数料:</div>
                                <div className="text-sm">{(result.international_fee * 100).toFixed(2)}%</div>

                                <div className="text-sm font-medium">税率:</div>
                                <div className="text-sm">{(result.tax_rate * 100).toFixed(2)}%</div>

                                <div className="text-sm font-medium">為替レート:</div>
                                <div className="text-sm">{result.exchange_rate.toLocaleString()}</div>

                                <div className="col-span-2 border-t my-2"></div>

                                <div className="text-sm font-bold">計算価格(円):</div>
                                <div className="text-sm font-bold">{result.calculated_price_yen.toLocaleString()}円</div>

                                <div className="text-sm font-bold">計算価格(ドル):</div>
                                <div className="text-sm font-bold">${result.calculated_price_dollar.toLocaleString()}</div>

                                <div className="text-sm font-bold">最終利益(円):</div>
                                <div className="text-sm font-bold">{result.final_profit_yen.toLocaleString()}円</div>

                                <div className="text-sm font-bold">最終利益(ドル):</div>
                                <div className="text-sm font-bold">${result.final_profit_dollar.toLocaleString()}</div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
} 