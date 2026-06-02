import {
  STARTING_CHIPS,
  DEFAULT_BET,
  BLACKJACK_PAYOUT,
  INSURANCE_PAYOUT,
  PHASE,
  DEALER_STANDS_ON,
  MAX_PLAYER_HANDS,
} from "./constants.js";
import { createDeck, shuffleDeck, needsReshuffle } from "./deck.js";
import {
  getHandValue,
  isBlackjack,
  isBust,
  canSplitPair,
} from "./hand.js";

function createPlayerHand(bet) {
  return {
    cards: [],
    bet,
    doubled: false,
    stood: false,
    busted: false,
  };
}

export class BlackjackGame {
  constructor() {
    this.resetSession();
    this.newShoe();
    this.phase = PHASE.BETTING;
    this.bet = DEFAULT_BET;
    this.playerHands = [];
    this.dealerHand = [];
    this.activeHandIndex = 0;
    this.insuranceOffered = false;
    this.insuranceBet = 0;
    this.insuranceTaken = false;
    this.dealerHoleHidden = true;
    this.message = "Place your bet and press Deal to start.";
    this.lastOutcome = null;
    this.roundResults = [];
  }

  resetSession() {
    this.chips = STARTING_CHIPS;
  }

  newShoe() {
    this.deck = shuffleDeck(createDeck());
  }

  ensureDeck() {
    if (needsReshuffle(this.deck)) {
      this.newShoe();
      this.message = "Shuffling a fresh deck…";
      return true;
    }
    return false;
  }

  get activeHand() {
    return this.playerHands[this.activeHandIndex];
  }

  get totalRoundWager() {
    return (
      this.playerHands.reduce((sum, h) => sum + h.bet, 0) + this.insuranceBet
    );
  }

  setBet(amount) {
    if (this.phase !== PHASE.BETTING) return false;
    this.bet = Math.max(5, Math.min(amount, this.chips));
    return true;
  }

  adjustBet(delta) {
    return this.setBet(this.bet + delta);
  }

  drawCard() {
    if (this.deck.length === 0) this.newShoe();
    return this.deck.pop();
  }

  deal() {
    if (this.phase !== PHASE.BETTING) return;
    if (this.bet > this.chips) {
      this.message = "Not enough chips for that bet.";
      return;
    }

    this.ensureDeck();
    this.chips -= this.bet;
    this.playerHands = [createPlayerHand(this.bet)];
    this.dealerHand = [];
    this.activeHandIndex = 0;
    this.insuranceBet = 0;
    this.insuranceTaken = false;
    this.insuranceOffered = false;
    this.dealerHoleHidden = true;
    this.lastOutcome = null;
    this.roundResults = [];

    const hand = this.activeHand;
    hand.cards.push(this.drawCard());
    this.dealerHand.push(this.drawCard());
    hand.cards.push(this.drawCard());
    this.dealerHand.push(this.drawCard());

    const playerBJ = isBlackjack(hand.cards);
    const dealerUpAce = this.dealerHand[0].rank === "A";

    if (playerBJ) {
      this.finishImmediateBlackjacks();
      return;
    }

    if (dealerUpAce) {
      this.insuranceOffered = true;
      this.phase = PHASE.INSURANCE;
      this.message = "Insurance? Dealer shows an Ace — bet up to half your wager (2:1 if dealer has Blackjack).";
      return;
    }

    if (isBlackjack(this.dealerHand)) {
      this.finishImmediateBlackjacks();
      return;
    }

    this.startPlayerTurn();
  }

  finishImmediateBlackjacks() {
    this.dealerHoleHidden = false;
    this.phase = PHASE.ENDED;
    const hand = this.activeHand;
    const playerBJ = isBlackjack(hand.cards);
    const dealerBJ = isBlackjack(this.dealerHand);

    if (playerBJ && dealerBJ) {
      this.chips += hand.bet;
      this.lastOutcome = "push";
      this.message = "Both have Blackjack — push.";
      return;
    }

    if (playerBJ) {
      const payout = Math.floor(hand.bet * (1 + BLACKJACK_PAYOUT));
      this.chips += payout;
      this.lastOutcome = "blackjack";
      this.message = `Blackjack! You win $${payout - hand.bet}.`;
      return;
    }

    if (dealerBJ) {
      this.lastOutcome = "lose";
      this.message = "Dealer Blackjack — you lose.";
    }
  }

