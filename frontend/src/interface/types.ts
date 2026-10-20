/* placeholder for types */

export interface AuthUser {
    userId: string;
    email: string;
    role: "user" | "admin";
}
export interface AuthResponse {
    token: string;
    user: AuthUser;
}
export interface AuthContextType {
    user: AuthUser | null;
    loading: boolean | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (username: string, email: string, password: string) => Promise<void>;
}