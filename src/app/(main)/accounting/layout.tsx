import { ReactNode } from 'react';

interface AccountingLayoutProps {
    children: ReactNode;
}

export default function AccountingLayout({ children }: AccountingLayoutProps) {
    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">会計管理</h1>
            {children}
        </div>
    );
} 