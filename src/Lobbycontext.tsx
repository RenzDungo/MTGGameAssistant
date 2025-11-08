import React, { createContext, useContext, useState, useEffect } from "react";

interface LobbyContextType {
  lobbyId: string | null;
  setLobbyId: (id: string | null) => void;
  lobbyCode: string | null;
  setLobbyCode: (code: string | null) => void;
}

// Default values
const LobbyContext = createContext<LobbyContextType>({
  lobbyId: null,
  setLobbyId: () => {},
  lobbyCode: null,
  setLobbyCode: () => {},
});

export const LobbyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lobbyId, setLobbyId] = useState<string | null>(null);
  const [lobbyCode, setLobbyCode] = useState<string | null>(null);

  // 🔁 Load from LocalStorage on startup
  useEffect(() => {
    const savedId = localStorage.getItem("lobbyId");
    const savedCode = localStorage.getItem("lobbyCode");
    if (savedId) setLobbyId(savedId);
    if (savedCode) setLobbyCode(savedCode);
  }, []);

  // 💾 Save to LocalStorage whenever values change
  useEffect(() => {
    if (lobbyId) localStorage.setItem("lobbyId", lobbyId);
    if (lobbyCode) localStorage.setItem("lobbyCode", lobbyCode);
  }, [lobbyId, lobbyCode]);

  return (
    <LobbyContext.Provider value={{ lobbyId, setLobbyId, lobbyCode, setLobbyCode }}>
      {children}
    </LobbyContext.Provider>
  );
};

// Custom hook to use in components
export const useLobby = () => useContext(LobbyContext);
