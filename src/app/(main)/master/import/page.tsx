'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImportForm } from '@/components/master/ImportForm';

export default function ImportPage() {
    const [activeTab, setActiveTab] = useState('fedex');

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>マスターデータインポート</CardTitle>
                <CardDescription>
                    配送料金マスターや国マスターをExcelファイルからインポートします
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="fedex" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-4 mb-6">
                        <TabsTrigger value="fedex">FedEx</TabsTrigger>
                        <TabsTrigger value="dhl">DHL</TabsTrigger>
                        <TabsTrigger value="economy">Economy</TabsTrigger>
                        <TabsTrigger value="countries">Country</TabsTrigger>
                    </TabsList>

                    <TabsContent value="fedex">
                        <ImportForm type="fedex" />
                    </TabsContent>

                    <TabsContent value="dhl">
                        <ImportForm type="dhl" />
                    </TabsContent>

                    <TabsContent value="economy">
                        <ImportForm
                            type="economy"
                            requiresCountryCode
                        />
                    </TabsContent>

                    <TabsContent value="countries">
                        <ImportForm type="countries" />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
} 