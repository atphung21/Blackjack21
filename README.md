# ATP Blackjack Demo

Professional Blackjack demo for ATP Software Consulting Services.

## Run standalone

```bash
cd Blackjack21
npx serve .
```

## Run inside consulting site (React)

The game is copied to `business-web-template/public/blackjack/` and served at:

**http://localhost:3000/blackjack** (React shell + iframe)  
**http://localhost:3000/blackjack/index.html** (game only)

From the React app root:

```bash
cd business-web-template
npm start
```

After editing files in `Blackjack21/`, recopy to public:

```bash
cp -R ../Blackjack21 ./public/blackjack
rm -rf ./public/blackjack/.git
```

## Features

- Chip bank, betting, 3:2 Blackjack
- Double down & split pairs
- Insurance when dealer shows Ace (2:1)
- Web Audio sound effects (toggle on/off)
- Session stats (localStorage)
- Keyboard shortcuts

## Structure

```
js/
  main.js       — UI wiring
  game.js       — rules & state
  deck.js       — deck & shuffle
  hand.js       — scoring & split check
  ui.js         — DOM render
  sounds.js     — Web Audio FX
  stats.js      — persistence
  constants.js
css/styles.css
cards/          — SVG deck
```
