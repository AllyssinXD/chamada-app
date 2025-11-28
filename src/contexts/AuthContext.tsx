import React, { useContext, useEffect, useState } from "react";
import type { AdminProfile } from "@/models/UserModel";
import { getAdmin, loginAPI } from "@/services/AuthService";
import axios from "axios";

interface AuthContextInterface {
  user: AdminProfile | null;
  token: string | null;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextInterface>(
  {} as AuthContextInterface
);

export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AdminProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (username: string, password: string) => {
    logout();

    const response = await loginAPI(username, password);
    if (!response) return false;

    setToken(response.token);
    axios.defaults.headers["Authorization"] = "Bearer " + response.token;
    localStorage.setItem("token", response.token);
    await saveUserInfo();
    return true;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);

      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        setToken(storedToken);
        axios.defaults.headers.common["Authorization"] =
          "Bearer " + storedToken;

        const ok = await saveUserInfo();
        if (!ok) {
          logout();
        }
      }

      setIsLoading(false);
    };

    loadUser();
  }, []);

  const saveUserInfo = async () => {
    try {
      const response = await getAdmin();
      if (!response) return false;
      setUser(response);
      return true;
    } catch (err) {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
