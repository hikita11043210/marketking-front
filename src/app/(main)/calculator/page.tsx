'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, TruckIcon } from "lucide-react";
import Link from "next/link";

export default function CalculatorIndexPage() {
    return (
        <div className="container py-10">
            <h1 className="text-2xl font-bold mb-6">計算ツール</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calculator className="h-5 w-5" />
                            販売価格計算
                        </CardTitle>
                        <CardDescription>
                            仕入れ価格と送料から最適な販売価格を計算します
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            仕入れ価格と送料を入力することで、適切な販売価格とeBayでの販売時の最終利益を計算します。
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link href="/calculator/price">
                                販売価格計算へ
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TruckIcon className="h-5 w-5" />
                            送料計算
                        </CardTitle>
                        <CardDescription>
                            FedEx、DHL、Economyの送料を比較計算します
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            商品の重量、サイズ、配送先国を入力することで各配送サービスの送料を比較し、最適な配送方法を提案します。
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link href="/calculator/shipping">
                                送料計算へ
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
} 