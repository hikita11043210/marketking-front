export default function SearchLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="flex-1 overflow-y-auto">
            {children}
        </main>
    );
} 