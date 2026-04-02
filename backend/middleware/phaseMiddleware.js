const GameState = require("../models/GameState");
const { getCalculatedGameState } = require("../utils/gameUtils");

/**
 * Middleware to restrict non-admin actions based on the game phase.
 * Actions are allowed ONLY during "recon" or "chaos" phases.
 */
const activePhaseOnly = async (req, res, next) => {
  try {
    const rawState = await GameState.findOne();
    const state = getCalculatedGameState(rawState);

    // If game is waiting, paused, or ended, block participant actions
    if (state.phase !== "recon" && state.phase !== "chaos") {
      let statusMsg = "Action disabled.";
      
      if (state.phase === "waiting") statusMsg = "Game has not started yet. Please wait for the Admin.";
      if (state.phase === "paused") statusMsg = "Game is currently PAUSED by Admin.";
      if (state.phase === "ended") statusMsg = "Game has ENDED. No more actions allowed.";

      return res.status(403).json({ 
        message: statusMsg,
        phase: state.phase
      });
    }

    next();
  } catch (error) {
    console.error("Phase check error:", error);
    res.status(500).json({ message: "Internal server error during phase check" });
  }
};

module.exports = { activePhaseOnly };
