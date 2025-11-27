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

  const saveUserInfo = async () => {
    const response = await getAdmin();
    if (!response) return;
    setUser(response);
  };

  const login = async (username: string, password: string) => {
    logout();

    const response = await loginAPI(username, password);
    if (!response) return false;

    setToken(response.token);
    axios.defaults.headers["Authorization"] = "Bearer " + response.token;
    await saveUserInfo();
    return true;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    axios.defaults.headers.delete["Authorization"];
  };

  useEffect(() => {
    setIsLoading(true);
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers["Authorization"] = "Bearer " + storedToken;
      saveUserInfo().then(() => {
        setIsLoading(false);
        return;
      });
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
