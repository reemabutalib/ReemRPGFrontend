import { characters } from "@/data/characters";
import { createContext, useContext, useState } from "react";

const UserContext = createContext({
  username: "",
  setUsername: (
    username
  ) => {
    console.log("Username updated:", username);
  },
  password: "",
  setPassword: (
    password
  ) => {
    console.log("password updated:", password);
  },
  selectedCharacter: {
    name: "",
    description: "",
    abilities: [],
  },
  setSelectedCharacter: ({
    name,
    description,
    abilities,
  }) => {
    console.log("Selected character updated:", {
      name,
      description,
      abilities,
    });
  },
  level: 1,
  setLevel: (level) => {
    console.log("Level updated:", level);
  },
});

export const useUser = () => useContext(UserContext);


export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState("Reem");
  const [password, setPassword] = useState("Password123");
  const [level, setLevel] = useState(1);
  const [selectedCharacter, setSelectedCharacter] = useState(
    characters.find(ch => ch.name === "Rogue")
  );

  const userInfo = {
    username,
    setUsername,
    password,
    setPassword,
    selectedCharacter,
    setSelectedCharacter,
    level,
    setLevel,
  }

  console.log("User Info:", userInfo);

  return (
    <UserContext.Provider
      value={userInfo}
    >
      {children}
    </UserContext.Provider>
  );
};