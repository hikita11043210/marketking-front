import type { ApiResponse } from '../common/api';

export interface EbayItemSpecifics {
    nameValueList: Array<{
        name: string;
        value: string[];
    }>;
}

export interface EbayItemSpecificsResponse extends ApiResponse<{
    itemSpecifics: EbayItemSpecifics;
}> {}

export interface EbayRegisterData {
    title: string;
    description: string;
    primaryCategory: {
        categoryId: string;
    };
    startPrice: {
        value: string;
        currencyId: string;
    };
    quantity: number;
    listingDuration: string;
    listingType: string;
    country: string;
    currency: string;
    paymentMethods: string[];
    condition: {
        conditionId: string;
        conditionDescription: string;
    };
    returnPolicy: {
        returnsAccepted: boolean;
        returnsPeriod: string;
        returnsDescription: string;
    };
    shippingPolicyId?: string;
    paymentPolicyId?: string;
    returnPolicyId?: string;
    itemSpecifics: EbayItemSpecifics;
    images: string[];
}

export interface EbayRegisterResponse extends ApiResponse<{
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
}> {} 