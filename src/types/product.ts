import { ShippingServiceOption } from '@/types/shipping-calculator';

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
    shippingDetails: {
        shippingServiceOptions: ShippingServiceOption[];
    };
    fulfillmentPolicyId?: string;
    paymentPolicyId?: string;
    returnPolicyId?: string;
    itemSpecifics: {
        nameValueList: Array<{
            name: string;
            value: string[];
        }>;
    };
}