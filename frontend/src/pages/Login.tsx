//PLACEHOLDER FÖR TEST
// ta bort vid implementering av faktisk sida

import { useAuth } from "../utils/authContext.tsx"
export default function Login() {
    const username = "xX_SuperBertil_DragonSlayer_Xx";
    const email = "ImSoAmazingLiteralGod@gmail.com";
    const password = "SUPAtestOMG123!!";

    const { user, login, register, logout } = useAuth();

    async function handleRegister() {
        try {
            await register(username, email, password);
            console.log("Registreringen lyckades!");
        } catch (error) {
            console.error("Fel i register:", error);
        }
    }

    async function handleLogin() {
        try {
            await login(email, password);
            console.log("Login lyckades!");
        } catch (error) {
            console.error("Fel i login:", error);
        }
    }

    function handleLogout() {
        logout();
        console.log("Logout anropad.");
    }

    return (
        <div>
            <h1>Testa autentisering</h1>

            <p>
                Användare: {user ? user.username : "Inte inloggad"}
            </p>

            <button onClick={handleRegister}>
                Testa register
            </button>

            <button onClick={handleLogin}>
                Testa login
            </button>

            <button onClick={handleLogout}>
                Testa logout
            </button>
        </div>
    );
}

Login.route = {
  path: "/login",
  order: 0,
  label: "Login",
};
