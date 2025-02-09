import apiClient from '../client';  // デフォルトインポートを使用
import { SearchParams, SearchResult, SearchDetailResult } from '@/types/search';
import { ApiResponse } from '@/types/api';

export const yahooAuctionEndpoints = {
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