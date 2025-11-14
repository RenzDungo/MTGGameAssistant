import express from "express";
import { addCard, getCardsByPlayer, removeCard, updateCardOwner, updateCardPower } from "../db"  // <-- Your addCard function

const Cardsrouter = express.Router();

// POST /players/:playerId/addcard
Cardsrouter.post("/players/:playerId/addcard", async (req, res) => {
  try {
    const { playerId } = req.params;
    const { cardName } = req.body;

    if (!cardName || typeof cardName !== "string") {
      return res.status(400).json({
        success: false,
        error: "cardName (string) is required in body"
      });
    }

    // Fetch card from Scryfall
    const response = await fetch(
      `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`
    );
    const cardJson = await response.json();

    if (cardJson.object === "error") {
      return res.status(404).json({
        success: false,
        error: "Card not found on Scryfall"
      });
    }

    // Call your DB insert function
    const result = addCard(Number(playerId), cardJson);

    return res.status(200).json({
      success: true,
      message: "Card added",
      card_id: result.card_id,
      card_name: cardJson.name
    });

  } catch (err) {
    console.error("Error in POST /players/:playerId/cards:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to add card"
    });
  }
});

//get Cards by playerId
Cardsrouter.get("/players/:playerId/card", (req, res) => {
    try{
        const {playerId} = req.params;
        const cards = getCardsByPlayer(Number(playerId))
        return res.status(200).json({
            success: true,
            cards
        })
    } catch (err) {
        console.error("Error fetching cards", err);
        return res.status(500).json({
            success: false,
            error: "Failed to fecth cards for player"
        })
    }

});

//Delete cards by card Id
Cardsrouter.delete("/cardremove/:cardId", (req,res) => {
    try {
        const {cardId} = req.params;
        const result = removeCard(Number(cardId))
        if (!result.success) {
            return res.status(404).json({
                success: false,
                error: "Card not Found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Card removed",
            deleted: result.deleted
        });
    } catch (err) {
        console.error ("Error removing card", err);
        return res.status(500).json({
            success:false,
            error: "Failed to remove card"
        });
    }
});

Cardsrouter.put("/updateOwner/:cardId", (req,res) => {
    try{
        const {cardId} = req.params;
        const {newPlayerId} = req.body;
        if (!newPlayerId) {
            return res.status(400).json({
                success: false,
                error: "newPlayerId is required"
            });
        }
        const result = updateCardOwner(Number(cardId), Number(newPlayerId));
        if (!result.success) {
            return res.status(404).json({
                success: false,
                error: "Card not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Card owner updated",
            updated: result.updated,
            new_owner: newPlayerId
        })
    } catch (err) {
        console.error("Error updating card owner:", err);
        return res.status(500).json({
            success:false,
            error: "Failed to update card owner"
        });
    }
});

Cardsrouter.put("/power/:cardId", (req,res) => {
    const {cardId} = req.params;
    const {upd_power} = req.body;

    if (upd_power === undefined) {
        return res.status(400).json({error: "upd_power is required field"})
    }

    const result = updateCardPower(Number(cardId), upd_power)

    if (!result.success) {
        return res.status(404).json({error: "Card not found"})
    }
    res.json({success:true, message:"Power updated"})
})

Cardsrouter.put("/toughness/:cardId", (req,res) => {
    const {cardId} = req.params;
    const {upd_toughness} = req.body;

    if (upd_toughness === undefined) {
        return res.status(400).json({error: "upd_toughness is required field"})
    }

    const result = updateCardPower(Number(cardId), upd_toughness)

    if (!result.success) {
        return res.status(404).json({error: "Card not found"})
    }

    res.json({success:true, message:"Toughness updated"})
})

export default Cardsrouter;
