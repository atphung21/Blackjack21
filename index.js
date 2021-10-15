/*Sources
- Took SVG card images from http://richardschneider.github.io/cardsJS/;
- Deck idea from https://www.thatsoftwaredude.com/content/6417/how-to-code-blackjack-using-javascript;
- Shuffle deck https://devdojo.com/devdojo/create-a-deck-of-cards-in-javascript;
- https://www.youtube.com/watch?v=oT49KkhOv-Y
*/


//Global variables 
let playerHand = []; // Player's Hand
let dealerHand = []; // Dealer's Hand
let playerHandValue = 0; // Player's Hand Value
let dealerHandValue = 0; // Dealer's Hand Value 
let deck = createDeck(); //Deck
let shuffle = shuffleDeck();//Shuffled Deck
let deckCount = 0; //Cards remaining 



document.getElementById("deckCount").innerHTML = "Cards Remaining: " + deckCount; //Cards remaining in deck;

document.getElementById("playerHandValue").innerHTML = "Player Score: " + getHandValue(playerHand, playerHandValue); //Displays player's Score;

document.getElementById("dealerHandValue").innerHTML = "Dealer Score: " + getHandValue(dealerHand, dealerHandValue); // Displays dealer's score;

/*New function below and also updated the check() function.
Disables "Hit" and "Stand" buttons after the user ends turn by clicking on the "Stand Button". */
function disableStandHit(){
  $('#standButton').click(function (){
    $('#hitButton').attr('disabled', 'disabled');
    $('#standButton').attr('disabled', 'disabled');
  })
}
disableStandHit();

//Disable the "Hit" and "Stand" button until a game has started.
function enableButton() {
  $('#newGameButton').click(function () {
    $('#hitButton').removeAttr('disabled');
    $('#standButton').removeAttr('disabled');
  });
}
enableButton();

//Once the stand button is pressed the dealer's second card will display.
function flipDealer() {
  $('#standButton').click(function () {
    $('.secondDealer').removeClass('secondDealer');
  });
};
flipDealer();


/*Renders the player's card on screen using html. I started with divs, but img allowed me to have it side by side. Images were taken from http://richardschneider.github.io/cardsJS/ */
function renderPlayer() {
  if (playerHand.length == 2) {
    for (i = 0; i < playerHand.length; i++) {
      var img = new Image();
      img.src = playerHand[i].ImageSrc;
      img.className = 'cardImage';
      document.getElementById("playerContainer").append(img);
    }
  }
  else if (playerHand.length > 2) {
    var img = new Image();
    img.src = playerHand[playerHand.length - 1].ImageSrc;
    img.className = 'cardImage';
    document.getElementById("playerContainer").append(img);
  }
}

/*Renders the dealer's cards on webpage using html.*/
function renderDealer() {
  if (dealerHand.length == 2) {
    var imgFirst = new Image();
    var imgSecond = new Image();
    imgFirst.src = dealerHand[0].ImageSrc;
    imgFirst.id = "cards";
    imgSecond.src = dealerHand[1].ImageSrc;
    imgSecond.id = "cards";
    imgFirst.className = 'cardImage firstDealer';
    imgSecond.className = 'cardImage secondDealer';
    document.getElementById("dealerContainer").append(imgFirst);
    document.getElementById("dealerContainer").append(imgSecond);
  }

  else if (dealerHand.length > 2) {
    var img = new Image();
    img.src = dealerHand[dealerHand.length - 1].ImageSrc;
    img.id = "cards";
    img.className = 'cardImage';
    document.getElementById("dealerContainer").append(img);
  }
}

