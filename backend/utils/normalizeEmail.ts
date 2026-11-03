export const normalizeEmail = (email: unknown) =>
  typeof email === "string" ? email.trim().toLowerCase() : email;