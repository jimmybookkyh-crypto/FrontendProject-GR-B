
import apiRequest from "./apiRequest.ts"

//jwtDecode används då '/users/:Id' behöver användarens ID från token för att kunna hämta användarens data.
import { jwtDecode } from "jwt-decode"; 
import { AuthUser } from "../interface/types";

//för token decoding
interface TokenPayload {
  sub: string;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}
interface RegisterResponse {
  data: AuthUser & {
    created_At: string;
  };
}

export const authService = {
    login:(email: string, password: string) => {
        return apiRequest<LoginResponse>("users/auth/login", {
            method: "POST",
            body: JSON.stringify({email, password}),

        });
    },

    
    register:(username: string, email: string, password: string) => {
        return apiRequest<RegisterResponse>("users/auth/register", {
            method: "POST",
            body: JSON.stringify({username, email, password}),
        });
    },

    // ger användarens data baserat på token som finns i localStorage.
    // restorerar användarens session vid uppdatering av sidan.
    async me(): Promise<AuthUser> {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("Ingen token hittades");
        }

        const payload = jwtDecode<TokenPayload>(token);

        if (!payload.sub) {
            throw new Error("Token saknar ett användar ID");
        }

        return apiRequest<AuthUser>(`users/${encodeURIComponent(payload.sub)}`);

    },
}