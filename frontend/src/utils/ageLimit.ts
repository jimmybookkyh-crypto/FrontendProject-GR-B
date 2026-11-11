import { useSearchParams } from "react-router";

export type AgeLimit = null | 0 | 7 | 11 | 15;

type AgeOption = {
  value: AgeLimit;
  label: string;
  urlValue: string | null; 
};

export const AGE_OPTIONS: AgeOption[] = [
  { value: null, label: "Alla åldrar", urlValue: null },
  { value: 7, label: "Från 7 år", urlValue: "7" },
  { value: 11, label: "Från 11 år", urlValue: "11" },
  { value: 15, label: "Från 15 år", urlValue: "15" },
];

const AGE_PARAM = "alder";

export function useAgeLimit(): [AgeLimit, (limit: AgeLimit) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlValue = searchParams.get(AGE_PARAM);
  const ageLimit =
    AGE_OPTIONS.find((option) => option.urlValue === urlValue)?.value ?? null;

  const setAgeLimit = (limit: AgeLimit) => {
    const option = AGE_OPTIONS.find((o) => o.value === limit);

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (option?.urlValue) {
          next.set(AGE_PARAM, option.urlValue);
        } else {
          next.delete(AGE_PARAM);
        }
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  };

  return [ageLimit, setAgeLimit];
}

export function filterByAgeLimit<T extends { ageRating?: number | null }>(
  movies: T[],
  ageLimit: AgeLimit,
): T[] {
  if (ageLimit === null) return movies;

  return movies.filter(
    (movie) =>
      movie.ageRating !== null &&
      movie.ageRating !== undefined &&
      movie.ageRating <= ageLimit,
  );
}
