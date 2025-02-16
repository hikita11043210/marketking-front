import type { ApiResponse } from '../common/api';

export interface FulfillmentPolicy {
    name: string;
    marketplaceId: string;
    categoryTypes: Array<{
        name: string;
        default?: boolean;
    }>;
    handlingTime: { value: number, unit: string };
    shipToLocations: {
        regionIncluded: Array<{ regionName: string }>;
        regionExcluded: Array<{ regionName: string }>;
    };
    shippingOptions: Array<{
        optionType: string;
        costType: string;
        shippingServices: Array<{
            sortOrder: number;
            shippingCarrierCode: string;
            shippingServiceCode: string;
            shippingCost: { value: string; currency: string };
            additionalShippingCost: { value: string; currency: string };
            freeShipping: boolean;
            shipToLocations?: {
                regionIncluded: Array<{ regionName: string }>;
            };
            buyerResponsibleForShipping: boolean;
            buyerResponsibleForPickup: boolean;
        }>;
        shippingDiscountProfileId: string;
        shippingPromotionOffered: boolean;
    }>;
    globalShipping: boolean;
    pickupDropOff: boolean;
    freightShipping: boolean;
    fulfillmentPolicyId: string;
}

export interface PaymentPolicy {
    name: string;
    description: string;
    marketplaceId: string;
    categoryTypes: Array<{
        name: string;
        default?: boolean;
    }>;
    paymentMethods: Array<any>;
    immediatePay: boolean;
    paymentPolicyId: string;
}

export interface ReturnPolicy {
    name: string;
    marketplaceId: string;
    categoryTypes: Array<{
        name: string;
    }>;
    returnsAccepted: boolean;
    returnPeriod: { value: number; unit: string };
    refundMethod: string;
    returnMethod: string;
    returnShippingCostPayer: string;
    internationalOverride: {
        returnsAccepted: boolean;
        returnMethod: string;
        returnPeriod: { value: number; unit: string };
        returnShippingCostPayer: string;
    };
    returnPolicyId: string;
}

export interface PolicyGroup<T> {
    total: number;
    [key: string]: T[] | number;
}

export interface EbayPolicies {
    fulfillment: {
        total: number;
        fulfillmentPolicies: FulfillmentPolicy[];
    };
    payment: {
        total: number;
        paymentPolicies: PaymentPolicy[];
    };
    return: {
        total: number;
        returnPolicies: ReturnPolicy[];
    };
}

export interface EbayPoliciesResponse extends ApiResponse<EbayPolicies> {} 