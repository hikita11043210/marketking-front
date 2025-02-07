import apiClient from '../client';  // デフォルトインポートを使用
import { ItemSearchParams, CategorySearchParams, SearchResult, CategoryResult } from '@/lib/types/search';
import { ApiResponse } from '@/lib/types/api';
import type { SearchResponse, SearchDetailResult } from '@/lib/types/search';

export interface SearchParams {
    platform: string;
    p: string;
    min?: string;
    max?: string;
    price_type?: string;
    auccat?: string;
    va?: string;
    istatus?: string;
    fixed?: string;
    new?: string;
    is_postage_mode?: string;
    n?: string;
}

export const searchApi = {
    searchYahooAuctionItems: async (params: ItemSearchParams): Promise<ApiResponse<SearchResult[]>> => {
        const response = await apiClient.get('search/yahoo-auction/items/', {
            params: {
                ...params,

                platform: 'yahoo'
            }
        });
        return response.data;
    },

    searchYahooAuctionCategories: async (params: CategorySearchParams): Promise<ApiResponse<CategoryResult[]>> => {
        const response = await apiClient.get('search/yahoo-auction/categories/', {
            params: {

                ...params,
                platform: 'yahoo'
            }
        });
        return response.data;
    },

    yahooAuction: async (params: SearchParams): Promise<SearchResponse> => {
        const queryParams = new URLSearchParams({

            platform: params.platform,
            p: params.p,
            ...(params.min && { min: params.min }),
            ...(params.max && { max: params.max }),
            ...(params.price_type && { price_type: params.price_type }),
            ...(params.auccat && { auccat: params.auccat }),
            ...(params.va && { va: params.va }),
            ...(params.istatus && { istatus: params.istatus }),
            ...(params.fixed && { fixed: params.fixed }),
            ...(params.new && { new: params.new }),
            ...(params.is_postage_mode && { is_postage_mode: params.is_postage_mode }),
            ...(params.n && { n: params.n }),
        });

        const { data } = await apiClient.get(`search/yahoo-auction/items/?${queryParams}`);
        return data;
    },

    yahooDetail: async (url: string): Promise<SearchDetailResult> => {
        const queryParams = new URLSearchParams({
            url: url,
        });

        const { data } = await apiClient.get(`search/yahoo-auction/detail/?${queryParams}`);
        return data;
    },
}; 