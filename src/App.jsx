import { useNavigate } from "react-router-dom";
import "./App.css";
import { useState } from "react";

function App() {
  const [userId, setUserId] = useState("");
  const [roomUrl, setRoomUrl] = useState("");
  const navigate = useNavigate();

  //random 7 digitos

  return (
    <div className="app">
      <h1>Hola</h1>

      <label>Ingrese su número/código de identificación</label>
      <input
        type="text"
        id="roomId"
        value={userId}
        onChange={(e) => {
          setUserId(e.target.value);
        }}
      />
      <button
        onClick={() => {
          if (userId === "") {
            alert("Debe ingresar un número/código de identificación");
            return;
          }
          const randomNumber = Math.floor(1000000 + Math.random() * 9000000);
          setRoomUrl(`${window.location.origin}/vl/${userId}-${randomNumber}`);
        }}
      >
        Solicitar Videollamada
      </button>
      {roomUrl && (
        <div>
          <p>
            {" "}
            Para realizar la videollamada ingrese al siguiente enlace y aguarde
            a ser atendido/a:{" "}
          </p>

          <a href={`/vl/${userId}`}>{userId !== "" ? roomUrl : ""}</a>
        </div>
      )}
      {/* 
      <button onClick={() => navigate(`/vl/${userId}`)}>Ir a la sala</button> */}
    </div>
  );
}

export default App;
