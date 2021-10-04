//I only watch one youtube tutorial to get started and read two articles. Mainly I took code from thatsoftwaredude & devdojo to start for creating a deck and shuffling inputting my own modifications. I've commented the two functions and cited my work. From there I decided formulate my own way of creating the game so it is a bit messy.

//Took card images from http://richardschneider.github.io/cardsJS/

//window.alert("Hello! Ready to play a game of Blackjack? Press Start Game to play.");

//Global variables 
let playerHand = []; // Player's Hand
let dealerHand = []; // Dealer's Hand
let playerHandValue = 0; // Player's Hand Value
let dealerHandValue = 0; // Dealer's Hand Value 
let deck = createDeck(); //Deck
let shuffle = shuffleDeck();//Shuffled Deck
let deckCount = 0; //Cards remaining 


//document.getElementById("message").innerHTML = "Player Turn, click hit to draw!";
document.getElementById("deckCount").innerHTML = "Cards Remaning: " + deckCount;

document.getElementById("playerHandValue").innerHTML = "Player Score: " + getHandValue(playerHand, playerHandValue); //Displays player's Score

document.getElementById("dealerHandValue").innerHTML = "Dealer Score: " + getHandValue(dealerHand, dealerHandValue); // Displays dealer's score


//document.getElementById("cards").innerHTML = playerHand;
//dealerHand[i].Value
function renderPlayer() {
  console.log(playerHand.length, "render player")
  if (playerHand.length == 2) {
    for (i = 0; i < playerHand.length; i++) {
      var img = new Image();
      img.src = playerHand[i].ImageSrc;
      img.className='cardImage';
      document.getElementById("playerContainer").append(img);
    }
  }
  else if (playerHand.length > 2) {
    var img = new Image();
    img.src = playerHand[playerHand.length-1].ImageSrc;
    img.className='cardImage';
    document.getElementById("playerContainer").append(img);
  }
}

function renderDealer() {
  if (dealerHand.length == 2) {
    for (j = 0; j < dealerHand.length; j++) {
      var img = new Image();
      img.src = dealerHand[j].ImageSrc;
      img.className='cardImage';
      document.getElementById("dealerContainer").append(img);
    }
  }
  else if (dealerHand.length > 2) {
    var img = new Image();
    img.src = dealerHand[dealerHand.length-1].ImageSrc;
    img.className='cardImage';
    document.getElementById("dealerContainer").append(img);
  }
}


// function renderDealerOld() {
//   if (dealerHand.length == 2) {
//     for (j = 0; j < dealerHand.length; j++) {
//       console.log(dealerHand.length, "Dealer hand length")
//       div = document.createElement('div');
//       div.className = 'cards dealerCard';
//       div.id = "card";
//       // div.innerHTML = '<span class="number">' + dealerHand[j].Value +' </span><span class="suit">' + dealerHand[j].Suit.toLowerCase() + ' </span>';
//       div.innerHTML = '<img src="' + dealerHand[j].ImageSrc + '">';
//       document.body.appendChild(div);
//       let currentDiv = document.getElementById("hitStay");
//       document.body.insertBefore(div, currentDiv);
//       $("#card").wrapAll("<div class='cardParent'></div>").parent();
//       // $(".dealerCard").wrapAll("<div class='dealerCardParent'></div>").parent();
//       // $("#card").wrapAll("<div class='cardParent'></div>").parent();
//       // $(".playerCard").wrapAll("<div class='playerCardParent'></div>").parent();
//     }
//   }
//   else if (dealerHand.length > 2) {
//     div = document.createElement('div')
//     div.className = 'cards dealerCard'
//     div.id = "card"
//     div.innerHTML = '<span class="number">' + dealerHand[dealerHand.length - 1].Value + ' </span><span class="suit">' + dealerHand[dealerHand.length - 1].Suit.toLowerCase() + ' </span>';
//     document.body.appendChild(div);
//     let currentDiv = document.getElementById("hitStay");
//     document.body.insertBefore(div, currentDiv)

//   }
// }



