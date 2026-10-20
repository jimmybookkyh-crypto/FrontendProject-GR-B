// är en .tsx fil då filen innehåller JSX syntax men är ingen react komponent

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import { authService } from "./authService.ts";

import { AuthUser, AuthContextType } from "../interface/types.ts";

const AuthContext = createContext<AuthContextType | undefined>(undefined);
interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({children}: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    //Restorerar användarens session vid uppdatering av sidan.
    useEffect(() => {
        async function restoreSession() {
            const token = localStorage.getItem("token");

            if(!token) {
                setLoading(false);
                return;
            }

            try {
                const currentUser = await authService.me();
                setUser(currentUser);
            } catch(error) {
                console.error("Kunde inte restorera sessionen:", error);
                localStorage.removeItem("token");
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        void restoreSession();
    }, []);

    //logga in en existerande användare
    async function login(email: string, password: string) {
        const response = await authService.login(email, password);

        localStorage.setItem("tokeen", response.token);
        setUser(response.user);
    }

    //registrera en ny användare (utan att automatiskt logga in)
    async function register(username: string, email: string, password: string) {
        await authService.register(username, email, password);
    }

    //logga ut användaren
    function logout() {
        localStorage.removeItem("token");
        setUser(null);
    }

    return (
        <AuthContext.Provider
        value= {{
            user,
            loading,
            login,
            register,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// låter andra komponenter få tillgång till kontext 
export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error(
            "useAuth måste användas utan en AuthProvider"
        );
    }

    return context;
}