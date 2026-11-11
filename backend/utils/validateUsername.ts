/* P32 (#511): användarnamnet får vara högst 20 tecken.
   Samma gräns finns i frontend (validateUtil.ts). */
export const USERNAME_MAX_LENGTH = 20;

export function isUsernameTooLong(username: string): boolean {
  return username.trim().length > USERNAME_MAX_LENGTH;
}

export const USERNAME_TOO_LONG_MESSAGE = `Användarnamnet får vara högst ${USERNAME_MAX_LENGTH} tecken`;
