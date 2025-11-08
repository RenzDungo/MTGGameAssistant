import { useLobby } from "../Lobbycontext";
import React, { useEffect, useState } from "react";
import "../styles/Life.css"
import { usePlayer } from "../Playercontext";
import { getLobbyIdByCode } from "../utils/getLobbyIdbyCode";
const API_BASE = import.meta.env.VITE_API_URL;

interface Player {
  id: number;
  name: string;
  initial_life: number;
}

export default function LifePage() {
    const { lobbyId } = useLobby();
    const {player} =usePlayer();
    const [players, setPlayers] = useState<Player[]>([]);
    const [lifeTotals, setLifeTotals] = useState<{ [playerId: number]: number }>({});
     //Damage Players function
    const handleDamage = async(targetId: number) => {
      if (!player) {
        console.warn("spectator can't deal damage")
        return;
      }
      const actorId = player.id;
      const delta = -1;
      const lobbykey = await getLobbyIdByCode(lobbyId);
      try {
        const res = await fetch(`${API_BASE}/api/events`, {method: "POST",
          headers:{"Content-Type": "application/json"},
          body: JSON.stringify({
          lobbyId: lobbykey,
          actorId,
          targetId,
          delta,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) console.log("✅ Event added:", data);
        else console.error("Failed to add event")
      } catch(err){
        console.error("Servor Error adding event:", err);
      }
    }
     //Heal Players function
    const handleHeal = async(targetId: number) => {
      if (!player) {
        console.warn("spectator can't deal heal")
        return;
      }
      const actorId = player.id;
      const delta = 1;
      const lobbykey = await getLobbyIdByCode(lobbyId);
      try {
        const res = await fetch(`${API_BASE}/api/events`, {method: "POST",
          headers:{"Content-Type": "application/json"},
          body: JSON.stringify({
          lobbyId: lobbykey,
          actorId,
          targetId,
          delta,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) console.log("✅ Event added:", data);
        else console.error("Failed to add event")
      } catch(err){
        console.error("Servor Error adding event:", err);
      }
    }

    //Current Life Function
    async function fetchLifeTotals(lobbyId: string, players: any[]) {
      try {
        const lobbykey = await getLobbyIdByCode(lobbyId);
        const results = await Promise.all(
          players.map(async (p) => {
            const res = await fetch(`http://192.168.1.179:5300/api/events/life/${lobbykey}/${p.id}`);
            const data = await res.json();
            return { id: p.id, life: data.life ?? 40 };
          })
        );
        const lifeMap: { [key: number]: number } = {};
        results.forEach(({ id, life }) => (lifeMap[id] = life));
        setLifeTotals(lifeMap);
      } catch (err) {
        console.error("Error fetching life totals:", err);
      }
    }

     // --- Fetch players when lobby changes ---
    useEffect(() => {
      if (!lobbyId) return;
      const fetchPlayers = async () => {
        try {
          const res = await fetch(`${API_BASE}/api/lobbies/${lobbyId}/players`);
          const data = await res.json();
          if (data.success) setPlayers(data.players);
        } catch (err) {
          console.error("Error fetching players:", err);
        }
      };
      fetchPlayers();
    }, [lobbyId]);

    // --- Fetch life totals continuously ---
    useEffect(() => {
      if (!lobbyId || players.length === 0) return;

      async function fetchLifeTotals() {
        try {
          const lobbykey = await getLobbyIdByCode(lobbyId);
          const results = await Promise.all(
            players.map(async (p) => {
              const res = await fetch(`${API_BASE}/api/events/life/${lobbykey}/${p.id}`);
              const data = await res.json();
              return { id: p.id, life: data.life ?? 40 };
            })
          );
          const lifeMap: { [key: number]: number } = {};
          results.forEach(({ id, life }) => (lifeMap[id] = life));
          setLifeTotals(lifeMap);
        } catch (err) {
          console.error("Error fetching life totals:", err);
        }
      }

      fetchLifeTotals(); // initial fetch
      const interval = setInterval(fetchLifeTotals, 1000); // poll every 1s

      return () => clearInterval(interval); // cleanup
    }, [lobbyId, players]); // rerun whenever players change or lobby changes


    //If No lobby just returns a page that indicates that
    if (!lobbyId) return <p>❌ No lobby selected</p>;

    return(
        <div>
          <h2>Players</h2>
          <ul className="board">
              {players.map((p)=> (
                  <div className="player" key={p.id} >
                    <button className="playername" onClick={()=> handleHeal(p.id)}>
                      {p.name}
                    </button>
                    <button className="life" onClick={() => handleDamage(p.id)}>
                      {lifeTotals[p.id] ?? 40}
                    </button>
                  </div>
              ))}
          </ul>
          {player ? (
            <div style={{paddingTop: "100px"}}>
            <p><strong>Player: {player.name}</strong></p>
            </div>
          ): (<p>Spectating</p>)}
        </div>
    )
}