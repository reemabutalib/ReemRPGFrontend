import AuthLayout from "@/Components/Auth/AuthLayout";
import Login from "@/Components/Auth/Login";
import Register from "@/Components/Auth/Register";
import Characters from "@/Components/Characters";
import Dashboard from "@/Components/Dashboard";
import Home from "@/Components/Home";
import Quests from "@/Components/Quests";
import { BrowserRouter, Route, Routes } from "react-router";

export default function MyRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route index element={<Home />} />
                {/* <Route path="about" element={<About />} /> */}

                <Route element={<AuthLayout />}>
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                </Route>

                <Route path="/characters" element={<Characters />} />
                <Route path="/quests" element={<Quests />} />
                <Route path="/dashboard" element={<Dashboard />} />


                {/* <Route path="concerts">
        <Route index element={<ConcertsHome />} />
        <Route path=":city" element={<City />} />
        <Route path="trending" element={<Trending />} />
      </Route> */}
            </Routes>
        </BrowserRouter>
    )
}
