//import useFetch

//jwtDecode används då '/users/:Id' behöver användarens ID från token för att kunna hämta användarens data.
import { jwtDecode } from "jwt-decode"; 
import { AuthUser, AuthResponse } from "../interface/types";

//för token decoding
interface TokenPayload {
  sub: string;
}
interface UserResponse {
    data: AuthUser;
}

export const authService = {
    login:(email: string, password: string) => {
        return useFetch<AuthResponse>("users/auth/login", {
            method: "POST",
            body: JSON.stringify({email, password}),

        });
    },

    
    register:(username: string, email: string, password: string) => {
        return useFetch<AuthResponse>("users/auth/register", {
            method: "POST",
            body: JSON.stringify({username, email, password}),
        });
    },

    //ger användarens data baserat på token som finns i localStorage.
    async me(): Promise<AuthUser> {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("Ingen token hittades");
        }

        const payload = jwtDecode<TokenPayload>(token);

        if (!payload.sub) {
            throw new Error("Token saknar ett användar ID");
        }

        const response = await useFetch<UserResponse>(`users/${encodeURIComponent(payload.sub)}`);

        return response.data;
    }
}