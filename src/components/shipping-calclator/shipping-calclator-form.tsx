'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { ShippingResult, Service, Country } from '@/types/shipping-calculator';
import { validateShippingCalculatorParams } from '@/validations/shipping-calculator';
import { showToast } from '@/lib/toast';

interface ShippingCalculatorFormProps {
    onCalculate: (result: ShippingResult) => void;
}

export function ShippingCalculatorForm({ onCalculate }: ShippingCalculatorFormProps) {
    const [services, setServices] = useState<Service[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [selectedService, setSelectedService] = useState<string>('');
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [dimensions, setDimensions] = useState({
        length: '',
        width: '',
        height: '',
        weight: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const response = await fetch('/api/shipping-calculator/calculate');
            const data = await response.json();
            if (data.success && data.data) {
                setServices(data.data.services);
                setCountries(data.data.countries);
            } else {
                setError(data.message || '初期データの取得に失敗しました');
            }
        } catch (err) {
            setError('初期データの取得に失敗しました');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 必須項目のチェック
        if (!selectedService || !selectedCountry) {
            setLoading(false);
            showToast.error({ description: "配送サービスと配送先国を選択してください" });
            return;
        }

        // バリデーション
        const params = {
            service_id: parseInt(selectedService),
            country_code: selectedCountry,
            length: parseInt(dimensions.length) || 0,
            width: parseInt(dimensions.width) || 0,
            height: parseInt(dimensions.height) || 0,
            weight: parseFloat(dimensions.weight) || 0
        };

        const validation = validateShippingCalculatorParams(params);
        if (!validation.isValid) {
            setLoading(false);
            validation.errors.forEach((error: string) => {
                showToast.error({ description: error });
            });
            return;
        }

        try {
            const response = await fetch('/api/shipping-calculator/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });
            const data = await response.json();
            if (data.success && data.data) {
                onCalculate(data.data);
                showToast.success({ description: "送料の計算が完了しました" });
            } else {
                setError(data.message || '送料の計算に失敗しました');
                showToast.error({ description: data.message || '送料の計算に失敗しました' });
            }
        } catch (err) {
            setError('送料の計算中にエラーが発生しました');
            showToast.error({ description: '送料の計算中にエラーが発生しました' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Card className="mb-6">
                <CardContent className="pt-6">
                    {initialLoading ? (
                        <div className="text-center py-4">データを読み込み中...</div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>配送サービス</Label>
                                    <Select
                                        value={selectedService}
                                        onValueChange={setSelectedService}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="選択してください" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {services?.map((service) => (
                                                <SelectItem key={service.id} value={service.id.toString()}>
                                                    {service.service_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>配送先国</Label>
                                    <Select
                                        value={selectedCountry}
                                        onValueChange={setSelectedCountry}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="選択してください" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countries?.map((country) => (
                                                <SelectItem key={country.country_code} value={country.country_code}>
                                                    {country.country_name_jp} ({country.country_name})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label>長さ (cm)</Label>
                                        <Input
                                            type="number"
                                            value={dimensions.length}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setDimensions({ ...dimensions, length: e.target.value })}
                                            min="1"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>幅 (cm)</Label>
                                        <Input
                                            type="number"
                                            value={dimensions.width}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setDimensions({ ...dimensions, width: e.target.value })}
                                            min="1"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>高さ (cm)</Label>
                                        <Input
                                            type="number"
                                            value={dimensions.height}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setDimensions({ ...dimensions, height: e.target.value })}
                                            min="1"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>重量 (kg)</Label>
                                        <Input
                                            type="number"
                                            value={dimensions.weight}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setDimensions({ ...dimensions, weight: e.target.value })}
                                            min="0.1"
                                            step="0.1"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? '計算中...' : '送料を計算'}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </>
    );
} 