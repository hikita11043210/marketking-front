import { toast } from "sonner";

type ActionType = 'withdraw' | 'relist' | 'sync' | 'purchase' | 'sales';

interface ActionHandlerParams {
  actionType: ActionType;
  sku: string;
  offerId?: string;
  setActionLoading: (value: string) => void;
  fetchItems: () => void;
}

// オークション関連のアクションハンドラー
export const handleAuctionAction = async ({
  actionType,
  sku,
  offerId,
  setActionLoading,
  fetchItems
}: ActionHandlerParams) => {
  // アクションタイプごとのエンドポイントとメッセージ
  const actionConfig = {
    withdraw: {
      endpoint: '/api/ebay/actions/withdraw/',
      errorMessage: '取下げに失敗しました',
      successMessage: '商品を正常に取下げました',
      loadingKey: `withdraw-${sku}`
    },
    relist: {
      endpoint: '/api/ebay/actions/republish/',
      errorMessage: '再出品に失敗しました',
      successMessage: '商品を再出品しました',
      loadingKey: `relist-${sku}`
    },
    sync: {
      endpoint: '/api/ebay/actions/synchronize/',
      errorMessage: '同期に失敗しました',
      successMessage: '商品情報の同期が完了しました',
      loadingKey: `sync-${sku}`
    },
    purchase: {
      endpoint: '/api/ebay/actions/purchase/',
      errorMessage: '仕入処理に失敗しました',
      successMessage: '仕入情報を登録しました',
      loadingKey: `purchase-${sku}`
    },
    sales: {
      endpoint: '/api/ebay/actions/sales/',
      errorMessage: '売上登録に失敗しました',
      successMessage: '売上情報を登録しました',
      loadingKey: `sales-${sku}`
    }
  };

  const config = actionConfig[actionType];
  
  try {
    setActionLoading(config.loadingKey);
    
    // リクエストボディの作成（offerIdが必要な場合は追加）
    const body = offerId ? { sku, offer_id: offerId } : { sku };
    
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || config.errorMessage);
    }

    toast.success(data.message || config.successMessage);
    // 成功したら一覧を再取得
    fetchItems();
  } catch (error) {
    console.error(`Failed to ${actionType} item:`, error);
    toast.error(error instanceof Error ? error.message : config.errorMessage);
  } finally {
    setActionLoading('');
  }
};

// フリーマーケット関連のアクションハンドラー
export const handleFreeMarketAction = async ({
  actionType,
  sku,
  offerId,
  setActionLoading,
  fetchItems
}: ActionHandlerParams) => {
  console.log(actionType);
  if (!offerId && (actionType === 'withdraw' || actionType === 'relist')) {
    toast.error('Offer IDが必要です');
    return;
  }

  // フリーマーケット用のエンドポイント
  const endpoint = '/api/ebay/offer';
  
  const actionMapping = {
    withdraw: 'withdraw',
    relist: 'publish'
  };
  
  const actionConfig = {
    withdraw: {
      errorMessage: '取下げに失敗しました',
      successMessage: '商品を正常に取下げました',
      loadingKey: `withdraw-${offerId}`
    },
    relist: {
      errorMessage: '再出品に失敗しました',
      successMessage: '商品を再出品しました',
      loadingKey: `relist-${offerId}`
    },
    sync: {
      errorMessage: '同期に失敗しました',
      successMessage: '商品情報の同期が完了しました',
      loadingKey: 'sync'
    },
    purchase: {
      errorMessage: '仕入処理に失敗しました',
      successMessage: '仕入情報を登録しました',
      loadingKey: `purchase-${sku}`
    },
    sales: {
      errorMessage: '売上登録に失敗しました',
      successMessage: '売上情報を登録しました',
      loadingKey: `sales-${sku}`
    }
  };

  const config = actionConfig[actionType];
  
  try {
    setActionLoading(config.loadingKey);
    
    let response;
    
    if (actionType === 'withdraw' || actionType === 'relist') {
      // オファー関連のアクション
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: actionMapping[actionType as 'withdraw' | 'relist'],
          offer_id: offerId,
          sku
        }),
      });
    } else {
      // その他のアクション
      const actionEndpoint = actionType === 'sync' 
        ? '/api/synchronize/ebay'
        : `/api/ebay/actions/${actionType}/`;
        
      response = await fetch(actionEndpoint, {
        method: actionType === 'sync' ? 'GET' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: actionType === 'sync' ? undefined : JSON.stringify({ sku }),
      });
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || config.errorMessage);
    }

    toast.success(data.message || config.successMessage);
    // 成功したら一覧を再取得
    fetchItems();
  } catch (error) {
    console.error(`Failed to ${actionType} item:`, error);
    toast.error(error instanceof Error ? error.message : config.errorMessage);
  } finally {
    setActionLoading('');
  }
};

// グローバル同期アクション用のハンドラー
export const handleGlobalSync = async (
  marketplaceType: 'ebay' | 'yahoo-auction' | 'yahoo-free-market',
  setActionLoading: (value: string) => void,
  fetchItems: () => void
) => {
  const loadingKey = marketplaceType === 'ebay' ? 'sync' : 'yahoo-sync';
  const endpoint = `/api/synchronize/${marketplaceType}`;
  const errorMessage = marketplaceType === 'ebay' ? '同期に失敗しました' : 'Yahoo同期に失敗しました';
  console.log(endpoint);
  
  try {
    setActionLoading(loadingKey);
    const response = await fetch(endpoint, {
      method: 'GET',
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || errorMessage);
    }
    
    toast.success(data.message || "同期が完了しました");
    // 成功したら一覧を再取得
    fetchItems();
  } catch (error) {
    console.error(`Failed to synchronize ${marketplaceType}:`, error);
    toast.error(error instanceof Error ? error.message : errorMessage);
  } finally {
    setActionLoading('');
  }
}; 