import { useState, useCallback } from "react";

export default function useGeolocation() {
  const [coords, setCoords] = useState<{
    lat: number | null;
    long: number | null;
  }>({
    lat: null,
    long: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocalização não é suportada pelo seu navegador.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          long: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Falha ao obter localização. Permita o acesso.");
        setLoading(false);
      },
      {
        enableHighAccuracy: true, // Melhor precisão
        timeout: 10000, // 10s
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
