// APIのベースURL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
export const API_ENDPOINT = `${API_BASE_URL}/api/v1`;

export const API_TIMEOUT = 30000; // 30 seconds

export const API_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
} as const; 