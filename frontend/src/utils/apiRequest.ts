
const BASE_URL = "/api";

interface ApiErrorResponse {
    error?: {
        message?: string;
    }
}

//RequestInit är en inbyggd Typescript typ för options som method, headers och body

// RequestInit = {} innehåller inställningar för HTTP-anropet och har ett tomt objekt som standardvärde
export default async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem("token");
    const headers = new Headers(options.headers);

    if(options.body && !(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

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

    if(response.status === 204) {
        return undefined as T;
    }

    let body: unknown;

    try {
        body = await response.json();
    } catch {
        if(!response.ok) {
            throw new Error("Något gick fel. Försök igen om en stund.");
        }

        throw new Error("Servern returnerade ett ogiltigt svar.");
    }

    const errorBody = body as ApiErrorResponse;

    //vid HTTP-fel vid giltig JSON
    if (!response.ok) {
        throw new Error( errorBody.error?.message ?? "Något gick fel. Försök igen om en stund.");
    }

    //stödjer både { data: ... } och directa JSON responses
    if( typeof body === "object" && body !== null && "data" in body) {
        return (body as { data: T }).data;
    }

    return body as T;

}