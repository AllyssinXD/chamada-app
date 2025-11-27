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
import {v4} from "uuid"

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
  const { idChamada } = useParams();

  const [id, setId] = useState(idChamada);
  const [uuid, setUuid] = useState<string | null>(null);
  const [chamada, setChamada] = useState<ChamadaModel>();
  const [nome, setNome] = useState("");
  const [ip, setIp] = useState("");
  const [lag, setLag] = useState<number | null>(null); // Latitude
  const [long, setLong] = useState<number | null>(null); // Longitude
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [customInputs, setCustomInputs] = useState([]);
  const [customInputValues, setCustomInputValues] = useState<
    Dictionary<string>
  >({});

  const confirmPresence = () => {
    fetchLocation();
    if (!id) {
      setError("Id da chamada não foi provido");
      return;
    }
    if (!ip) {
      setError("Não foi possível obter o IP");
      return;
    }
    if (lag === null || long === null) {
      setError("Não foi possível obter sua localização");
      return;
    }

    axios
      .post(import.meta.env.VITE_API_URL + "/presence/" + id, {
        nome,
        ip,
        uuid,
        lag,
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

  // Get user's location using Geolocation API
  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocalização não é suportada pelo seu navegador");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position);
        setLag(position.coords.latitude);
        setLong(position.coords.longitude);
      },
      (err) => {
        console.error(err);
        setError("Falha ao obter localização. Permita o acesso à localização.");
      }
    );
  };

  const fetchChamadaDetails = (id?: string) => {
    getChamada(id || idChamada!).then((chamada) => {
      setChamada(chamada);
      setCustomInputs(chamada.customInputs);
    });
  };

  useEffect(() => {
    if(!localStorage.getItem("uuid")) {
      const id = v4()
      localStorage.setItem("uuid", id)
    }
    
    setUuid(localStorage.getItem("uuid"))
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
    fetchLocation();
    if (idChamada) fetchChamadaDetails();

    console.log(lag, long);
  }, []);

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div className="w-80 space-y-10">
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
                    <FieldLabel htmlFor="nome-input">{input.label}</FieldLabel>
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
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Erro ao confirmar presença.</AlertTitle>
            <AlertDescription>
              <p>{error}</p>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

export default ConfirmPresencePage;
