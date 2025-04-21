'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// 国コードと国名のリスト
const COUNTRY_OPTIONS = [
    { code: 'US', name: 'アメリカ合衆国' },
    { code: 'GB', name: 'イギリス' },
    { code: 'DE', name: 'ドイツ' },
    { code: 'AU', name: 'オーストラリア' },
];

type ImportFormProps = {
    type: 'fedex' | 'dhl' | 'economy' | 'countries';
    requiresCountryCode?: boolean;
};

export function ImportForm({ type, requiresCountryCode }: ImportFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const router = useRouter();

    // フォームのスキーマを定義
    const formSchema = z.object({
        file: z.instanceof(File, {
            message: 'ファイルを選択してください',
        }),
        country_code: requiresCountryCode
            ? z.string().min(2, {
                message: '国コードを選択してください',
            })
            : z.string().optional(),
        carrier_type: type === 'countries'
            ? z.enum(['fedex', 'dhl'], {
                required_error: '配送業者タイプを選択してください',
            })
            : z.string().optional(),
    });

    // フォームの初期化
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            country_code: '',
            carrier_type: type === 'countries' ? 'fedex' : undefined,
        },
    });

    // ファイル選択ハンドラ
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.name.endsWith('.xlsx')) {
                setSelectedFile(file);
                form.setValue('file', file);
            } else {
                toast.error('Excelファイル(.xlsx)のみアップロード可能です');
            }
        }
    };

    // フォーム送信ハンドラ
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('type', type);
            formData.append('file', values.file);

            if (requiresCountryCode && values.country_code) {
                formData.append('country_code', values.country_code);
            }

            if (type === 'countries' && values.carrier_type) {
                formData.append('carrier_type', values.carrier_type);
            }

            const response = await fetch('/api/master/import', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message);
                form.reset();
                setSelectedFile(null);
            } else {
                toast.error(data.message || 'インポートに失敗しました');
            }
        } catch (error) {
            console.error('インポートエラー:', error);
            toast.error('インポート処理中にエラーが発生しました');
        } finally {
            setIsLoading(false);
        }
    };

    // フォームタイトルとフォーマット情報を定義
    const formInfo = {
        fedex: {
            title: 'FedEx送料マスター',
            format: 'FedExの料金表フォーマットに従ったExcelファイル(.xlsx)をアップロードしてください。',
        },
        dhl: {
            title: 'DHL送料マスター',
            format: 'DHLの料金表フォーマットに従ったExcelファイル(.xlsx)をアップロードしてください。',
        },
        economy: {
            title: 'エコノミー送料マスター',
            format: 'エコノミー配送の料金表フォーマットに従ったExcelファイル(.xlsx)をアップロードしてください。',
        },
        countries: {
            title: '国マスター',
            format: '国マスターのフォーマットに従ったExcelファイル(.xlsx)をアップロードしてください。',
        },
    };

    return (
        <div>
            <Card>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2 mb-6">
                                <h3 className="text-xl font-semibold">{formInfo[type].title}インポート</h3>
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>フォーマット情報</AlertTitle>
                                    <AlertDescription>
                                        {formInfo[type].format}
                                    </AlertDescription>
                                </Alert>
                            </div>

                            <FormField
                                control={form.control}
                                name="file"
                                render={({ field: { onChange, ...rest } }) => (
                                    <FormItem>
                                        <FormLabel>Excelファイル</FormLabel>
                                        <FormControl>
                                            <div className="flex flex-col gap-2">
                                                <Input
                                                    type="file"
                                                    accept=".xlsx"
                                                    onChange={handleFileChange}
                                                    className="cursor-pointer"
                                                />
                                                {selectedFile && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        選択ファイル: {selectedFile.name}
                                                    </p>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            .xlsx形式のExcelファイルをアップロードしてください
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {requiresCountryCode && (
                                <FormField
                                    control={form.control}
                                    name="country_code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>国を選択</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="国を選択してください" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {COUNTRY_OPTIONS.map(country => (
                                                        <SelectItem
                                                            key={country.code}
                                                            value={country.code}
                                                        >
                                                            {country.name} ({country.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                エコノミー配送料金のインポート対象国を選択してください
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {type === 'countries' && (
                                <FormField
                                    control={form.control}
                                    name="carrier_type"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>配送業者タイプ</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex flex-col space-y-1"
                                                >
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="fedex" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            FedEx
                                                        </FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="dhl" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            DHL
                                                        </FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormDescription>
                                                国マスター登録時の配送業者タイプを選択してください
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading ? 'インポート中...' : 'インポート実行'}
                                <Upload className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
} 