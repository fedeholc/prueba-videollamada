import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import * as React from "react";
import VideoLlamada from "./videollamada.jsx";
import ErrorPage from "./error-page.jsx";

import User from "./user.jsx";
import "./index.css";
import RoomList from "./room-list.jsx";

const router = createBrowserRouter([
  {
    path: "/user",
    element: <User />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/",
    element: (
      <div>
        <h1>Hola</h1>
        <a href="/user">Ingresar como Usuaria/o</a>
        <br></br>
        <a href="/room-list">Ingresar como Médica/o</a>
      </div>
    ),
  },
  {
    path: "/vl/:roomId",
    element: <VideoLlamada />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/room-list",
    element: <RoomList />,
    errorElement: <ErrorPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
