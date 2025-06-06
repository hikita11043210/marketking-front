import { Sidebar } from "@/components/layout/Sidebar";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex h-screen">
                <Sidebar />
                <main className="flex-1 overflow-hidden">
                    <div className="h-full overflow-auto px-6 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
} 