import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ConfirmPresencePage from "./ConfirmPresence.tsx";
import AdminLogin from "./AdminLogin.tsx";
import { AuthContextProvider } from "./contexts/AuthContext.tsx";
import Dashboard from "./Dashboard.tsx";
import EditChamada from "./EditChamada.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark">
      <BrowserRouter>
        <AuthContextProvider>
          <Routes>
            <Route path="/" element={<Dashboard />} />{" "}
            {/* Dashboard is now the index */}
            <Route path="login" element={<AdminLogin />} />
            <Route path="chamada/:id" element={<EditChamada />} />
            <Route path="confirmar-presenca">
              <Route index element={<ConfirmPresencePage />} />
              <Route path=":idChamada" element={<ConfirmPresencePage />} />
            </Route>
          </Routes>
        </AuthContextProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