  takeInsurance() {
    if (this.phase !== PHASE.INSURANCE) return;
    const maxInsurance = Math.floor(this.activeHand.bet / 2);
    if (maxInsurance <= 0 || this.chips < maxInsurance) {
      this.message = "Not enough chips for insurance.";
      return;
    }
    this.insuranceTaken = true;
    this.insuranceBet = maxInsurance;
    this.chips -= this.insuranceBet;
    this.resolveAfterInsurance();
  }

  declineInsurance() {
    if (this.phase !== PHASE.INSURANCE) return;
    this.resolveAfterInsurance();
  }

  resolveAfterInsurance() {
    this.dealerHoleHidden = false;

    if (isBlackjack(this.dealerHand)) {
      this.phase = PHASE.ENDED;
      if (this.insuranceTaken) {
        this.chips += this.insuranceBet * (1 + INSURANCE_PAYOUT);
      }
      if (isBlackjack(this.activeHand.cards)) {
        this.chips += this.activeHand.bet;
        this.lastOutcome = "push";
        this.message = "Dealer Blackjack — push (insurance paid).";
      } else {
        this.lastOutcome = "lose";
        const insNote = this.insuranceTaken ? " Insurance pays 2:1." : "";
        this.message = `Dealer Blackjack — you lose.${insNote}`;
      }
      return;
    }

    if (this.insuranceTaken) {
      this.message = "No dealer Blackjack — insurance lost. Your turn.";
    }
    this.startPlayerTurn();
  }

  startPlayerTurn() {
    this.phase = PHASE.PLAYER;
    this.dealerHoleHidden = true;
    this.message = this.buildPlayerTurnMessage();
  }

  buildPlayerTurnMessage() {
    const hand = this.activeHand;
    const splitNote =
      this.playerHands.length > 1
        ? ` (Hand ${this.activeHandIndex + 1} of ${this.playerHands.length})`
        : "";
    return `Score ${getHandValue(hand.cards)}${splitNote} — Hit, Stand, Double, or Split.`;
  }

  canDouble() {
    const hand = this.activeHand;
    return (
      this.phase === PHASE.PLAYER &&
      hand &&
      hand.cards.length === 2 &&
      !hand.doubled &&
      !hand.stood &&
      this.chips >= hand.bet
    );
  }

  canSplit() {
    const hand = this.activeHand;
    return (
      this.phase === PHASE.PLAYER &&
      hand &&
      hand.cards.length === 2 &&
      !hand.doubled &&
      this.playerHands.length < MAX_PLAYER_HANDS &&
      canSplitPair(hand.cards) &&
      this.chips >= hand.bet
    );
  }

  split() {
    if (!this.canSplit()) return;
    const hand = this.activeHand;
    this.chips -= hand.bet;

    const second = createPlayerHand(hand.bet);
    const cardTwo = hand.cards.pop();
    second.cards.push(cardTwo);

    const newCard1 = this.drawCard();
    const newCard2 = this.drawCard();
    hand.cards.push(newCard1);
    second.cards.push(newCard2);

    this.playerHands.push(second);

    if (isBust(hand.cards)) hand.busted = true;
    if (isBust(second.cards)) second.busted = true;

    if (hand.busted && second.busted) {
      this.beginDealerTurn();
      return;
    }

    if (hand.busted) {
      this.advanceToNextHand();
      return;
    }

    this.message = this.buildPlayerTurnMessage();
  }

  hit() {
    if (this.phase !== PHASE.PLAYER) return;
    const hand = this.activeHand;
    if (!hand || hand.stood || hand.busted) return;

    hand.cards.push(this.drawCard());

    if (isBust(hand.cards)) {
      hand.busted = true;
      this.advanceToNextHand();
      return;
    }

    if (hand.cards.length >= 5) {
      hand.stood = true;
      this.advanceToNextHand();
      return;
    }

    this.message = this.buildPlayerTurnMessage();
  }

  doubleDown() {
    if (!this.canDouble()) return;
    const hand = this.activeHand;
    this.chips -= hand.bet;
    hand.bet *= 2;
    hand.doubled = true;
    hand.cards.push(this.drawCard());

    if (isBust(hand.cards)) {
      hand.busted = true;
    } else {
      hand.stood = true;
    }
    this.advanceToNextHand();
  }

  stand() {
    if (this.phase !== PHASE.PLAYER) return;
    const hand = this.activeHand;
    if (!hand || hand.busted) return;
    hand.stood = true;
    this.advanceToNextHand();
  }

