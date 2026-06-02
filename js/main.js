import { PHASE } from "./constants.js";
import { BlackjackGame } from "./game.js";
import { initUI, render } from "./ui.js";
import { loadStats, recordOutcome } from "./stats.js";
import { sounds, loadSoundPreference, setSoundEnabled, isSoundEnabled } from "./sounds.js";

const game = new BlackjackGame();
let stats = loadStats();
let soundOn = loadSoundPreference();

function updateUI() {
  render(game.getState(), stats, soundOn);
}

function play(key) {
  if (soundOn && sounds[key]) sounds[key]();
}

function onRoundEnd() {
  const outcome = game.lastOutcome;
  if (!outcome) return;

  let winAmount = 0;
  if (outcome === "win") winAmount = game.roundResults.length ? 50 : game.bet;
  if (outcome === "blackjack") {
    winAmount = Math.floor((game.playerHands[0]?.bet || game.bet) * 1.5);
  }

  if (outcome === "win" || outcome === "blackjack") play(outcome === "blackjack" ? "blackjack" : "win");
  else if (outcome === "lose" || outcome === "bust") play("lose");

  stats = recordOutcome(stats, outcome, winAmount);
  updateUI();
}

function afterAction(wasBust = false) {
  if (wasBust) play("bust");
  else if (game.phase === PHASE.PLAYER) play("card");
  updateUI();
  if (game.phase === PHASE.ENDED) onRoundEnd();
  else if (game.phase === PHASE.DEALER) {
    play("stand");
    updateUI();
    onRoundEnd();
  }
}

function bindControls() {
  document.getElementById("btn-deal").addEventListener("click", () => {
    play("button");
    game.deal();
    play("deal");
    updateUI();
    if (game.phase === PHASE.ENDED) onRoundEnd();
  });

  document.getElementById("btn-hit").addEventListener("click", () => {
    play("button");
    game.hit();
    afterAction(game.lastOutcome === "bust");
  });

  document.getElementById("btn-stand").addEventListener("click", () => {
    play("button");
    game.stand();
    if (game.phase === PHASE.DEALER) play("stand");
    afterAction();
  });

  document.getElementById("btn-double").addEventListener("click", () => {
    play("button");
    game.doubleDown();
    afterAction(game.playerHands.some((h) => h.busted));
  });

  document.getElementById("btn-split").addEventListener("click", () => {
    play("button");
    game.split();
    play("card");
    updateUI();
    if (game.phase === PHASE.ENDED) onRoundEnd();
  });

  document.getElementById("btn-next").addEventListener("click", () => {
    play("button");
    game.nextRound();
    updateUI();
  });

  document.getElementById("btn-insurance-yes").addEventListener("click", () => {
    play("button");
    game.takeInsurance();
    play("insurance");
    updateUI();
    if (game.phase === PHASE.ENDED) onRoundEnd();
    else if (game.phase === PHASE.PLAYER) updateUI();
  });

  document.getElementById("btn-insurance-no").addEventListener("click", () => {
    play("button");
    game.declineInsurance();
    updateUI();
    if (game.phase === PHASE.ENDED) onRoundEnd();
  });

  document.getElementById("btn-sound-toggle").addEventListener("click", () => {
    soundOn = !soundOn;
    setSoundEnabled(soundOn);
    if (soundOn) play("button");
    updateUI();
  });

  document.querySelectorAll("[data-bet]").forEach((chip) => {
    chip.addEventListener("click", () => {
      play("chip");
      game.setBet(Number(chip.dataset.bet));
      updateUI();
    });
  });

  document.getElementById("btn-bet-minus").addEventListener("click", () => {
    play("chip");
    game.adjustBet(-25);
    updateUI();
  });

  document.getElementById("btn-bet-plus").addEventListener("click", () => {
    play("chip");
    game.adjustBet(25);
    updateUI();
  });

  document.getElementById("btn-max-bet").addEventListener("click", () => {
    play("chip");
    game.setBet(game.chips);
    updateUI();
  });

  document.getElementById("btn-reset-stats").addEventListener("click", () => {
    if (window.confirm("Reset session statistics?")) {
      localStorage.removeItem("atp-blackjack-stats");
      stats = loadStats();
      updateUI();
    }
  });

  document.getElementById("btn-reset-chips").addEventListener("click", () => {
    game.resetSession();
    game.nextRound();
    updateUI();
  });

  window.addEventListener("keydown", (event) => {
    if (event.target.matches("input, textarea, select")) return;
    const key = event.key.toLowerCase();
    const state = game.getState();

    if (key === "d" && state.phase === PHASE.BETTING) {
      document.getElementById("btn-deal").click();
    }
    if (key === "h" && state.phase === PHASE.PLAYER) {
      document.getElementById("btn-hit").click();
    }
    if (key === "s" && state.phase === PHASE.PLAYER) {
      document.getElementById("btn-stand").click();
    }
    if (key === "o" && state.phase === PHASE.PLAYER && state.canDouble) {
      document.getElementById("btn-double").click();
    }
    if (key === "p" && state.phase === PHASE.PLAYER && state.canSplit) {
      document.getElementById("btn-split").click();
    }
    if (key === "i" && state.phase === PHASE.INSURANCE) {
      document.getElementById("btn-insurance-yes").click();
    }
    if (key === "n" && state.phase === PHASE.ENDED) {
      document.getElementById("btn-next").click();
    }
  });
}

initUI();
bindControls();
updateUI();
