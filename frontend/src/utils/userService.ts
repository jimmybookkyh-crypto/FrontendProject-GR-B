import apiRequest from "./apiRequest.ts";
import type { AuthUser } from "../interface/types.ts";

/* Det som skickas när användaren sparar Mina uppgifter (T126).
   Backend kräver i dag alltid ett lösenord i PATCH /users/:Id (#299, fixas i sprint 4).
   Därför skickas antingen det nya lösenordet, eller det nuvarande om man inte byter. */
export interface UpdateProfileInput {
  username: string;
  email: string;
  password: string;
}

/* Svaret från DELETE /users/:Id */
export interface DeleteAccountResponse extends AuthUser {
  cancelledBookings: number; // antal kommande bokningar som avbokades
}

export const userService = {
  /* Kontrollerar att nuvarande lösenord stämmer genom att logga in på nytt.
     Inloggningen sker med användarnamn sedan PR #371.
     Den nya token sparas inte – vi vill bara veta om lösenordet är rätt.
     (Backend kontrollerar inte nuvarande lösenord i PATCH än, se T168.) */
  async verifyPassword(username: string, password: string): Promise<void> {
    try {
      await apiRequest<unknown>("users/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
    } catch {
      throw new Error("Nuvarande lösenord stämmer inte.");
    }
  },

  /* Uppdaterar namn, e-post och lösenord för den inloggade användaren */
  updateProfile(userId: string, input: UpdateProfileInput): Promise<AuthUser> {
    return apiRequest<AuthUser>(`users/${encodeURIComponent(userId)}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  /* Raderar kontot. Kommande bokningar avbokas och tidigare anonymiseras (backend) */
  deleteAccount(userId: string): Promise<DeleteAccountResponse> {
    return apiRequest<DeleteAccountResponse>(
      `users/${encodeURIComponent(userId)}`,
      { method: "DELETE" },
    );
  },
};
