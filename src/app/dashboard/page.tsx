'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-8 text-gray-800">ダッシュボード</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">統計情報</h2>
                    <p className="text-gray-600">ここに統計情報が表示されます</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">最近の取引</h2>
                    <p className="text-gray-600">最近の取引履歴が表示されます</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">パフォーマンス</h2>
                    <p className="text-gray-600">パフォーマンス指標が表示されます</p>
                </div>
            </div>
        </div>
    );
} 