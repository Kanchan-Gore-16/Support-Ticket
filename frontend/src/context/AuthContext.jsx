// src/context/AuthContext.jsx
import { createContext, useState } from "react";
import api from "../api/client";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch {
            return null;
        }
    });

    const login = async (email, password) => {
        const res = await api.post("/auth/login", { email, password });
        const { token: jwt, user } = res.data;

        setToken(jwt);
        setUser(user);
        localStorage.setItem("token", jwt);
        localStorage.setItem("user", JSON.stringify(user));

        return user;
    };

    const register = async (name, email, password) => {
        const res = await api.post("/auth/register", { name, email, password });
        const { token: jwt, user } = res.data;

        setToken(jwt);
        setUser(user);
        localStorage.setItem("token", jwt);
        localStorage.setItem("user", JSON.stringify(user));

        return user;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ token, user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
