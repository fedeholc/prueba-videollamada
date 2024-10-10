import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import * as React from "react";
import VideoLlamada from "./videollamada.jsx";
import ErrorPage from "./error-page.jsx";

import App from "./App.jsx";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/vl/:roomId",
    element: <VideoLlamada />,
    errorElement: <ErrorPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
