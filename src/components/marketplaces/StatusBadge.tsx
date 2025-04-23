import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
    status: string;
}

export const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
        '出品中': 'bg-green-500 text-white',
        '取下げ': 'bg-gray-500 text-white',
        '売却': 'bg-blue-500 text-white',
        '完了': 'bg-purple-500 text-white',
        '出品失敗': 'bg-red-500 text-white',
        '再出品済': 'bg-gray-500 text-white',
        '仕入可': 'bg-green-500 text-white',
        '仕入済': 'bg-purple-500 text-white',
        '仕入不可': 'bg-red-500 text-white',
    };

    return (
        <Badge className={`${statusColors[status] || 'bg-gray-500 text-white'} whitespace-nowrap min-w-[80px] justify-center`}>
            {status}
        </Badge>
    );
}; 