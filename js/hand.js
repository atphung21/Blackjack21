export function getHandValue(cards) {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.rank === "A") aces += 1;
    total += card.value;
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}

export function isBlackjack(cards) {
  return cards.length === 2 && getHandValue(cards) === 21;
}

export function isBust(cards) {
  return getHandValue(cards) > 21;
}

export function formatHandScore(cards, hideHole = false) {
  if (hideHole && cards.length > 0) {
    const upcard = cards[0];
    return upcard.rank === "A" ? "11" : String(upcard.value);
  }
  return String(getHandValue(cards));
}

/** Same rank, or both ten-value (10/J/Q/K) for split eligibility */
export function canSplitPair(cards) {
  if (cards.length !== 2) return false;
  const [a, b] = cards;
  if (a.rank === b.rank) return true;
  const tenValue = (r) => ["10", "J", "Q", "K"].includes(r);
  return tenValue(a.rank) && tenValue(b.rank);
}
