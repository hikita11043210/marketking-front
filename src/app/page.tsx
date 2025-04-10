'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // ルートページにアクセスしたらログイン画面にリダイレクト
    router.push('/login');
  }, [router]);

  // リダイレクト中は何も表示しないか、ローディング表示を行う
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">リダイレクト中...</p>
    </div>
  );
}
