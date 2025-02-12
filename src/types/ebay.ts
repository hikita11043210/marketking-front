import type { ApiResponse } from './api';

// eBay認証関連の型
export interface EbayAuthTokens {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}

export interface EbayAuthResponse extends ApiResponse<{
    auth_url: string;
}> {}

export interface EbayTokenResponse extends ApiResponse<EbayAuthTokens> {}

// eBayポリシー関連の型
export interface FulfillmentPolicy {
    name: string;
    marketplaceId: string;
    categoryTypes: Array<any>;
    handlingTime: { value: number, unit: string };
    shipToLocations: { regionIncluded: Array<any>, regionExcluded: Array<any> };
    shippingOptions: Array<any>;
    globalShipping: boolean;
    pickupDropOff: boolean;
    freightShipping: boolean;
    fulfillmentPolicyId: string;
}

export interface PaymentPolicy {
    categoryTypes: Array<any>;
    description: string;
    immediatePay: boolean;
    marketplaceId: string;
    name: string;
    paymentMethods: Array<any>;
    paymentPolicyId: string;
}

export interface ReturnPolicy {
    categoryTypes: Array<any>;
    internationalOverride: {
        returnsAccepted: boolean;
        returnMethod: string;
        returnPeriod: { value: number, unit: string };
        returnShippingCostPayer: string;
    };
    marketplaceId: string;
    name: string;
    refundMethod: string;
    returnPeriod: { value: number, unit: string };
    returnPolicyId: string;
    returnShippingCostPayer: string;
    returnsAccepted: boolean;
}

export interface EbayPolicies {
    fulfillment: FulfillmentPolicy[];
    payment: PaymentPolicy[];
    return: ReturnPolicy[];
}

export interface EbayPoliciesResponse extends ApiResponse<EbayPolicies> {}

// eBayカテゴリー関連の型
export interface EbayCategory {
    categoryId: string;
    categoryName: string;
    level: number;
    children?: EbayCategory[];
}

export interface EbayCategoryResponse extends ApiResponse<EbayCategory[]> {}

// eBay商品登録関連の型
export interface EbayInventoryItem {
    // 商品登録に必要なフィールドを定義
    sku: string;
    title: string;
    description: string;
    price: number;
    quantity: number;
    // ... その他必要なフィールド
}

export interface EbayRegisterResponse {
    success: boolean;
    message?: string;
    data?: {
        itemId: string;
        fees: {
            fee: {
                name: string;
                amount: {
                    value: string;
                    currencyId: string;
                };
            }[];
        };
    };
}

export interface EbayInventoryResponse extends ApiResponse<{
    offer_id: string;
}> {}

export interface EbayItemSpecifics {
    nameValueList: Array<{
        name: string;
        value: string[];
    }>;
}

export interface EbayItemSpecificsResponse extends ApiResponse<{
    itemSpecifics: EbayItemSpecifics;
}> {} 