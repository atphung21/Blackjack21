const STORAGE_KEY = "atp-blackjack-stats";

const defaultStats = () => ({
  handsPlayed: 0,
  wins: 0,
  losses: 0,
  pushes: 0,
  blackjacks: 0,
  biggestWin: 0,
});

export function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultStats(), ...JSON.parse(raw) } : defaultStats();
  } catch {
    return defaultStats();
  }
}

export function saveStats(stats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function recordOutcome(stats, outcome, winAmount = 0) {
  stats.handsPlayed += 1;
  if (outcome === "win" || outcome === "blackjack") stats.wins += 1;
  if (outcome === "lose" || outcome === "bust") stats.losses += 1;
  if (outcome === "push") stats.pushes += 1;
  if (outcome === "blackjack") stats.blackjacks += 1;
  if (winAmount > stats.biggestWin) stats.biggestWin = winAmount;
  saveStats(stats);
  return stats;
}
