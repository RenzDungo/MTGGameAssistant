import React, { useState, useEffect } from "react";
import "../styles/Home.css"
import { useLobby } from "../Lobbycontext";
import { usePlayer } from "../Playercontext";
const API_BASE = import.meta.env.VITE_API_URL;

interface Lobby {
  id: string;
  code: string;
  created_at: string;
}

export default function Homepage () {
    const { lobbyId, setLobbyId, lobbyCode, setLobbyCode } = useLobby();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [createdLobby, setCreatedLobby] = useState<Lobby | null>(null);
    const [playerName, setPlayerName] = useState("");
    const { player, setPlayer } = usePlayer();
    //Create Lobby Function
    const createLobby = async () => {
        setLoading(true)
        setMessage("");
        console.log(import.meta.env.VITE_API_URL);
        try {
        const res = await fetch(`${API_BASE}/api/lobbies`, { method: "POST" });
        const data = await res.json();
        console.log("Response data:", data);

        if (res.ok && data) {
            setLobbyId(data.lobby.id);
            setLobbyCode(data.lobby.code);
            setCreatedLobby(data.lobby); //Local save to set Lobby Code
            setMessage(`✅ Lobby created! Code: ${data.lobby.code}`);
        } else {
            setMessage("❌ Failed to create lobby.");
        }
        } 
        catch (err) {
        console.error("Error creating lobby:", err);
        setMessage("❌ Server error creating lobby.");
        } 
        finally {
        setLoading(false);
        }

    }
    //Player join Function
    const joinLobby = async() => {
        if (!lobbyCode || !playerName) {
            setMessage("❌ Enter both a Lobby Code and Player Name!");
            return;
        }
        setLoading(true);
        setMessage("");
        try {
            const res = await fetch(`${API_BASE}/api/lobbies/${lobbyCode}/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: playerName,
                    initialLife: 40, // or dynamic
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                console.log("Joined lobby:", data);
                setMessage(`✅ Joined Lobby ${lobbyCode} as ${playerName}`);
                setLobbyId(data.lobbyCode);
                setPlayer({
                    id: data.player.id,
                    name: data.player.name,
                    lobbyId: data.lobbyCode,
                });
            } 
            else {
            setMessage(`❌ ${data.error || "Failed to join lobby."}`);
            }
        } catch (err) {
            console.error("Error joining lobby:", err);
            setMessage("❌ Server error joining lobby.");
        } finally {
            setLoading(false);
        }
    }

    return(
        <div className="Homepage">
            <div className="Createlobby">
            <h2>Create a New Lobby</h2>
            <button onClick={createLobby} disabled={loading} 
            >
                {loading ? "Creating...": "Create Lobby"}
            </button>
            </div>
            <div className="Joinlobby">
                <h2>Join Lobby</h2>
                <input type="text"
                placeholder="Enter Lobby Code"
                value={lobbyCode ?? ""}
                onChange={(e)=> setLobbyCode(e.target.value)}
                />
                <input type="text"
                placeholder="Your Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                />
                <button disabled={loading} onClick={joinLobby}>
                    Join
                </button>
            </div>
            {message && <p>{message}</p>}
            {player ? (
                <>
                    <p><strong>Player: {player.id} </strong></p>
                    <p><strong>Player Name: {player.name} </strong></p>
                </>
            ): (<p>No Player yet</p>)}
            <div className="debug">
                {createdLobby && (
                    <div>
                        <h3>Lobby Created:</h3>
                        <p><strong>Code:</strong> {createdLobby.code}</p>
                    </div>
                )}
                {lobbyId && (
                    <div>
                        <p><strong>Current Lobby Code:</strong> {lobbyCode}</p>
                    </div>
                )}
            </div>
        </div>
    )
}