//Gets the value of the player's or dealer's hand. Agruments to input are (playerHand, playerHandValue) & (dealerHand, dealerHandValue)
function getHandValue(hand, value) {
  let handValue = hand.map(x => x.IntValue);
  let score = 0;
  let aceCount = 0;
  let newScore = 0;

  for (i = 0; i < handValue.length; i++) {
    if (handValue[i] == 11) {
      aceCount++;
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
  removeChildPlayer();
  removeChildDealer();
  createDeck();
  shuffleDeck();
  dealCards();
  renderPlayer();
  renderDealer();
  document.getElementById("message").innerHTML = "Player's Turn, click 'Hit' to draw or 'Stand' to end turn!";
  document.getElementById("playerHandValue").innerHTML = "Player Score: " + getHandValue(playerHand, playerHandValue);
  document.getElementById("dealerHandValue").innerHTML = "Dealer Score: " + dealerHand[0].IntValue;
  cardCount();
}



//Creating a deck of 52 Cards
//Basic deck idea came from: https://www.thatsoftwaredude.com/content/6196/coding-a-card-deck-in-javascript, I modified it parse integer value and added an image property so I could render the cards.
function createDeck() {
  const suits = ["Spades", "Diamonds", "Clubs", "Hearts"];
  const values = ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"];
  let deck = [];
  for (i = 0; i < suits.length; i++) {
    for (j = 0; j < values.length; j++) {
      let intValue = parseInt(values[i])
      if (values[j] == "J" || values[j] == "Q" || values[j] == "K") {
        intValue = 10;
      }
      else if (values[j] === "A") {
        intValue = 11;
      }
      else if (values[j] != "J" || values[j] != "Q" || values[j] != "K" || values[j] != "A") {
        intValue = values[j];
      }
      const cardImageName = values[j] + suits[i][0];
      let cards = { Value: values[j], Suit: suits[i], IntValue: intValue, ImageSrc: "/cards/" + cardImageName + ".svg" };
      deck.push(cards);
    }
  }

  return deck;
}



//Shuffling the deck. Idea & code taken from: https://devdojo.com/devdojo/create-a-deck-of-cards-in-javascript with my own modifications ofcourse;
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
}

//When player stands and ends turn. Checks if dealer is under 17, if so dealer will draw until reaches 17 or higher.
function stay() {
  document.getElementById("message").innerHTML = "Dealer's Turn!";
  let dealerScore = getHandValue(dealerHand, dealerHandValue);
  if (dealerScore < 17) {
    do {
      let dealerHit = deck.pop();
      dealerHand.push(dealerHit);
      renderDealer();
      document.getElementById("dealerHandValue").innerHTML = "Dealer Score: " + getHandValue(dealerHand, dealerHandValue);
      getHandValue(dealerHand, dealerHandValue);
      dealerScore = getHandValue(dealerHand, dealerHandValue);
      cardCount();
    }
    while (dealerScore <= 17)
    checkDealer();
  }
  else if (dealerScore >= 17) {
    getHandValue(dealerHand, dealerHandValue);
    document.getElementById("dealerHandValue").innerHTML = "Dealer Score: " + getHandValue(dealerHand, dealerHandValue);
    checkDealer();
    cardCount();
  }
  
}

//Count how many manys remaining. I set it the page to refresh when the card count is 0 so a new deck is out and player could continue playing.
function cardCount() {
  deckCount = deck.length
  document.getElementById("deckCount").innerHTML = "Cards Remaining: " + deckCount;
  if (deckCount == 0) {
    window.alert("Oh no, out of cards. Click 'New Game' to get a new deck!");
    document.getElementById("message").innerHTML = "Oh no, out of cards. Click 'New Game' to get a new deck!";
    window.location.reload();
  }
  return deckCount;
}

//Check player score and to see if they busted.
function check() {
  let score = getHandValue(playerHand, playerHandValue)
  if (score > 21) {
    document.getElementById("message").innerHTML = "Busted, you lose! Click 'New Game' to play again!";
    $('#standButton').attr('disabled', 'disabled');
    $('#hitButton').attr('disabled', 'disabled');
  }
}

//Check to see if player or dealer won. 
function checkDealer() {
  let playerScore = getHandValue(playerHand, playerHandValue);
  let dealerScore = getHandValue(dealerHand, dealerHandValue);
  if (playerScore > dealerScore && dealerScore > 16 && dealerScore <= 21) {
    document.getElementById("message").innerHTML = "Nice, you won! Click 'New Game' to play again!";
  }
  if (playerScore < dealerScore && dealerScore > 16 && dealerScore <= 21) {
    document.getElementById("message").innerHTML = "You lost! Click 'New Game' to play again!";
  }
  if (playerScore == dealerScore && dealerScore > 16) {
    document.getElementById("message").innerHTML = "Tie Game! Click 'New Game' to play again!";
  }
  if (dealerScore > 21) {
    document.getElementById("message").innerHTML = "Dealer busted! You won! Click 'New Game' to play again!";
  }

}


//Removes all the player's cards that were in play by removing the child.
function removeChildPlayer() {
  let element = document.getElementById("playerContainer");
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

//Removes all the dealer's cards that were in play by removing the child.
function removeChildDealer() {
  let element = document.getElementById("dealerContainer");
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

