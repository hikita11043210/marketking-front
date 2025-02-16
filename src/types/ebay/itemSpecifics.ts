import type { ApiResponse } from '../common/api';

export interface ItemSpecific {
    name: string;
    values: string[];
}

export interface ItemSpecificsData {
    item_specifics: ItemSpecific[];
    category_id: {
        [key: string]: string;
    };
}

export interface ItemSpecificsResponse extends ApiResponse<ItemSpecificsData> {}
