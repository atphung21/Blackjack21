import { PHASE } from "./constants.js";
import { formatHandScore } from "./hand.js";

const CARD_BACK = "cards/BLUE_BACK.svg";

const els = {};

export function initUI() {
  els.message = document.getElementById("game-message");
  els.playerHandsContainer = document.getElementById("player-hands");
  els.dealerCards = document.getElementById("dealer-cards");
  els.playerScore = document.getElementById("player-score");
  els.dealerScore = document.getElementById("dealer-score");
  els.chips = document.getElementById("chip-balance");
  els.bet = document.getElementById("current-bet");
  els.deckCount = document.getElementById("deck-count");
  els.insurancePanel = document.getElementById("insurance-panel");
  els.stats = {
    played: document.getElementById("stat-played"),
    wins: document.getElementById("stat-wins"),
    losses: document.getElementById("stat-losses"),
    blackjacks: document.getElementById("stat-blackjacks"),
  };
  els.buttons = {
    deal: document.getElementById("btn-deal"),
    hit: document.getElementById("btn-hit"),
    stand: document.getElementById("btn-stand"),
    double: document.getElementById("btn-double"),
    split: document.getElementById("btn-split"),
    next: document.getElementById("btn-next"),
    insuranceYes: document.getElementById("btn-insurance-yes"),
    insuranceNo: document.getElementById("btn-insurance-no"),
    sound: document.getElementById("btn-sound-toggle"),
  };
}

function renderCards(container, cards, hideSecond = false) {
  container.innerHTML = "";
  cards.forEach((card, index) => {
    const img = document.createElement("img");
    const isHidden = hideSecond && index === 1;
    img.src = isHidden ? CARD_BACK : card.imageSrc;
    img.alt = isHidden ? "Hidden card" : `${card.rank} of ${card.suit}`;
    img.className = "card" + (isHidden ? " card--hidden" : "");
    img.loading = "lazy";
    container.appendChild(img);
  });
}

function setButtonState(btn, enabled) {
  if (!btn) return;
  btn.disabled = !enabled;
  btn.classList.toggle("is-disabled", !enabled);
}

function renderPlayerHands(state) {
  const { playerHands, activeHandIndex, phase } = state;
  els.playerHandsContainer.innerHTML = "";

  playerHands.forEach((hand, index) => {
    const zone = document.createElement("div");
    zone.className = "player-hand-zone";
    if (index === activeHandIndex && phase === PHASE.PLAYER) {
      zone.classList.add("player-hand-zone--active");
    }
    if (hand.busted) zone.classList.add("player-hand-zone--busted");
    if (hand.stood) zone.classList.add("player-hand-zone--stood");

    const header = document.createElement("div");
    header.className = "player-hand-zone__header";
    header.innerHTML = `
      <span>${playerHands.length > 1 ? `Hand ${index + 1}` : "Your hand"}</span>
      <span class="player-hand-zone__meta">Bet $${hand.bet}${hand.doubled ? " · Doubled" : ""}</span>
      <span class="player-hand-zone__score">${hand.busted ? "Bust" : hand.score}</span>
    `;

    const cardsEl = document.createElement("div");
    cardsEl.className = "hand__cards";
    renderCards(cardsEl, hand.cards);

    zone.appendChild(header);
    zone.appendChild(cardsEl);
    els.playerHandsContainer.appendChild(zone);
  });
}

export function render(state, stats, soundOn) {
  const {
    phase,
    chips,
    bet,
    playerHands,
    activeHandIndex,
    dealerHand,
    deckCount,
    dealerHoleHidden,
    message,
    lastOutcome,
    canDouble,
    canSplit,
    insuranceOffered,
    totalRoundWager,
  } = state;

  els.message.textContent = message;
  els.message.className = "game-message";
  if (lastOutcome) els.message.classList.add(`game-message--${lastOutcome}`);

  els.chips.textContent = `$${chips.toLocaleString()}`;
  els.bet.textContent =
    phase === PHASE.BETTING ? `$${bet}` : `$${totalRoundWager || bet}`;
  els.deckCount.textContent = String(deckCount);

  renderPlayerHands(state);
  renderCards(els.dealerCards, dealerHand, dealerHoleHidden);

  const active = playerHands[activeHandIndex];
  els.playerScore.textContent = active ? String(active.score) : "—";
  els.dealerScore.textContent = dealerHand.length
    ? formatHandScore(dealerHand, dealerHoleHidden)
    : "—";

  const betting = phase === PHASE.BETTING;
  const insurance = phase === PHASE.INSURANCE;
  const playing = phase === PHASE.PLAYER;
  const ended = phase === PHASE.ENDED;

  if (els.insurancePanel) {
    els.insurancePanel.hidden = !insurance;
  }

  setButtonState(els.buttons.deal, betting && bet <= chips && bet > 0);
  setButtonState(els.buttons.hit, playing && active && !active.busted && !active.stood);
  setButtonState(els.buttons.stand, playing && active && !active.busted && !active.stood);
  setButtonState(els.buttons.double, playing && canDouble);
  setButtonState(els.buttons.split, playing && canSplit);
  setButtonState(els.buttons.next, ended);
  setButtonState(els.buttons.insuranceYes, insurance);
  setButtonState(els.buttons.insuranceNo, insurance);

  document.querySelectorAll("[data-bet]").forEach((chip) => {
    const amount = Number(chip.dataset.bet);
    chip.classList.toggle("chip--active", betting && amount === bet);
    chip.disabled = !betting || amount > chips;
  });

  if (els.buttons.sound) {
    els.buttons.sound.textContent = soundOn ? "Sound: On" : "Sound: Off";
    els.buttons.sound.setAttribute("aria-pressed", soundOn ? "true" : "false");
  }

  if (stats && els.stats.played) {
    els.stats.played.textContent = stats.handsPlayed;
    els.stats.wins.textContent = stats.wins;
    els.stats.losses.textContent = stats.losses;
    els.stats.blackjacks.textContent = stats.blackjacks;
  }
}
