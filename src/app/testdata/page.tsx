'use client';

import { useState, useEffect } from 'react';
import { ebayApi } from '@/lib/api/endpoint/ebay';
// import { useEbayToken } from '@/hooks/useEbayToken';  // トークン取得用フック

const TestDataPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);
    // const { token } = useEbayToken();  // トークンを取得
    const token = localStorage.getItem('ebayToken');

    useEffect(() => {
        if (token) {
            checkSetupStatus(token);
        }
    }, []);



    const checkSetupStatus = async (token: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await ebayApi.createPolicies(token);
            setResult(response.data);

        } catch (error: any) {
            console.error('Setup check failed:', error);
            setError(error.message || 'エラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return <div>トークンを取得中...</div>;
    }

    if (loading) {
        return <div>セットアップ状態を確認中...</div>;
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
                <h3 className="font-bold text-red-700">エラーが発生しました</h3>
                <p>{error}</p>
                <button
                    onClick={() => checkSetupStatus(token)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    再試行
                </button>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">ポリシー設定結果</h2>
            <pre className="bg-gray-50 p-4 rounded overflow-auto">
                {JSON.stringify(result, null, 2)}
            </pre>
        </div>
    );
};

export default TestDataPage;