import apiRequest from "./apiRequest.ts";
import type { AuthUser } from "../interface/types.ts";


export interface UpdateProfileInput {
  username: string;
  email: string;
  password: string;
  currentPassword: string;
}


export interface DeleteAccountResponse extends AuthUser {
  cancelledBookings: number;
}

export const userService = {
  updateProfile(userId: string, input: UpdateProfileInput): Promise<AuthUser> {
    return apiRequest<AuthUser>(`users/${encodeURIComponent(userId)}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  deleteAccount(userId: string): Promise<DeleteAccountResponse> {
    return apiRequest<DeleteAccountResponse>(
      `users/${encodeURIComponent(userId)}`,
      { method: "DELETE" },
    );
  },
};
