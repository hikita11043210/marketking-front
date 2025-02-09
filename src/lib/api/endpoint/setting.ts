import apiClient from '../../../app/api/client';
import type { Setting, SettingResponse } from '@/lib/types/setting';


export const settingEndpoints = {
    get: 'settings/',
    update: 'settings/',
} as const;

export const settingApi = {
    get: async (): Promise<SettingResponse> => {
        const { data } = await apiClient.get(settingEndpoints.get);
        return data;
    },

    update: async (settings: Setting): Promise<SettingResponse> => {
        const { data } = await apiClient.put(settingEndpoints.update, settings);
        return data;
    },
}; 