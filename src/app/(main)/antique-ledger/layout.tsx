import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "古物台帳 | MarketKing",
    description: "古物台帳を管理するシステムです。",
};

export default function AntiqueLedgerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
} 