import "./App.css";
import { useState } from "react";

function User() {
  const [userId, setUserId] = useState("");
  const [roomUrl, setRoomUrl] = useState("");
  const [roomId, setRoomId] = useState("");

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
          let roomId = `${userId}-${randomNumber}`;
          setRoomId(roomId);
          setRoomUrl(`${window.location.origin}/vl/${roomId}`);
          const date = Date.now();
          fetch("https://192.168.0.59:1234/insert-room", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user: userId,
              roomId: `${roomId}`,
              date: date.toString(),
            }),
          });
        }}
      >
        Solicitar Videollamada
      </button>
      {roomUrl && (
        <div>
          <p>
            Para realizar la videollamada ingrese al siguiente enlace y aguarde
            a ser atendido/a:
          </p>

          <a href={`/vl/${roomId}`}>{userId !== "" ? roomUrl : ""}</a>
        </div>
      )}
    </div>
  );
}

export default User;
