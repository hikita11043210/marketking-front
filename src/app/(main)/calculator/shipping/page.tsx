'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, TruckIcon } from "lucide-react";

interface Country {
    code: string;
    name: string;
}

interface ShippingRate {
    fedex: number;
    dhl: number;
    economy: number;
}

interface ShippingWeights {
    fedex: number;
    dhl: number;
    economy: number;
}

interface ShippingResponse {
    success: boolean;
    message: string;
    data: {
        country: {
            code: string;
            name: string;
        };
        physical_weight: number;
        weights_used: ShippingWeights;
        shipping_rates: ShippingRate;
        recommended_service: string;
    };
}

export default function ShippingCalculatorPage() {
    const [countries, setCountries] = useState<Country[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [weight, setWeight] = useState<string>('');
    const [length, setLength] = useState<string>('');
    const [width, setWidth] = useState<string>('');
    const [height, setHeight] = useState<string>('');
    const [isDocument, setIsDocument] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ShippingResponse['data'] | null>(null);

    // 初期ロード時に国リストを取得
    useEffect(() => {
        fetchCountries();
    }, []);

    const fetchCountries = async () => {
        try {
            setIsInitialLoading(true);
            const response = await fetch('/api/utils/calculator-shipping/');
            if (!response.ok) {
                throw new Error('国リストの取得に失敗しました');
            }

            const data = await response.json();
            if (data.success) {
                setCountries(data.data.countries);
            } else {
                throw new Error(data.message || '国リストの取得に失敗しました');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : '国リストの取得に失敗しました');
            toast.error(error instanceof Error ? error.message : '国リストの取得に失敗しました');
        } finally {
            setIsInitialLoading(false);
        }
    };

    const handleCalculate = async () => {
        if (!selectedCountry || !weight) {
            toast.error('国と重量は必須項目です');
            return;
        }

        const weightValue = parseFloat(weight);
        if (isNaN(weightValue) || weightValue <= 0) {
            toast.error('重量は0より大きい数値を入力してください');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const requestBody = {
                country_code: selectedCountry,
                weight: weightValue,
                length: parseFloat(length) || undefined,
                width: parseFloat(width) || undefined,
                height: parseFloat(height) || undefined,
                is_document: isDocument
            };

            const response = await fetch('/api/utils/calculator-shipping/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '送料計算に失敗しました');
            }

            const responseData = await response.json() as ShippingResponse;
            if (responseData.success) {
                setResult(responseData.data);
                toast.success('送料計算が完了しました');
            } else {
                throw new Error(responseData.message || '送料計算に失敗しました');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : '送料計算に失敗しました');
            toast.error(error instanceof Error ? error.message : '送料計算に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    const getServiceNameJapanese = (service: string) => {
        switch (service) {
            case 'fedex':
                return 'FedEx';
            case 'dhl':
                return 'DHL';
            case 'economy':
                return 'Economy';
            default:
                return service;
        }
    };

    return (
        <div className="container py-10">
            <h1 className="text-2xl font-bold mb-6">送料計算</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>入力情報</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="country">配送先国</Label>
                            <Select
                                value={selectedCountry}
                                onValueChange={setSelectedCountry}
                                disabled={isInitialLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={isInitialLoading ? "読み込み中..." : "配送先国を選択"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>国名</SelectLabel>
                                        {countries.map((country) => (
                                            <SelectItem key={country.code} value={country.code}>
                                                {country.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="weight">重量 (kg)</Label>
                            <Input
                                id="weight"
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="重量を入力"
                                step="0.1"
                                min="0.1"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-2">
                                <Label htmlFor="length">長さ (cm)</Label>
                                <Input
                                    id="length"
                                    type="number"
                                    value={length}
                                    onChange={(e) => setLength(e.target.value)}
                                    placeholder="長さ"
                                    step="0.1"
                                    min="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="width">幅 (cm)</Label>
                                <Input
                                    id="width"
                                    type="number"
                                    value={width}
                                    onChange={(e) => setWidth(e.target.value)}
                                    placeholder="幅"
                                    step="0.1"
                                    min="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="height">高さ (cm)</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    placeholder="高さ"
                                    step="0.1"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isDocument"
                                checked={isDocument}
                                onCheckedChange={(checked) => setIsDocument(checked === true)}
                            />
                            <Label htmlFor="isDocument" className="text-sm">書類として扱う</Label>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            onClick={handleCalculate}
                            disabled={isLoading || isInitialLoading}
                            className="w-full"
                        >
                            {isLoading ? '計算中...' : '送料を計算'}
                        </Button>
                    </CardFooter>
                </Card>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {result && (
                    <Card>
                        <CardHeader>
                            <CardTitle>送料計算結果</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="text-sm font-medium">配送先国:</div>
                                <div className="text-sm">{result.country.name}</div>

                                <div className="text-sm font-medium">実重量:</div>
                                <div className="text-sm">{result.physical_weight.toFixed(2)} kg</div>

                                <div className="col-span-2 mt-2 mb-1">
                                    <div className="text-sm font-medium">計算に使用された重量:</div>
                                </div>

                                <div className="text-sm font-medium">FedEx:</div>
                                <div className="text-sm">{result.weights_used.fedex.toFixed(2)} kg</div>

                                <div className="text-sm font-medium">DHL:</div>
                                <div className="text-sm">{result.weights_used.dhl.toFixed(2)} kg</div>

                                <div className="text-sm font-medium">Economy:</div>
                                <div className="text-sm">{result.weights_used.economy.toFixed(2)} kg</div>

                                <div className="col-span-2 mt-2 mb-1">
                                    <div className="text-sm font-medium">送料:</div>
                                </div>

                                <div className="text-sm font-medium">FedEx:</div>
                                <div className="text-sm">{result.shipping_rates.fedex.toLocaleString()} 円</div>

                                <div className="text-sm font-medium">DHL:</div>
                                <div className="text-sm">{result.shipping_rates.dhl.toLocaleString()} 円</div>

                                <div className="text-sm font-medium">Economy:</div>
                                <div className="text-sm">{result.shipping_rates.economy.toLocaleString()} 円</div>

                                <div className="col-span-2 border-t my-3"></div>

                                <div className="col-span-2 bg-green-50 p-3 rounded-md">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <TruckIcon className="h-5 w-5 text-green-600" />
                                        <div className="text-sm font-bold text-green-700">最もお得な配送方法:</div>
                                    </div>
                                    <div className="text-lg font-bold text-green-700">
                                        {getServiceNameJapanese(result.recommended_service)}: {result.shipping_rates[result.recommended_service as keyof ShippingRate].toLocaleString()} 円
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
} 