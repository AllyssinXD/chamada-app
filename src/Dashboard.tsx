import { useEffect, useState } from "react";
import useProtectedRoute from "./hooks/useProtectedRoute";
import type ChamadaModel from "./models/ChamadaModel";
import { createChamada, getAllChamadas } from "./services/GeneralService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { useNavigate } from "react-router-dom";
import { Button } from "./components/ui/button";

function Dashboard() {
  const navigate = useNavigate();
  useProtectedRoute();

  const [chamadas, setChamadas] = useState<ChamadaModel[]>([]);
  const [lag, setLag] = useState(0);
  const [long, setLong] = useState(0);

  const [chamadasTablePage, setChamadasTablePage] = useState(0);

  const handleCriarChamada = async () => {
    fetchLocation();
    const newChamada = await createChamada(lag, long);
    navigate("/chamada/" + newChamada._id);
  };

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position);
        console.log(position);
        setLag(position.coords.latitude);
        setLong(position.coords.longitude);
      },
      (err) => {
        console.error(err);
      }
    );
  };

  useEffect(() => {
    getAllChamadas().then((res) => {
      if (!res) return;
      setChamadas(res);
      console.log(res);
    });
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col justify-center gap-3 p-10">
      <p className="font-bold">Todas as Chamadas</p>
      <div className="flex justify-center items-center">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data Inicio</TableHead>
              <TableHead>Data Fim</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Tolerancia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chamadas
              .filter(
                (_, i) =>
                  i + 1 > chamadasTablePage * 10 &&
                  i + 1 < chamadasTablePage * 10 + 10
              )
              .map((item) => (
                <TableRow
                  key={item._id}
                  onClick={() => {
                    navigate("/chamada/" + item._id);
                  }}
                >
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell>{item.ativa ? "Ativa" : "Desabilitada"}</TableCell>
                  <TableCell>
                    {new Date(item.dataInicio).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(item.dataFim).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    Lag: {item.lag} Long: {item.long}
                  </TableCell>
                  <TableCell>{item.toleranceMeters}m</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex gap-1">
        {Array.from(
          { length: Math.ceil(chamadas.length / 10) },
          (_, i) => i + 1
        ).map((val, i) => (
          <Button
            size={"sm"}
            variant={chamadasTablePage == i ? "default" : "secondary"}
            onClick={() => {
              setChamadasTablePage(i);
            }}
          >
            {val}
          </Button>
        ))}
      </div>
      <Button onClick={handleCriarChamada}>Criar Chamada</Button>
    </div>
  );
}

export default Dashboard;
