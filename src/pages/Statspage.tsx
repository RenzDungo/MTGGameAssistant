import { usePlayer } from "../Playercontext";
import { getLobbyIdByCode } from "../utils/getLobbyIdbyCode";
import { useLobby } from "../Lobbycontext";
import React, { useState, useEffect } from "react";
import { fetchPlayers } from "../utils/fetchPlayers";
import "../styles/stats.css"
const API_BASE = import.meta.env.VITE_API_URL;

interface Player {
  id: number;
  name: string;
  initial_life: number;
  damageArray?: [number[], number[]]
}

export default function Statspage() {
    //States
    const { lobbyId } = useLobby();
    const {player} =usePlayer();
    const [players, setPlayers] = useState<Player[]>([]);
    
    async function loadPlayers() {
        const data = await fetchPlayers(lobbyId)
        setPlayers(data);
    }

    const fetchDamage = async (lobbyId: string, actorId: number, targetId?:number ): Promise<number> => {
        try {
            const lobbykey = await getLobbyIdByCode(lobbyId);
            const url= targetId
            ? `${API_BASE}/api/events/damage/${lobbykey}/${actorId}?targetId=${targetId}`
            : `${API_BASE}/api/events/damage/${lobbykey}/${actorId}`;

            const res = await fetch(url);
            const data = await res.json();
            if (!res.ok || !data.success) return 0;
            return data.damage ?? 0;
        } catch (err) {
            console.error("Error fetching damage:", err)
            return 0;
        }
    }
    async function mapPlayerDamageArrays(lobbyId: string, players: Player[]) {
        const updatedPlayers: Player[] = [];

        for (const actor of players) {
            const targetIds: number[] = [];
            const damageValues: number[] = [];
            let total = 0;

            // ✅ Include self now (no filtering)
            for (const target of players) {
            const dmg = await fetchDamage(lobbyId, actor.id, target.id);
            targetIds.push(target.id);
            damageValues.push(dmg);
            total += dmg;
            }

            // Add total damage as final entry
            targetIds.push(0);        // 0 = represents total damage
            damageValues.push(total); // sum of all

            // Merge the array into a new player object
            const playerWithDamage: Player = {
            ...actor,
            damageArray: [targetIds, damageValues],
            };

            updatedPlayers.push(playerWithDamage);
        }

        return updatedPlayers;
    }
    function getPlayerNameById(players: Player[], id: number): string {
        if (id === 0) return "Total Damage";
        const found = players.find((p) => p.id === id);
        return found ? found.name : `Unknown (${id})`;
    }

    async function loadPlayerDamageData() {
        if (!lobbyId) return;

        // 1️⃣ Fetch players from DB
        const basePlayers = await fetchPlayers(lobbyId);

        // 2️⃣ Map their damage arrays
        const playersWithDamage = await mapPlayerDamageArrays(lobbyId, basePlayers);

        // 3️⃣ Update your React state
        setPlayers(playersWithDamage);
    }

    return(
        <div>
            <button onClick={loadPlayerDamageData}>Fetch Stats</button>
            <ul className="statslist">
                {players.map((p)=> (
                    <div key={p.id} className="statsContainer">
                        <h3>Player: </h3>
                        <p><strong>{p.name}</strong></p>
                        {p.damageArray ? (
                            <ul>
                                {p.damageArray[0].map((targetId,i) => (
                                    <li key={i}>
                                        {getPlayerNameById(players, targetId)}: {p.damageArray![1][i]} dmg
                                    </li>
                                ))}
                            </ul>
                        ): (
                            <p>No data yet</p>
                        )}
                    </div>
                ))}
            </ul>
        </div>
    )
}