//Gets the value of the player's or dealer's hand. Agruments to input are (playerHand, playerHandValue) & (dealerHand, dealerHandValue)
function getHandValue(hand, value) {
  let handValue = hand.map(x => x.IntValue);
  let score = 0;
  let aceCount = 0;
  let newScore = 0;

  for (i = 0; i < handValue.length; i++) {
    if (handValue[i] == 11) {
      aceCount++
    }
    score += handValue[i];
  }

  if (score <= 21) {
    value = score;
    return value;
  }

  if (score > 21) {
    for (j = 0; j < handValue.length; j++) {
      newScore += handValue[j];
    }
    while (newScore > 21 && aceCount > 0) {
      newScore = (newScore - 10);
      aceCount--;
      score = newScore;
    }
    if (newScore > 21 && aceCount == 0) {
      score = newScore;

    }

  }
  value = score;
  return value;
}


//Start the game by creating deck, shuffling, and dealing cards. I coded it to continue using the same deck until the cards run out then page will refresh hence new deck.
function newGame() {
  createDeck();
  shuffleDeck();
  dealCards();
  renderPlayer();
  renderDealer();
  console.log(dealerHand, "dealer hand")
  console.log(playerHand, "playerHand")
  console.log(playerHand[1].Value)
  //document.getElementById("cards").innerHTML = playerHand.Value;
  document.getElementById("message").innerHTML = "Player's Turn, click 'Hit' to draw or 'Stand' to end turn!";
  document.getElementById("playerHandValue").innerHTML = "Player Score: " + getHandValue(playerHand, playerHandValue);
  document.getElementById("dealerHandValue").innerHTML = "Dealer Score: " + getHandValue(dealerHand, dealerHandValue);
  cardCount();
  // $(".playerCard").wrapAll("<div class='playerCardParent'></div>").parent();

}

function getCardImageName(value, suit) {
  // if(true){}
  return "JS";
}

//Creating a deck of 52 Cards
//Used "For" loop to iteriate Suites and Values to create a new array of objects. Added in an image property to link to the card.
//Basic deeck idea came from: https://www.thatsoftwaredude.com/content/6196/coding-a-card-deck-in-javascript, I modified it parse integer 
function createDeck() {
  const suits = ["Spades", "Diamonds", "Clubs", "Hearts"]
  const values = ["Ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"]
  let deck = []
  for (i = 0; i < suits.length; i++) {
    for (j = 0; j < values.length; j++) {
      let intValue = parseInt(values[i])
      if (values[j] == "J" || values[j] == "Q" || values[j] == "K") {
        intValue = 10;
      }
      else if (values[j] === "Ace") {
        intValue = 11;
      }
      else if (values[j] != "J" || values[j] != "Q" || values[j] != "K" || values[j] != "Ace") {
        intValue = values[j];
      }
      const cardImageName = getCardImageName(values[j], suits[i]);
      let cards = { Value: values[j], Suit: suits[i], IntValue: intValue, ImageSrc: "/cards/" + cardImageName + ".svg" };
      deck.push(cards);
    }
  }
  return deck;
}


//Shuffling the deck. Idea taken from:
function shuffleDeck() {
  for (let i = 0; i < 1000; i++) {
    let card1 = Math.floor((Math.random() * deck.length));
    let card2 = Math.floor((Math.random() * deck.length));
    let card = deck[card1];

    deck[card1] = deck[card2];
    deck[card2] = card;

  }
  return deck;
}


//Deals the first four cards. I debugged this. Card# 1&3 to player, 2&4 to dealer. 
function dealCards() {
  playerHand = [];
  dealerHand = [];
  for (i = 0; i < 2; i++) {
    if (playerHand.length < 2) {
      let playerCard = deck.pop();
      playerHand.push(playerCard);
    }

    if (dealerHand.length < 2) {
      let dealerCard = deck.pop();
      dealerHand.push(dealerCard);
    }

  }
  cardCount();
  getHandValue(playerHand, playerHandValue);
  getHandValue(dealerHand, dealerHandValue);
}

//When player hits, the last card from the deck will be drawn and added to player's hand.
function hitCard(hand, value) { //Argument dealerHand when needed hitCard(dealerHand, dealerHandValue).
  let newCard = deck.pop(); //Takes last card from deck.
  hand.push(newCard); //Puts card to the end of array.
  getHandValue(hand, value);
  document.getElementById("playerHandValue").innerHTML = "Player Score: " + getHandValue(playerHand, playerHandValue);
  cardCount();
  check();
  renderPlayer();
  console.log(playerHand, getHandValue(playerHand, playerHandValue), "Player");
}

