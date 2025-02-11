import { cookies } from 'next/headers';

export const API_BASE = process.env.API_BASE_URL?.replace('localhost', '127.0.0.1');

export async function getAuthHeader() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    return accessToken ? `Bearer ${accessToken}` : '';
}

export async function serverFetch(endpoint: string, options: RequestInit = {}) {
    const headers = {
        ...options.headers,
        'Authorization': await getAuthHeader(),
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    return response;
}