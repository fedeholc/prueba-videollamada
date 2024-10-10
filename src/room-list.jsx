import { useEffect, useState } from "react";

import "./index.css";

export default function RoomList() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    function getRooms() {
      fetch("https://192.168.0.59:1234/get-rooms")
        .then((res) => {
          if (!res.ok) {
            throw new Error("Error al obtener las salas");
          }
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setRooms(data); // Solo actualizamos rooms si es un array
          } else {
            setRooms([]); // Si no es un array, lo ponemos como vacío
          }
        })
        .catch((error) => {
          console.error("Error en la llamada a la API:", error);
          setRooms([]); // En caso de error, establecemos rooms como un array vacío
        });
    }

    getRooms();
    const interval = setInterval(getRooms, 10000);

    return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
  }, []);

  return (
    <div>
      <h1>Llamadas en espera</h1>

      <div>
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <div key={room.roomId}>
              <a href={`/vl/${room.roomId}`}>{room.roomId}</a>
            </div>
          ))
        ) : (
          <p>No hay salas disponibles.</p>
        )}
      </div>
    </div>
  );
}
