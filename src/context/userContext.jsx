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
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState("Reem");
  const [password, setPassword] = useState("Password123");
  const [selectedCharacter, setSelectedCharacter] = useState({
    name: "Rogue", description: "A stealthy and agile character.",
    abilities: ["Backstab", "Pickpocket", "Shadow Step"]
  });

  const userInfo = {
    username,
    setUsername,
    password,
    setPassword,
    selectedCharacter,
    setSelectedCharacter,
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