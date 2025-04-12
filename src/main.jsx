import { UserProvider } from "@/context/userContext";
import MyRouter from "@/MyRouter";
import { createRoot } from 'react-dom/client';
import "./main.css";

const root = document.getElementById("root");

createRoot(root).render(
  <UserProvider>
    <MyRouter />
  </UserProvider>
);