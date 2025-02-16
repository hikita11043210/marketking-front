import type { ApiResponse } from '../common/api';

export interface EbayCategory {
    categoryId: string;
    categoryName: string;
    level: number;
    children?: EbayCategory[];
}

export interface EbayCategoryResponse extends ApiResponse<EbayCategory[]> {} 