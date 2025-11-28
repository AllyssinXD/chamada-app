import { useState, useCallback } from "react";

export default function useGeolocation() {
  const [coords, setCoords] = useState<{
    lat: number | null;
    long: number | null;
  }>({ lat: null, long: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Seu navegador não suporta geolocalização.");
      return;
    }

    setLoading(true);
    setError(null);

    // Timeout alternativo (seguro)
    const manualTimeout = setTimeout(() => {
      setError("Tempo esgotado. Tente se mover para um local aberto.");
      setLoading(false);
    }, 20000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(manualTimeout);

        console.log(position);

        setCoords({
          lat: position.coords.latitude,
          long: position.coords.longitude,
        });

        setLoading(false);
      },
      (err) => {
        clearTimeout(manualTimeout);

        if (err.code === 1) setError("Permissão negada.");
        else if (err.code === 2)
          setError("Não foi possível obter sua localização.");
        else if (err.code === 3) setError("Tempo esgotado.");

        setLoading(false);
      },
      {
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, []);

  return {
    ...coords,
    loading,
    error,
    requestLocation,
  };
}
