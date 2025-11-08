const API_BASE = import.meta.env.VITE_API_URL;

interface Player {
  id: number;
  name: string;
  initial_life: number;
}
export async function fetchPlayers(lobbyId:string | null): Promise<Player[]> {
    if (!lobbyId) throw new Error("Missing lobby code");

    try{
        const res = await fetch(`${API_BASE}/api/lobbies/${lobbyId}/players`);
        const data = await res.json();
        if (!res.ok || !data.success) {
            console.error("Failed to fetch Players:", data.error || res.statusText)
            return[];
        }
        return data.players as Player[];
    } catch (err) {
      console.error("Error fetching players", err);
      return[];  
    }
}