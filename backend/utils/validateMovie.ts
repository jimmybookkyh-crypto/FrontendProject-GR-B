function isStringArray(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "string" &&
        item.trim().length > 0,
    )
  );
}

export function validateMovieData(
  body: Record<string, unknown>,
  partial = false,
): string | null {
  if (!partial) {
    if (
      typeof body.title !== "string" ||
      body.title.trim().length === 0
    ) {
      return "title måste anges som en icke-tom sträng";
    }
  }

  if (
    body.title !== undefined &&
    (
      typeof body.title !== "string" ||
      body.title.trim().length === 0
    )
  ) {
    return "title måste anges som en icke-tom sträng";
  }

  const ageRating = body.ageRating;

  if (ageRating !== undefined) {
    if (
      typeof ageRating !== "number" ||
      !Number.isInteger(ageRating) ||
      ageRating < 0 ||
      ageRating > 99
    ) {
      return "ageRating måste vara ett heltal mellan 0 och 99";
    }
  }

  const length = body.length;

  if (length !== undefined) {
    if (
      typeof length !== "number" ||
      !Number.isInteger(length) ||
      length <= 0
    ) {
      return "length måste vara ett positivt heltal";
    }
  }

  const currentYear = new Date().getFullYear();
  const productionyear = body.productionyear;

  if (productionyear !== undefined) {
    if (
      typeof productionyear !== "number" ||
      !Number.isInteger(productionyear) ||
      productionyear < 1888 ||
      productionyear > currentYear + 5
    ) {
      return `productionyear måste vara mellan 1888 och ${currentYear + 5}`;
    }
  }

  const stringArrayFields = [
    "actors",
    "images",
    "youtubetrailers",
    "productioncountries",
  ];

  for (const field of stringArrayFields) {
    const value = body[field];

    if (value !== undefined && !isStringArray(value)) {
      return `${field} måste vara en array av strängar`;
    }
  }

  return null;
}