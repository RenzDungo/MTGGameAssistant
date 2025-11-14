import { useEffect, useState } from "react";
import "../styles/Cards.css"
import { useLobby } from "../Lobbycontext";
import { usePlayer } from "../Playercontext";
import { fetchPlayers } from "../utils/fetchPlayers";
const API_BASE = import.meta.env.VITE_API_URL;

interface Player {
    id: number;
    name: string;
}
interface Card {
  id: number;
  name: string;
  image_small: string;
  power: string | null;
  toughness: string| null;
  multiverse_ids: number[];
  prints_search_uri:string;
}
export default function Cardspage () {
    const { player,} = usePlayer();
    const { lobbyId } = useLobby();
    const [players, setPlayers] = useState<Player[]>([])
    const [playerCards, setPlayerCards] = useState<Record<number,Card[]>>({})
    const [searchText, setSearchText] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [card, setCard] = useState<Card | null>(null);
    const [multiversecards, setmultiversecards] = useState<Card[]>([])

    async function loadPlayers() {
        const data = await fetchPlayers(lobbyId)
        setPlayers(data)
    }
    async function getCardsForPlayer(playerId:number) {
        try{
            const res = await fetch(`${API_BASE}/cards/players/${playerId}/card`);
            const data = await res.json();
            if (!data.success) return [];
            return data.cards
        } catch (err) {
            console.error("Error fetching cards:", err)
            return [];
        }
    }

    async function loadAllCards() {
        await loadPlayers();
        
        const results: Record<number, Card[]> = {};
        for (const p of players) {
            const cards = await getCardsForPlayer(p.id);
            results[p.id] = cards;
        }

        setPlayerCards(results);
    }

    async function autocompleteCard(query:string): Promise<string[]> {
        if(!query || query.length < 2 ) return[]; //Avoids calls until string reaches length of 3
        try{
            const res=await fetch( `https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(query)}`)
            const data = await res.json();
            if (data.object !=="catalog") return [];
            return data.data
        } catch (err) {
            console.error("Autocomplete error:", err)
            return[];
        }
    }

    useEffect( () => {
        const timer = setTimeout(async() =>{
            if (searchText.length >=2) {
                const results = await autocompleteCard(searchText);
                setSuggestions(results);
            } else {
                setSuggestions([]);
            }
        }, 200)
        return ()=> clearTimeout(timer);
    }, [searchText]
    )
    
    async function getCardbyScryfall(cardname:string) {
        try {
            const res = await fetch(`https://api.scryfall.com/cards/named?exact=${cardname}`);
            const data = await res.json();
            if (data.object === "error") {
                console.error("Card not found:", data.details);
                return null;
            }
            const cleanCard: Card ={
                id: 0,
                name: data.name,
                image_small: data.image_uris?.small || "",
                power: data.power ?? null,
                toughness: data.toughness ?? null,
                prints_search_uri: data.prints_search_uri,
                multiverse_ids: Array.isArray(data.multiverse_ids)
                ? data.multiverse_ids
                : []
            }
            setCard(cleanCard);
            setmultiversecards([]);
            getAllPrintings(cleanCard.prints_search_uri);
        } catch (err) {
            console.error("Error getting card by Scryfall:", err)
            return("");
        }
    }
    async function getMultiverseCards(multiverseid: number) {
        try{
            const res = await fetch(`https://api.scryfall.com/cards/search?q=multiverseid:${multiverseid}`);
            const data = await res.json();
            if (data.object === "error") {
                console.error("Scryfall error:", data.details);
                setmultiversecards([]);
                return;
            }
            // data.data = array of cards
            const multiversecard: Card[] = data.data.map((c: any) => ({
            id: 0,
            name: c.name,
            image_small: c.image_uris?.small || "",
            power: c.power ?? null,
            toughness: c.toughness ?? null,
            prints_search_uri: data.prints_search_uri,
            multiverse_ids: Array.isArray(c.multiverse_ids) ? c.multiverse_ids : []
            }));
            setmultiversecards(multiversecard);
        } catch (err) {
            console.error("Error fetching multiverse cards:", err);
            setmultiversecards([]);
        }
    }

    async function getAllPrintings(uri: string) {
    try {
        const res = await fetch(uri);
        const data = await res.json();

        if (data.object === "error") {
            console.error("Scryfall error:", data.details);
            setmultiversecards([]);
            return;
        }

        // Map all printings
        const printings: Card[] = data.data.map((c: any) => ({
            id: 0,
            name: c.name,
            image_small: c.image_uris?.small || "",
            power: c.power ?? null,
            toughness: c.toughness ?? null,
            multiverse_ids: Array.isArray(c.multiverse_ids) ? c.multiverse_ids : [],
            prints_search_uri: c.prints_search_uri
        }));

        setmultiversecards(printings);

        } catch (err) {
        console.error("Error fetching printings:", err);
        setmultiversecards([]);
        }
    }   

    return (
        <div>
            <button onClick={loadAllCards}>Load Cards</button>
            <h1>Search for cards</h1>
            <input type="text"
            placeholder="Search Card.."
            value={searchText}
            onChange={(e)=> setSearchText(e.target.value)}
            />
            {/*Autocomplete Suggestions */}
            {suggestions.length > 0 && (
                <div className="autocomplete-box">
                    {suggestions.map((name)=> (
                        <div key={name} className="autocomplete-item" onClick={() => {setSearchText(name); setSuggestions([]); getCardbyScryfall(name)}}>
                            {name}
                        </div>
                    ))}
                </div>
            )}<div className="printingsgallery">
                {card ? (
                    <div>
                        <img src={card.image_small}/>
                    </div>
                ): (<p>No current card</p>)}

                {multiversecards ? (
                    multiversecards.map((c,index) => (
                        <div key={index}>
                            <img src={c.image_small} />
                        </div>
                    ))
                ): (<p>No multiverse Printings</p>)
                }
            </div>
            {player ? (
                <div>
                    <p><strong>Player: {player.name} </strong></p>
                </div>
            ): (<p>Spectating</p>)}
        </div>
        
    )
}