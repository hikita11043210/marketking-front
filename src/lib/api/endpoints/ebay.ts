import type { ApiResponse } from '@/lib/types/api';
import apiClient from '@/lib/api/client';
import type { EbayAuthResponse, EbayPoliciesResponse, EbayRegisterResponse, EbayItemSpecificsResponse } from '@/lib/types/ebay';
import type { EbayRegisterData } from '@/lib/types/product';

export const ebayEndpoints = {
    auth: '/ebay/auth/',
    policies: '/ebay/policies/',
    register: '/ebay/register/',
    itemSpecifics: '/ebay/item-specifics/',
} as const;

export const ebayApi = {
    getAuthUrl: async (): Promise<ApiResponse<EbayAuthResponse>> => {
        const { data } = await apiClient.get(ebayEndpoints.auth);
        return data;
    },

    exchangeCodeForToken: async (code: string): Promise<ApiResponse<EbayAuthResponse>> => {
        const { data } = await apiClient.post(ebayEndpoints.auth, { code });
        return data;
    },

    getPolicies: async (marketplaceId: string, token: string): Promise<ApiResponse<EbayPoliciesResponse>> => {
        const { data } = await apiClient.get(`${ebayEndpoints.policies}?marketplace_id=${marketplaceId}&token=${token}`);
        return data;
    },


    register: async (data: EbayRegisterData): Promise<ApiResponse<EbayRegisterResponse>> => {
        const { data: responseData } = await apiClient.post(ebayEndpoints.register, data);
        return responseData;
    },

    createPolicies: async (token: string): Promise<ApiResponse<any>> => {
        const { data } = await apiClient.post('/testdata/', {
          token,
          marketplace_id: 'EBAY_US'
        });
        return data;
    },

    getItemSpecifics: async (itemId: string): Promise<ApiResponse<EbayItemSpecificsResponse>> => {
        const { data } = await apiClient.get(`${ebayEndpoints.itemSpecifics}?item_id=${itemId}`);
        return data;
    }

}; 