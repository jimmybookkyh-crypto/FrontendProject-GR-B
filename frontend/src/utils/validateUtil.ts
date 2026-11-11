// Hjälpfunktioner för validering av formulärfält.

export type FieldErrors<K extends string = string> = Partial<Record<K, string>>;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Validerar att ett fält inte är tomt.
export function requiredError(value: string, message = "Fyll i fältet.") {
  return value.trim() === "" ? message : undefined;
}
// Högst 20 tecken i användarnamnet (P32). Samma gräns finns i backend.
export const USERNAME_MAX_LENGTH = 20;

// Validerar att användarnamnet inte är tomt, är minst 3 och högst 20 tecken.
export function usernameError(username: string) {
  if (username.trim() === "") return "Fyll i användarnamn.";
  if (username.trim().length < 3)
    return "Användarnamnet måste vara minst 3 tecken.";
  if (username.trim().length > USERNAME_MAX_LENGTH)
    return `Användarnamnet får vara högst ${USERNAME_MAX_LENGTH} tecken.`;
  return undefined;
}
// Validerar att det är en giltig e-postadress.
export function emailError(email: string) {
  if (email.trim() === "") return "Fyll i din e-postadress.";
  if (!EMAIL_PATTERN.test(email.trim()))
    return "Fyll i en giltig e-postadress, t.ex. namn@exempel.se.";
  return undefined;
}
// Validerar att det är ett giltigt lösenord.
export function passwordError(password: string) {
  if (password.length < 8) return "Lösenordet måste vara minst 8 tecken.";
  if (new TextEncoder().encode(password).length > 72)
    return "Lösenordet är för långt.";
  return undefined;
}

export function hasErrors(errors: FieldErrors) {
  return Object.values(errors).some(Boolean);
}