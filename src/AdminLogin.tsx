import { useState } from "react";
import { Field, FieldGroup, FieldLabel } from "./components/ui/field";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { useAuth } from "./contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const { login } = useAuth(); // Função de login do AuthContext
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!username || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    login(username, password)
      .then((res) => {
        setError(JSON.stringify(res));
        if (res) navigate("/");
      })
      .catch((err) => {
        if (err.response) setError(err.response.data.message);
        setError(JSON.stringify(err));
      });
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="w-80 space-y-10">
        <h1 className="text-xl font-bold text-center">Login de Admin</h1>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="username-input">Username:</FieldLabel>
            <Input
              id="username-input"
              placeholder="Digite seu username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password-input">Senha:</FieldLabel>
            <Input
              id="password-input"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
        </FieldGroup>
        <Button onClick={handleLogin}>Entrar</Button>
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Erro ao fazer login</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

export default AdminLogin;
