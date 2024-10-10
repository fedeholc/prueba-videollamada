import { useNavigate } from "react-router-dom";
import "./App.css";
import { useState } from "react";

function App() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const roomUrl = `${window.location.origin}/vl/${roomId}`;

  return (
    <div className="app">
      <h1>Hola</h1>

      <label>Ingrese el nombre de la sala: </label>
      <input
        type="text"
        id="roomId"
        value={roomId}
        onChange={(e) => {
          setRoomId(e.target.value);
        }}
      />

      <div>
        Enlace a la sala:{" "}
        <a href={`/vl/${roomId}`}>{roomId !== "" ? roomUrl : ""}</a>
      </div>
      <button onClick={() => navigate(`/vl/${roomId}`)}>Ir a la sala</button>
    </div>
  );
}

export default App;
