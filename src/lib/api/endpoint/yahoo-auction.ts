import apiClient from '../../../app/api/client';  // デフォルトインポートを使用
import { SearchParams, SearchResult, SearchDetailResult } from '@/lib/types/search';
import { ApiResponse } from '@/lib/types/api';

export const YahooAuctionEndpoint = {
    getYahooAuctionItems: async (params: SearchParams): Promise<ApiResponse<SearchResult>> => {
        const response = await apiClient.get('yahoo-auction/items/', {
            params: {
                ...params,
            }
        });
        return response.data;
    },

    getYahooAuctionDetail: async (url: string): Promise<ApiResponse<SearchDetailResult>> => {
        const { data } = await apiClient.get(`yahoo-auction/detail/`,{
            params: {
                url: url,
            }
        });
        return data;
    },
}; 