import apiClient from '../client';
import type { Setting, SettingResponse } from '@/types/settings';
import { ApiResponse } from '@/types/api';

export const settingApi = {
    get: async (): Promise<ApiResponse<Setting>> => {
        const { data } = await apiClient.get('settings/');
        return data;
    },

    update: async (settings: Setting): Promise<ApiResponse<Setting>> => {
        const { data } = await apiClient.put('settings/', settings);
        return data;
    },

}; 