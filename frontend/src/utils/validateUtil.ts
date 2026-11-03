// Hjälpfunktioner för validering av formulärfält.

export type FieldErrors<K extends string = string> = Partial<Record<K, string>>;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Validerar att ett fält inte är tomt.
export function requiredError(value: string, message = "Obligatoriskta fält måste fyllas i.") {
  return value.trim() === "" ? message : undefined;
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