import { useCallback, useEffect, useState } from "react";
import type ChamadaModel from "./models/ChamadaModel";
import {
  addCustomInput,
  deleteCustomInput,
  getAllPresencesFromChamada,
  getChamada,
  updateChamada,
  type CustomInputs,
  type GetPresencesResponse,
} from "./services/GeneralService";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import useProtectedRoute from "./hooks/useProtectedRoute";
import { Input } from "./components/ui/input";
import { ArrowDownIcon, LinkIcon, XIcon } from "lucide-react";
import { Button } from "./components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";
import { Calendar } from "./components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { Field, FieldLabel } from "./components/ui/field";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

function EditChamada() {
  useProtectedRoute();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [editing, setEditing] = useState<{ [key: string]: boolean }>({});
  const [chamada, setChamada] = useState<ChamadaModel | null>(null);
  const [customInputs, setCustomInputs] = useState<CustomInputs[]>([]);
  const [presences, setPresences] = useState<GetPresencesResponse | null>(null);
  const { id } = useParams();

  // Função para alternar o modo de edição
  const toggleEdit = (key: string) => {
    setEditing((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Função para atualizar os valores da chamada
  const handleChange = (key: string, value: string) => {
    setChamada((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  // Função para alternar o estado de "ativa"
  const toggleChamadaStatus = async () => {
    if (!id || !chamada) return;

    const newChamada = chamada;
    newChamada.ativa = !newChamada.ativa;
    setChamada(newChamada);

    saveAllChanges();
  };

  const handleAddInput = async () => {
    if (!id) return;
    const newInput = await addCustomInput(id);
    setCustomInputs((prev) => [...prev, newInput]);
    toggleEdit("customInputs");
    handleLoadChamada();
  };

  const handleDeleteInput = async (id: string) => {
    if (!id) return;
    const newCustomInputs = await deleteCustomInput(id);
    console.log(newCustomInputs);
    setCustomInputs(newCustomInputs);
    handleLoadChamada();
  };

  // Função para salvar alterações no backend
  /*const saveChanges = async (key: string, value: string | Date) => {
    if (!id || !chamada) return;
    try {
      //await updateChamada(id, { [key]: value });
      toggleEdit(key); // Sair do modo de edição
    } catch (err) {
      console.error("Erro ao salvar alterações:", err);
    }
  };*/

  // Função para salvar alterações no backend
  const saveAllChanges = async () => {
    if (!id || !chamada) return;
    try {
      setEditing({}); // Sair do modo de edição
      console.log("chamada antes", chamada);
      const newChamada = await updateChamada(chamada, customInputs);
      console.log("chamada depois", newChamada);
      setChamada(newChamada);
      handleLoadChamada();
    } catch (err) {
      handleLoadChamada();
      console.error("Erro ao salvar alterações:", err);
    }
  };

  const updateTime = (dateString: string, timeString: string): string => {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    const date = new Date(dateString);
    date.setHours(hours, minutes, seconds || 0); // Atualiza horas, minutos e segundos
    return date.toISOString(); // Retorna a data atualizada no formato ISO
  };

  // Função para obter a data de início
  const getStartDate = useCallback(() => {
    if (!chamada) return new Date();
    return new Date(chamada.dataInicio);
  }, [chamada?.dataInicio]);

  // Função para obter a data de fim
  const getEndDate = useCallback(() => {
    if (!chamada) return new Date();
    return new Date(chamada.dataFim);
  }, [chamada?.dataFim]);

  const handleLoadChamada = () => {
    if (!id) return;
    const fetchChamada = async () => {
      const fetchedChamada = await getChamada(id);
      setChamada(fetchedChamada);
    };
    const fetchPresences = async () => {
      const fetchedPresences = await getAllPresencesFromChamada(id);
      setPresences(fetchedPresences);
      setCustomInputs(fetchedPresences.customInputs);
      console.log(fetchedPresences);
    };

    fetchChamada();
    fetchPresences();
  };

  // Função para atualizar a posição do marcador no mapa
  const handleMarkerDragEnd = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    handleChange("lag", lat.toString());
    handleChange("long", lng.toString());
    toggleEdit("lag");
    toggleEdit("long");
  };

  // Carregar os dados da chamada
  useEffect(() => {
    handleLoadChamada();
  }, [id]);

  return (
    <div className="flex flex-col md:flex-row justify-center gap-10 items-start p-10">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            {/* Edição do nome */}
            {editing["nome"] ? (
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Nome da chamada"
                  value={chamada?.nome || ""}
                  onChange={(e) => handleChange("nome", e.target.value)}
                />
              </div>
            ) : (
              <CardTitle
                onClick={() => {
                  toggleEdit("nome");
                }}
                className="cursor-pointer"
              >
                {chamada?.nome || "Sem nome"}
              </CardTitle>
            )}
            {/* Botão para ativar/desativar chamada */}
            <Button
              variant={chamada?.ativa ? "outline" : "destructive"}
              onClick={toggleChamadaStatus}
            >
              {chamada?.ativa ? "Ativa" : "Desabilitada"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Edição de data e hora */}
          <div className="p-2 border rounded-md space-y-4">
            <p className="font-bold">Duração da chamada</p>
            <div className="fmd:flex md:space-y-0 space-y-3  justify-between">
              <div className="space-y-2">
                <p>Início</p>
                <p className="flex justify-between items-center gap-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button size={"sm"} variant={"secondary"}>
                        {getStartDate().toLocaleDateString()} <ArrowDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={getStartDate()}
                        onSelect={(date) => {
                          toggleEdit("dataInicio");
                          handleChange(
                            "dataInicio",
                            date?.toJSON() || getStartDate().toJSON()
                          );
                        }}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    id="time-picker"
                    step="1"
                    value={new Date(
                      chamada?.dataInicio || ""
                    ).toLocaleTimeString("en-US", { hour12: false })}
                    onChange={(e) => {
                      toggleEdit("dataInicio");
                      handleChange(
                        "dataInicio",
                        updateTime(chamada?.dataInicio || "", e.target.value)
                      );
                    }}
                    className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                </p>
              </div>
              <div className="space-y-2">
                <p>Fim</p>
                <p className="flex justify-between items-center gap-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button size={"sm"} variant={"secondary"}>
                        {getEndDate().toLocaleDateString()} <ArrowDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={getEndDate()}
                        onSelect={(date) => {
                          toggleEdit("dataFim");
                          handleChange(
                            "dataFim",
                            date?.toJSON() || getEndDate().toJSON()
                          );
                        }}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    id="time-picker"
                    step="1"
                    value={new Date(chamada?.dataFim || "").toLocaleTimeString(
                      "en-US",
                      { hour12: false }
                    )}
                    onChange={(e) => {
                      handleChange(
                        "dataFim",
                        updateTime(chamada?.dataFim || "", e.target.value)
                      );
                      toggleEdit("dataFim");
                    }}
                    className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                </p>
              </div>
            </div>
          </div>
          <div className="p-2 border rounded-md space-y-4">
            <p className="font-bold">Campos customizados</p>
            {customInputs.map((input) => {
              return (
                <div className="flex gap-3 justify-between items-end">
                  <Field>
                    <FieldLabel htmlFor={input._id + "-label-input"}>
                      Etiqueta:
                    </FieldLabel>
                    <Input
                      id={input._id + "-label-input"}
                      placeholder="Etiqueta do seu input personalizado"
                      value={input.label}
                      onChange={(e) => {
                        input.label = e.target.value;
                        const newInputs = customInputs.map((i) =>
                          i._id == input._id ? input : i
                        );
                        setCustomInputs(newInputs);
                      }}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={input._id + "-type-input"}>
                      Tipo:
                    </FieldLabel>
                    <Input
                      id={input._id + "-type-input"}
                      placeholder="Tipo do seu Input"
                      value={input.type}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={input._id + "-placeholder-input"}>
                      Placeholder:
                    </FieldLabel>
                    <Input
                      id={input._id + "-placeholder-input"}
                      placeholder="Placeholder do seu Input"
                      value={input.placeholder}
                      onChange={(e) => {
                        input.placeholder = e.target.value;
                        const newInputs = customInputs.map((i) =>
                          i._id == input._id ? input : i
                        );
                        setCustomInputs(newInputs);
                      }}
                    />
                  </Field>
                  <Button
                    variant={"destructive"}
                    onClick={() => handleDeleteInput(input._id)}
                  >
                    <XIcon />
                  </Button>
                </div>
              );
            })}
            <div className="space-x-3">
              <Button variant={"secondary"} onClick={handleAddInput}>
                Adicionar um campo
              </Button>
            </div>
          </div>
          <div className="border space-y-4 p-2 rounded-md items-end gap-3">
            <p className="font-bold">Localização</p>
            <div className="min-h-64 w-full overflow-hidden border rounded-md">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{
                    display: "block",
                    position: "relative",
                    width: "100%",
                    height: "300px",
                  }}
                  center={{
                    lat: chamada?.lag || -23.55052,
                    lng: chamada?.long || -46.633308,
                  }}
                  zoom={15}
                >
                  <Marker
                    position={{
                      lat: chamada?.lag || -23.55052,
                      lng: chamada?.long || -46.633308,
                    }}
                    draggable={true}
                    onDragEnd={handleMarkerDragEnd}
                  />
                </GoogleMap>
              ) : (
                <p>Carregando mapa...</p>
              )}
            </div>
            <div className="flex gap-3">
              <Field>
                <FieldLabel htmlFor={"lagitude-input"}>Lagitude:</FieldLabel>
                <Input
                  id={"lagitude-input"}
                  className="min-w-32"
                  placeholder="1000"
                  type="number"
                  min={100}
                  max={5000}
                  value={chamada?.lag}
                  onChange={(e) => {
                    handleChange("lag", e.target.value);
                    ~toggleEdit("lag");
                  }}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={"lagitude-input"}>Lagitude:</FieldLabel>
                <Input
                  id={"lagitude-input"}
                  className="min-w-32"
                  placeholder="1000"
                  type="number"
                  min={100}
                  max={5000}
                  value={chamada?.long}
                  onChange={(e) => {
                    handleChange("long", e.target.value);
                    toggleEdit("long");
                  }}
                />
              </Field>
            </div>
            <FieldLabel htmlFor={"tolarance-input"}>Tolerancia:</FieldLabel>
            <div className="flex items-end gap-3">
              <Input
                id={"tolarance-input"}
                className="min-w-20 max-w-24"
                placeholder="1000"
                type="number"
                min={100}
                max={5000}
                value={chamada?.toleranceMeters}
                onChange={(e) => {
                  handleChange("toleranceMeters", e.target.value);
                }}
              />
              <p>m</p>
            </div>
          </div>
          <div className="space-x-3">
            {Object.keys(editing).length > 0 && (
              <>
                <Button
                  onClick={() => {
                    saveAllChanges();
                  }}
                >
                  Salvar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    saveAllChanges();
                  }}
                >
                  Cancelar
                </Button>
              </>
            )}
            <Button
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(
                  import.meta.env.VITE_WEBSITE_URL + "/confirmar-presenca/" + id
                );
              }}
            >
              Copiar Link
              <LinkIcon />
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Presenças</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Envio</TableHead>
                {presences?.customInputs.map((input) => {
                  return <TableHead>{input.label}</TableHead>;
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {presences?.populatedPresences.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell>
                    {new Date(item.envio).toLocaleDateString() +
                      " " +
                      new Date(item.envio).toLocaleTimeString()}
                  </TableCell>
                  {presences.customInputs.map((customInput) => (
                    <TableCell>{item.customValues[customInput._id]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default EditChamada;
