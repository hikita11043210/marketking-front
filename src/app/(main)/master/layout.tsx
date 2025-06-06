import React from "react";

export default function MasterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold mb-6">マスタ管理</h1>
            {children}
        </div>
    );
} 