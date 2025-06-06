'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';
import { LogOut, Gavel, Store, Menu, X, Calculator, BookOpen, TruckIcon, Database, DollarSign, User as UserIcon } from 'lucide-react';
import { BiHome } from 'react-icons/bi';
import { toast } from "sonner";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle
} from "@/components/ui/sheet";
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type NavItem = {
    title: string;
    icon: React.ReactNode;
    href?: string;
    subItems?: {
        title: string;
        href: string;
    }[];
};

const navigation: NavItem[] = [
    {
        title: "HOME",
        href: "/dashboard",
        icon: <BiHome className="h-5 w-5" />,
    },
    {
        title: "古物台帳",
        href: "/antique-ledger",
        icon: <BookOpen className="h-5 w-5" />,
    },
    {
        title: "収支管理",
        icon: <DollarSign className="h-5 w-5" />,
        subItems: [
            {
                title: "- 仕入管理",
                href: "/accounting/purchases",
            },
            {
                title: "- 売上管理",
                href: "/accounting/sales",
            },
            {
                title: "- 経費管理",
                href: "/accounting/expenses",
            },
        ],
    },
    {
        title: "Yahooオークション",
        icon: <Gavel className="h-5 w-5" />,
        subItems: [
            {
                title: "- 検索",
                href: "/yahoo-auction/search",
            },
            {
                title: "- 出品一覧",
                href: "/yahoo-auction/list",
            },
        ],
    },
    {
        title: "Yahooフリーマーケット",
        icon: <Store className="h-5 w-5" />,
        subItems: [
            {
                title: "- 検索",
                href: "/yahoo-freemarket/search",
            },
            {
                title: "- 出品一覧",
                href: "/yahoo-freemarket/list",
            },
        ],
    },
    {
        title: "計算ツール",
        icon: <Calculator className="h-5 w-5" />,
        href: "/calculator",
        subItems: [
            {
                title: "- 販売価格計算",
                href: "/calculator/price",
            },
            {
                title: "- 送料計算",
                href: "/calculator/shipping",
            },
        ],
    },
    {
        title: "マスタ",
        icon: <Database className="h-5 w-5" />,
        subItems: [
            {
                title: "- インポート",
                href: "/master/import",
            },
        ],
    },
    {
        title: "各種設定",
        href: "/settings",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
        ),
    },
];

export function Sidebar() {
    const router = useRouter();
    const { user, clearAuth } = useAuth();
    const [openItems, setOpenItems] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // クライアントサイドでのみレンダリングされるように
    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleItem = (title: string) => {
        setOpenItems(prev =>
            prev.includes(title)
                ? prev.filter(item => item !== title)
                : [...prev, title]
        );
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
            });

            if (response.ok) {
                clearAuth();
                router.push('/login');
            } else {
                throw new Error('ログアウトに失敗しました');
            }
        } catch (error) {
            toast.error('ログアウトに失敗しました');
        }
    };

    const SidebarContent = () => (
        <div className="flex h-full flex-col bg-background">
            <VisuallyHidden>メインメニュー</VisuallyHidden>

            {/* ユーザー情報セクション - クライアントサイドでのみレンダリング */}
            {mounted && user && (
                <div className="p-4 border-b">
                    <div className="flex items-center space-x-3">
                        <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto py-4 px-3">
                <nav className="space-y-2">
                    {navigation.map((item) => (
                        <div key={item.title}>
                            {item.subItems ? (
                                <Collapsible
                                    open={openItems.includes(item.title)}
                                    onOpenChange={() => toggleItem(item.title)}
                                >
                                    <CollapsibleTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start"
                                        >
                                            {item.icon}
                                            <span className="ml-3 flex-1 text-left">{item.title}</span>
                                        </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="pl-9 space-y-1">
                                        {item.subItems.map((subItem) => (
                                            <Button
                                                key={subItem.title}
                                                variant="ghost"
                                                className="w-full justify-start h-9 px-2"
                                                onClick={() => {
                                                    router.push(subItem.href);
                                                    setIsOpen(false);
                                                }}
                                            >
                                                {subItem.title}
                                            </Button>
                                        ))}
                                    </CollapsibleContent>
                                </Collapsible>
                            ) : (
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={() => {
                                        item.href && router.push(item.href);
                                        setIsOpen(false);
                                    }}
                                >
                                    {item.icon}
                                    <span className="ml-3">{item.title}</span>
                                </Button>
                            )}
                        </div>
                    ))}
                </nav>
            </div>
            <div className="border-t p-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    ログアウト
                </Button>
            </div>
        </div>
    );

    return (
        <>
            {/* デスクトップ表示 */}
            <div className="hidden md:flex h-screen w-64 flex-col bg-background border-r">
                <SidebarContent />
            </div>

            {/* モバイル表示 */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
                        <Menu className="h-6 w-6" />
                        <VisuallyHidden>メニューを開く</VisuallyHidden>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        </>
    );
} 