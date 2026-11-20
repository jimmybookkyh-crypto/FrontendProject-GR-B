import { useEffect, useState } from "react";

/* Alla anrop går via /api */
const BASE_URL = "/api";

type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

type ApiResponse<T> = {
  data?: T;
  error?: { message?: string };
};

function getErrorMessage(status: number, backendMessage?: string): string {
  if (status === 401) return "Du behöver logga in igen för att se det här.";
  if (backendMessage) return backendMessage;
  if (status === 404) return "Det du letar efter finns inte.";
  if (status >= 500)
    return "Servern svarar inte just nu. Försök igen om en stund.";
  return "Något gick fel när informationen skulle hämtas.";
}

/* Hämtar data från backend. */
export default function useFetch<T>(path: string | null): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: path !== null, 
    error: null,
  });

  useEffect(() => {
    if (path === null) return;

    const controller = new AbortController();
    setState({ data: null, loading: true, error: null });

    (async () => {
      // Behövs för skyddade anrop som /bookings/me
      const headers = new Headers();
      const token = localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);

      let response: Response;
      try {
        response = await fetch(`${BASE_URL}${path}`, {
          headers,
          signal: controller.signal,
        });
      } catch {
        if (controller.signal.aborted) return;
        setState({
          data: null,
          loading: false,
          error:
            "Kunde inte ansluta till servern. Kontrollera din internetanslutning.",
        });
        return;
      }

      let body: ApiResponse<T> | null = null;
      try {
        body = await response.json();
      } catch {
      
      }
      if (controller.signal.aborted) return;

      if (!response.ok || !body || body.data === undefined) {
        setState({
          data: null,
          loading: false,
          error: getErrorMessage(response.status, body?.error?.message),
        });
        return;
      }

      setState({ data: body.data, loading: false, error: null });
    })();

    return () => controller.abort();
  }, [path]);

  return state;
}
