
const BASE_URL = "/api";

interface ApiErrorResponse {
    error?: {
        message?: string;
    }
}

//RequestInit är en inbyggd Typescript typ för options som method, headers och body
export default async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem("token");
    const headers = new Headers(options.headers);

    if(options.body && !(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    //Authorization adderas bara om en token finns
    if(token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(
        `${BASE_URL}/${path.replace(/^\+/, "")}`,
        {
            ...options,
            headers,
        }
    );

    //DELETE kan svara med 204 No Content
    if(response.status === 204) {
        return undefined as T;
    }

    let body: unknown;

    try {
        body = await response.json();
    } catch {
        if(!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        throw new Error("Servern returnerade ett ogiltigt svar.");
    }

    const errorBody = body as ApiErrorResponse;

    if (!response.ok) {
        throw new Error( errorBody.error?.message ?? `Förfrågning misslyckades: ${response.status}`);
    }

    //stödjer både { data: ... } och directa JSON responses

    if( typeof body === "object" && body !== null && "data" in body) {
        return (body as { data: T }).data;
    }

    return body as T;

}