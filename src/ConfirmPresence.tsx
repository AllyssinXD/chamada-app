import { useParams } from "react-router-dom";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
} from "./components/ui/field";
import { Input } from "./components/ui/input";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import type ChamadaModel from "./models/ChamadaModel";
import { getChamada } from "./services/GeneralService";
import { v4 } from "uuid";
import useGeolocation from "./hooks/useGeolocation";
import {
  Globe,
  Loader2Icon,
  MapPinCheck,
  MapPinOff,
  RefreshCcw,
  ShieldQuestion,
  Smartphone,
} from "lucide-react";

interface CustomInput {
  _id: string;
  type: string;
  label: string;
  placeholder: string;
}

export interface Dictionary<T> {
  [key: string]: T;
}

function ConfirmPresencePage() {
  const { loading, lat, long, requestLocation, error } = useGeolocation();
  const { idChamada } = useParams();

  const [firstLoad, setFirstLoad] = useState(true);
  const [id, setId] = useState(idChamada);
  const [uuid, setUuid] = useState<string | null>(null);
  const [chamada, setChamada] = useState<ChamadaModel>();
  const [nome, setNome] = useState("");
  const [ip, setIp] = useState("");
  const [displayError, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [customInputs, setCustomInputs] = useState([]);
  const [customInputValues, setCustomInputValues] = useState<
    Dictionary<string>
  >({});

  const confirmPresence = () => {
    if (!id) {
      setError("Id da chamada não foi provido");
      return;
    }
    if (!ip) {
      setError("Não foi possível obter o IP");
      return;
    }
    if (lat === null || long === null) {
      setError("Não foi possível obter sua localização");
      return;
    }

    axios
      .post(import.meta.env.VITE_API_URL + "/presence/" + id, {
        nome,
        ip,
        uuid,
        lag: lat,
        long,
        customInputs: customInputValues,
      })
      .then(() => {
        setError("");
        setSuccess(true);
      })
      .catch((err) => {
        console.log(err);
        setError(err.response.data.message);
      });
  };

  const fetchChamadaDetails = (id?: string) => {
    getChamada(id || idChamada!).then((chamada) => {
      setChamada(chamada);
      setCustomInputs(chamada.customInputs);
    });
  };

  useEffect(() => {
    if (!localStorage.getItem("uuid")) {
      const id = v4();
      localStorage.setItem("uuid", id);
    }

    if (localStorage.getItem("first")) {
      setFirstLoad(false);
      localStorage.setItem("first", "true");
    }

    setUuid(localStorage.getItem("uuid"));
    // Fetch public IP from ipify API
    const fetchIP = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setIp(data.ip);
      } catch (err) {
        setError("Falha ao obter o endereço IP");
        console.error(err);
      }
    };

    fetchIP();
    requestLocation();
    if (idChamada) fetchChamadaDetails();
  }, []);

  useEffect(() => {
    if (error) setError(error);
  }, [error]);

  useEffect(() => {
    if (lat && long) {
      if (lat && long) setFirstLoad(false);
      setError("");
    }
  }, [lat, long]);

  if (loading || !chamada)
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        {/*Carregando Geolocalização*/}
        <Loader2Icon className="animate-spin" />
      </div>
    );
  else if (firstLoad)
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-card border shadow-md rounded-2xl p-10 space-y-8">
          {/* Ícone + Título */}
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <MapPinCheck className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-semibold">
              Oi! Precisamos da sua{" "}
              <span className="text-green-500">localização</span>
            </h1>
          </div>

          {/* Texto explicativo */}
          <p className="text-muted-foreground leading-relaxed text-center">
            É <span className="font-bold text-red-500">muito importante</span>{" "}
            que você permita a coleta da sua localização. Quando o navegador
            abrir a <span className="font-medium">tela de permissão</span>,
            clique em <strong>Permitir</strong> em todas as opções.
          </p>

          {/* Botão */}
          <Button
            className="w-full h-12 text-base gap-2"
            onClick={() => {
              requestLocation();
              setFirstLoad(false);
            }}
          >
            <MapPinCheck className="w-5 h-5" />
            Permitir Coleta de Localização
          </Button>
        </div>
      </div>
    );
  else if (!lat || !long)
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg rounded-2xl border bg-card shadow-md p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <MapPinOff className="w-8 h-8 text-red-500" />
            <h1 className="text-xl font-semibold">Localização não ativa</h1>
          </div>

          <p className="text-muted-foreground">
            Parece que não conseguimos acessar sua localização. Siga os passos
            abaixo para corrigir:
          </p>

          {/* Tutorial */}
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <ShieldQuestion className="w-6 h-6 text-primary shrink-0" />
              <p>
                <strong>Permita o acesso à localização</strong> no aviso do
                navegador. Se você negou antes, precisa limpar as permissões.
              </p>
            </li>

            <li className="flex items-start gap-3">
              <Globe className="w-6 h-6 text-primary shrink-0" />
              <p>
                Verifique se o <strong>HTTPS</strong> está ativo. A API de
                geolocalização exige conexão segura.
              </p>
            </li>

            <li className="flex items-start gap-3">
              <Smartphone className="w-6 h-6 text-primary shrink-0" />
              <p>
                No celular, garanta que o <strong>GPS</strong> esteja ligado e
                que seu navegador tenha permissão no sistema.
              </p>
            </li>
          </ul>

          {/* Botão de tentativa */}
          <Button
            className="w-full gap-2"
            onClick={() => {
              requestLocation();
            }}
          >
            <RefreshCcw className="w-4 h-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  else
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="w-80 space-y-10">
          <div className="border p-4 rounded-md ">
            <p className="text-md">
              App feito por{" "}
              <a
                className="text-green-500 underline"
                href="https://instagram.com/alisson_ally_"
              >
                Alisson Santos Silva
              </a>
            </p>
            <p>Por favor, contatar ao lidar com problemas</p>
          </div>
          <h1 className="text-xl">{chamada?.nome}</h1>
          {!success && (
            <>
              <FieldLegend>Confirme sua presença:</FieldLegend>
              {!idChamada && (
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="chamada-id-input">
                      Id da Chamada
                    </FieldLabel>
                    <Input
                      id="chamada-id-input"
                      placeholder="Código esquisito aqui"
                      value={id}
                      onChange={(e) => {
                        setId(e.target.value);
                        fetchChamadaDetails(e.target.value);
                      }}
                      required
                    />
                  </Field>
                </FieldGroup>
              )}
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="nome-input">Seu nome:</FieldLabel>
                  <Input
                    id="nome-input"
                    placeholder="Seu nome aqui"
                    value={nome}
                    onChange={(e) => {
                      setNome(e.target.value);
                    }}
                    required
                  />
                </Field>
                {customInputs.map((input: CustomInput) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor="nome-input">
                        {input.label}
                      </FieldLabel>
                      <Input
                        id={input._id}
                        placeholder={input.placeholder}
                        value={customInputValues[input._id]}
                        onChange={(e) => {
                          setCustomInputValues((prev) => {
                            prev[input._id] = e.target.value;
                            return prev;
                          });
                        }}
                        required
                      />
                    </Field>
                  );
                })}
              </FieldGroup>
              <FieldGroup>
                <Button onClick={confirmPresence}>Confirmar Presença</Button>
              </FieldGroup>
            </>
          )}
          {success && (
            <Alert variant="default">
              <AlertTitle>Você confirmou sua presença com sucesso.</AlertTitle>
              <AlertDescription>
                <p>Você não poderá confirmar presença para outras pessoas.</p>
              </AlertDescription>
            </Alert>
          )}
          {displayError && (
            <Alert variant="destructive">
              <AlertTitle>Erro ao confirmar presença.</AlertTitle>
              <AlertDescription>
                <p>{displayError}</p>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
}

export default ConfirmPresencePage;
