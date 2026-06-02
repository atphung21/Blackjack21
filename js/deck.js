import { RESHUFFLE_THRESHOLD } from "./constants.js";

const SUITS = ["Spades", "Diamonds", "Clubs", "Hearts"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const suitCode = { Spades: "S", Diamonds: "D", Clubs: "C", Hearts: "H" };

function rankValue(rank) {
  if (rank === "A") return 11;
  if (["J", "Q", "K"].includes(rank)) return 10;
  return Number(rank);
}

export function createCard(rank, suit) {
  const fileName = `${rank}${suitCode[suit]}`;
  return {
    rank,
    suit,
    value: rankValue(rank),
    imageSrc: `cards/${fileName}.svg`,
  };
}

export function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(createCard(rank, suit));
    }
  }
  return deck;
}

/** Fisher–Yates shuffle */
export function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function needsReshuffle(deck) {
  return deck.length < RESHUFFLE_THRESHOLD;
}
