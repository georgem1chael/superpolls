import { createContext, useState, type FC, type ReactNode } from "react";

interface User {
    id: number;
    name: string;
    email: string;
}

interface Auth {
    user: User | null;
    authError: string | null;

    login: (email: string, password: string) => void;
    signup: (name: string, email: string, password: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<Auth>({
    user: null,
    authError: null,
    login: () => {},
    signup: () => {},
    logout: () => {},
});

const BACKEND_URL = import.meta.env.VITE_AUTH_URL || "http://localhost:5007";

export const AuthContextProvider: FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    function login(email: string, password: string) {
        const url = `${BACKEND_URL}/users/logIn`;

        setUser(null);

        fetch(url, {
            method: "POST",
            body: JSON.stringify({ email, password }),
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("could not login");
                }

                return res.json();
            })
            .then((name) => {
                return fetch(`${BACKEND_URL}/users/current`, {
                    credentials: "include",
                }).then((res) => res.json());
            })
            .then((userData) => {
                setUser({
                    id: userData.id,
                    name: userData.name,
                    email: userData.email,
                });
                setError("");
            })
            .catch((e) => {
                setError(e.message);
            });
    }

    function signup(name: string, email: string, password: string) {
        const url = `${BACKEND_URL}/users/register`;
        fetch(url, {
            method: "POST",
            body: JSON.stringify({ name, email, password }),
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(
                        `could not signup: ${res.status} ${res.statusText}`,
                    );
                }
                return res.json();
            })
            .then((json) => {
                return fetch(`${BACKEND_URL}/users/current`, {
                    credentials: "include",
                }).then((res) => res.json());
            })
            .then((userData) => {
                setUser({
                    id: userData.id,
                    name: userData.name,
                    email: userData.email,
                });
                setError("");
            })
            .catch((e) => {
                setError(e.message);
            });
    }

    function logout() {
        fetch(`${BACKEND_URL}/users/logout`, {
            credentials: "include",
        }).finally(() => {
            setUser(null);
            setError(null);
        });
    }

    return (
        <AuthContext value={{ user, authError: error, login, signup, logout }}>
            {children}
        </AuthContext>
    );
};
