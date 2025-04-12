import AuthLayout from "@/Components/Auth/AuthLayout";
import Login from "@/Components/Auth/Login";
import Register from "@/Components/Auth/Register";
import Home from "@/Components/Home";
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from "react-router";
import "./main.css";

const root = document.getElementById("root");

createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route index element={<Home />} />
      {/* <Route path="about" element={<About />} /> */}

      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      {/* <Route path="concerts">
    <Route index element={<ConcertsHome />} />
    <Route path=":city" element={<City />} />
    <Route path="trending" element={<Trending />} />
  </Route> */}
    </Routes>
  </BrowserRouter>
);