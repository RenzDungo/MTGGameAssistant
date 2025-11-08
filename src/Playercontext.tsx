import React, { createContext, useContext, useEffect, useState } from "react";

interface PlayerData {
  id: number;
  name: string;
  lobbyId: string;
}

interface PlayerContextType {
  player: PlayerData | null;
  setPlayer: (player: PlayerData | null) => void;
  logout: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [player, setPlayer] = useState<PlayerData | null>(null);

  // Load from localStorage when app starts
  useEffect(() => {
    const stored = localStorage.getItem("playerData");
    if (stored) {
      setPlayer(JSON.parse(stored));
    }
  }, []);

  // Sync any change back to localStorage
  useEffect(() => {
    if (player) {
      localStorage.setItem("playerData", JSON.stringify(player));
    } else {
      localStorage.removeItem("playerData");
    }
  }, [player]);

  const logout = () => {
    setPlayer(null);
    localStorage.removeItem("playerData");
  };

  return (
    <PlayerContext.Provider value={{ player, setPlayer, logout }}>
      {children}
    </PlayerContext.Provider>
  );
};

// Custom hook to use it easily
export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within PlayerProvider");
  return context;
}
