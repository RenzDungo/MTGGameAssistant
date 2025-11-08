const API_BASE = import.meta.env.VITE_API_URL;

export async function getLobbyIdByCode(code: string | null): Promise<number | null> {
  try {
    const res = await fetch(`${API_BASE}/api/lobbies/${code}`);

    if (!res.ok) {
      console.error(`❌ Failed to fetch lobby (code: ${code}). Status: ${res.status}`);
      return null;
    }

    const data = await res.json();

    if (!data.id) {
      console.error(`❌ Lobby found but no numeric ID present for code: ${code}`);
      return null;
    }

    return data.id;
  } catch (err) {
    console.error("❌ Error fetching lobby by code:", err);
    return null;
  }
}