//When player stands. Checks if dealer is under 17, if so dealer will draw until reaches 17 or higher.
function stay() {
  document.getElementById("message").innerHTML = "Dealer's Turn!";
  let dealerScore = getHandValue(dealerHand, dealerHandValue);
  if (dealerScore < 17) {
    do {
      let dealerHit = deck.pop();
      dealerHand.push(dealerHit)
      renderDealer();
      document.getElementById("dealerHandValue").innerHTML = "Dealer Score: " + getHandValue(dealerHand, dealerHandValue);
      getHandValue(dealerHand, dealerHandValue)
      dealerScore = getHandValue(dealerHand, dealerHandValue)
      cardCount()
    }
    while (dealerScore <= 17)
    checkDealer()
    renderDealer()
    console.log(dealerHand, getHandValue(dealerHand, dealerHandValue), "dealer score")
  }
  else if (dealerScore >= 17) {
    renderDealer()
    getHandValue(dealerHand, dealerHandValue)
    document.getElementById("dealerHandValue").innerHTML = "Dealer Score: " + getHandValue(dealerHand, dealerHandValue);
    checkDealer();
    cardCount();
    console.log(dealerHand, getHandValue(dealerHand, dealerHandValue), "dealer score");
  }
}

//Count how many manys remaining. I set it the page to refresh when the card count is 0 so a new deck is out and player could continue playing.
function cardCount() {
  deckCount = deck.length
  document.getElementById("deckCount").innerHTML = "Cards Remaning: " + deckCount;
  if (deckCount <= 0) {
    window.location.reload();
  }
  return deckCount
}

//Check player score and to see if they busted.
function check() {
  let score = getHandValue(playerHand, playerHandValue)
  if (score > 21) {
    document.getElementById("message").innerHTML = "Busted, you lose! Click 'New Game' to play again!";
    window.alert("Busted, you lose! Click 'New Game' to play again!")
  }
}

//Check to see if player or dealer won. 
function checkDealer() {
  let playerScore = getHandValue(playerHand, playerHandValue);
  let dealerScore = getHandValue(dealerHand, dealerHandValue);
  if (playerScore > dealerScore && dealerScore > 16 && dealerScore <= 21) {
    document.getElementById("message").innerHTML = "Nice, you won! Click 'New Game' to play again!";
    window.alert("Nice, you won! Click 'New Game' to play again!");
  }
  if (playerScore < dealerScore && dealerScore > 16 && dealerScore <= 21) {
    document.getElementById("message").innerHTML = "You lost! Click 'New Game' to play again!";
    window.alert("You lost! Click 'New Game' to play again!");
  }
  if (playerScore == dealerScore && dealerScore > 16) {
    document.getElementById("message").innerHTML = "Tie Game! Click 'New Game' to play again!";
    window.alert("Tie Game! Click 'New Game' to play again!");
  }
  if (dealerScore > 21) {
    document.getElementById("message").innerHTML = "Dealer busted! You won! Click 'New Game' to play again!";
    window.alert("Dealer busted! You won! Click 'New Game' to play again!");
  }
}

document.getElementById("deckCount").innerHTML = "Cards Remaning: " + deckCount;
//Taken from dev
window.onload = playerHand;

// function deckUI() {

//   for(var i=0; i < deck.length; i++){
//     div = document.createElement('div');
//     div.className = 'card';

//     if(deck[i].Suit == 'Diamonds'){
//       var ascii_char = '&diams;';
//     } else {
//       var ascii_char = '&' + deck[i].Suit.toLowerCase() + ';';
//     }

//     div.innerHTML = '<span class="number">' + deck[i].Value + '</span><span class="suit">' + ascii_char + '</span>';
//     document.body.appendChild(div);
//   }
// }

//JQuery
// $(".playerCard").wrapAll("<div class='playerCardParent'></div>").parent();
// $(".dealerCard").wrapAll("<div class='dealerCardParent'></div>").parent();


// $("#card").wrapAll("<div class='cardParent'></div>").parent();


//  $("h1").text("hello");