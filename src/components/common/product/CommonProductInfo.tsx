import { Card, CardContent } from "@/components/ui/card";

// 情報項目の型定義
export interface InfoItem {
    label: string;
    value: React.ReactNode;
    condition?: boolean;
}

// 共通コンポーネントのProps定義
export interface CommonProductInfoProps {
    imageUrl?: string;
    linkUrl?: string;
    infoItems: InfoItem[];
}

export const CommonProductInfo = ({
    imageUrl,
    linkUrl,
    infoItems
}: CommonProductInfoProps) => {
    return (
        <Card>
            <CardContent className="pt-6 space-y-6">
                {/* 商品画像 */}
                {imageUrl && (
                    <div className="w-full aspect-square relative">
                        {linkUrl ? (
                            <a
                                href={linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full h-full block hover:opacity-90 transition-opacity"
                            >
                                <div
                                    className="w-full h-full bg-center bg-no-repeat bg-contain"
                                    style={{ backgroundImage: `url(${imageUrl})` }}
                                />
                            </a>
                        ) : (
                            <div
                                className="w-full h-full bg-center bg-no-repeat bg-contain"
                                style={{ backgroundImage: `url(${imageUrl})` }}
                            />
                        )}
                    </div>
                )}

                {/* 商品情報 */}
                <div className="space-y-4">
                    {infoItems.map((item, index) => (
                        item.condition !== false && (
                            <div key={index}>
                                <div className="text-sm font-medium text-muted-foreground">{item.label}</div>
                                <div className="text-base mt-1 whitespace-pre-line">{item.value}</div>
                            </div>
                        )
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}; 