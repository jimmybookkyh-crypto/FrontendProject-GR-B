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

export function AuthProvider({children}: {children: ReactNode;}) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function restoreSession() {
            const token = localStorage.getItem("token");

            if(!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await authService
            }
        }
    })
}