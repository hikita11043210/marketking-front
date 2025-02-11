'use client';

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Setting } from "@/types/settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loading } from "@/components/ui/loading";
import { EbayAuth } from '@/components/ebay/EbayAuth';
import { showToast } from "@/lib/toast";

const settingSchema = z.object({
    ebay_client_id: z.string().min(1, "eBay Client IDは必須です"),
    ebay_client_secret: z.string().min(1, "eBay Client Secretは必須です"),
    ebay_dev_id: z.string().min(1, "eBay Dev IDは必須です"),
    yahoo_client_id: z.string().min(1, "Yahoo Client IDは必須です"),
    yahoo_client_secret: z.string().min(1, "Yahoo Client Secretは必須です"),
});

export default function SettingPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [setting, setSetting] = useState<Setting>();

    const form = useForm<z.infer<typeof settingSchema>>({
        resolver: zodResolver(settingSchema),
        defaultValues: {
            ebay_client_id: "",
            ebay_client_secret: "",
            ebay_dev_id: "",
            yahoo_client_id: "",
            yahoo_client_secret: "",
        },
    });

    useEffect(() => {
        const fetchSetting = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/settings');
                const data = await response.json();

                if (response.ok && data) {
                    setSetting(data.data);
                    form.reset(data.data);
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'エラー',
                        description: data.message || '設定の取得に失敗しました',
                    });
                }
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'エラー',
                    description: '設定の取得中にエラーが発生しました',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchSetting();
    }, [form, toast]);

    const onSubmit = async (values: z.infer<typeof settingSchema>) => {
        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (response.ok) {
                showToast.success({ description: "設定を更新しました" });
            } else {
                showToast.error({ description: '設定の更新に失敗しました' });
            }
        } catch (error) {
            showToast.error({ description: '設定の更新中にエラーが発生しました' });
        }
    };

    if (loading) {
        return <Loading fullScreen />;
    }


    return (
        <div className="container mx-auto py-10 space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">設定</h2>
                <p className="text-muted-foreground">
                    アプリケーションの各種設定を管理します。
                </p>
            </div>

            <div className="grid gap-6">
                {/* eBay連携設定 */}
                <Card>
                    <CardHeader>
                        <CardTitle>eBay連携設定</CardTitle>
                        <CardDescription>
                            eBayアカウントとの連携を管理します。商品を出品するにはeBayとの連携が必要です。
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EbayAuth />
                    </CardContent>
                </Card>

                {/* その他の設定セクション */}
                <Card>
                    <CardHeader>
                        <CardTitle>一般設定</CardTitle>
                        <CardDescription>
                            アプリケーションの基本設定を管理します。
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h4 className="text-base font-medium">eBay設定</h4>
                                        <FormField
                                            control={form.control}
                                            name="ebay_client_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Client ID</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="text" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="ebay_client_secret"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Client Secret</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="text" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="ebay_dev_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Dev ID</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="text" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-base font-medium">Yahoo設定</h4>
                                        <FormField
                                            control={form.control}
                                            name="yahoo_client_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Client ID</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="text" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="yahoo_client_secret"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Client Secret</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="text" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting && (
                                            <Loading size="sm" className="mr-2" />
                                        )}
                                        保存
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>通知設定</CardTitle>
                        <CardDescription>
                            通知の受信設定を管理します。
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* 通知設定の内容 */}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 