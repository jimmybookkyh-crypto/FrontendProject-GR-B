import { useEffect, useState } from "react";

/* Alla anrop går via /api – Vite-proxyn (#336) skickar dem vidare till backend */
const BASE_URL = "/api";

type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

/* Backend svarar alltid { data: ... } eller { error: { message: ... } } */
type ApiResponse<T> = {
  data?: T;
  error?: { message?: string };
};

/* Översätter statuskoden till ett svenskt felmeddelande */
function getErrorMessage(status: number, backendMessage?: string): string {
  if (backendMessage) return backendMessage;
  if (status === 404) return "Det du letar efter finns inte.";
  if (status >= 500)
    return "Servern svarar inte just nu. Försök igen om en stund.";
  return "Något gick fel när informationen skulle hämtas.";
}

/* Hämtar data från backend.
   path = sökvägen i backend, t.ex. "/movies/current" eller `/movies/${id}`.
   Skicka null om hämtningen ska vänta (t.ex. tills ett id finns).
   Användning: const { data, loading, error } = useFetch<Movie[]>("/movies/current"); */
export default function useFetch<T>(path: string | null): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: path !== null, // väntar om det finns något att hämta
    error: null,
  });

  useEffect(() => {
    if (path === null) return;

    // Avbryter anropet om sidan lämnas eller path ändras innan svaret kommit
    const controller = new AbortController();
    setState({ data: null, loading: true, error: null });

    (async () => {
      let response: Response;
      try {
        response = await fetch(`${BASE_URL}${path}`, {
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
        // Svaret var inte JSON, t.ex. om backend inte är igång
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