  advanceToNextHand() {
    const nextIndex = this.playerHands.findIndex(
      (h, i) => i > this.activeHandIndex && !h.stood && !h.busted
    );

    if (nextIndex !== -1) {
      this.activeHandIndex = nextIndex;
      this.message = this.buildPlayerTurnMessage();
      return;
    }

    const anyAlive = this.playerHands.some((h) => !h.busted);
    if (!anyAlive) {
      this.beginDealerTurn();
      return;
    }

    this.beginDealerTurn();
  }

  beginDealerTurn() {
    this.phase = PHASE.DEALER;
    this.dealerHoleHidden = false;

    const allBusted = this.playerHands.every((h) => h.busted);
    if (allBusted) {
      this.phase = PHASE.ENDED;
      this.lastOutcome = "bust";
      this.message = "All hands bust — dealer wins.";
      return;
    }

    while (getHandValue(this.dealerHand) < DEALER_STANDS_ON) {
      this.dealerHand.push(this.drawCard());
    }

    this.resolveAllHands();
  }

  resolveAllHands() {
    this.phase = PHASE.ENDED;
    this.dealerHoleHidden = false;
    const dealerScore = getHandValue(this.dealerHand);
    const dealerBust = isBust(this.dealerHand);

    const messages = [];
    let netWin = 0;
    let wins = 0;
    let losses = 0;

    this.playerHands.forEach((hand, index) => {
      const label =
        this.playerHands.length > 1 ? `Hand ${index + 1}: ` : "";
      const playerScore = getHandValue(hand.cards);

      if (hand.busted) {
        messages.push(`${label}Bust — lose $${hand.bet}.`);
        losses += 1;
        return;
      }

      if (dealerBust) {
        this.chips += hand.bet * 2;
        netWin += hand.bet;
        messages.push(`${label}Dealer bust — win $${hand.bet}!`);
        wins += 1;
        return;
      }

      if (playerScore > dealerScore) {
        this.chips += hand.bet * 2;
        netWin += hand.bet;
        messages.push(`${label}Win $${hand.bet} (${playerScore} vs ${dealerScore}).`);
        wins += 1;
        return;
      }

      if (playerScore < dealerScore) {
        messages.push(`${label}Lose (${dealerScore} vs ${playerScore}).`);
        losses += 1;
        return;
      }

      this.chips += hand.bet;
      messages.push(`${label}Push (${playerScore}).`);
    });

    if (wins > losses) this.lastOutcome = "win";
    else if (losses > wins) this.lastOutcome = "lose";
    else if (wins === losses && wins > 0) this.lastOutcome = "push";
    else this.lastOutcome = netWin > 0 ? "win" : "lose";

    this.message = messages.join(" ");
    this.roundResults = messages;
  }

  nextRound() {
    if (this.chips <= 0) {
      this.chips = STARTING_CHIPS;
      this.message = "Out of chips — fresh $1,000 bankroll. Place your bet.";
    } else {
      this.message = "Place your bet and press Deal.";
    }
    this.phase = PHASE.BETTING;
    this.playerHands = [];
    this.dealerHand = [];
    this.activeHandIndex = 0;
    this.insuranceBet = 0;
    this.insuranceTaken = false;
    this.insuranceOffered = false;
    this.dealerHoleHidden = true;
    this.lastOutcome = null;
    this.roundResults = [];
  }

  getState() {
    const active = this.activeHand;
    const displayHands = this.playerHands.map((h) => ({
      cards: h.cards,
      bet: h.bet,
      score: getHandValue(h.cards),
      stood: h.stood,
      busted: h.busted,
      doubled: h.doubled,
    }));

    return {
      phase: this.phase,
      chips: this.chips,
      bet: this.bet,
      playerHands: displayHands,
      activeHandIndex: this.activeHandIndex,
      dealerHand: this.dealerHand,
      deckCount: this.deck.length,
      dealerHoleHidden: this.dealerHoleHidden,
      message: this.message,
      lastOutcome: this.lastOutcome,
      canDouble: this.canDouble(),
      canSplit: this.canSplit(),
      insuranceOffered: this.insuranceOffered && this.phase === PHASE.INSURANCE,
      insuranceBet: this.insuranceBet,
      insuranceTaken: this.insuranceTaken,
      totalRoundWager: this.totalRoundWager,
      playerScore: active ? getHandValue(active.cards) : 0,
      dealerScore: getHandValue(this.dealerHand),
    };
  }
}
