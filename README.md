# Birthday Website for Your Guy Best Friend

This project is a multi-page, locally run birthday experience designed to feel personal, funny, and cinematic without requiring any framework or backend.

## Folder structure

- `index.html` — secret birthday portal
- `surprise.html` — surprise reveal and emotional reaction
- `talents.html` — a celebration of your friend's many talents
- `roast.html` — playful best-friend roast generator
- `games.html` — arcade with four playable mini-games
- `final.html` — final emotional birthday message
- `vault.html` — hidden vault page with code/riddle access
- `css/style.css` — shared theme, layout, and page styling
- `css/animations.css` — reusable motion effects
- `css/games.css` — arcade-specific game styling
- `js/config.js` — centralized personalization values
- `js/main.js` — shared page initialization and sound control
- `js/navigation.js` — navigation behavior and page state
- `js/surprises.js` — surprise reveal interactions
- `js/roast.js` — roast logic and review ratings
- `js/games.js` — four playable arcade games
- `assets/images/` — placeholder images and photos
- `assets/sounds/` — optional future sound assets
- `assets/icons/` — optional icons and assets

## Run locally

1. Open the project folder in VS Code.
2. Right-click `index.html` and select "Open with Live Server" or use the Live Server extension.
3. Alternatively, open `index.html` directly in a browser.

## Personalization

Edit `js/config.js` to customize the site:

- `name` — replace with his name or nickname
- `birthdayGreeting` — change the greeting phrase
- `friendshipStartDate` — set the date your friendship started
- `trivia` — edit questions and answers
- `secretVaultCode` — set a code for the vault
- `vaultRiddle` — set a custom riddle or clue
- `roastMessages` and `roastCombacks` — customize the roast text
- `birthdayLetter` — personalize the final emotional text

On `talents.html`, use **Add photo** on each skill card to choose a picture (up to 8 MB). Photos are saved in that browser and can be removed with **Remove photo**; they are not uploaded or shared with other devices.

## Testing checklist

- [ ] Home page loads and links to the surprise page
- [ ] Surprise page reveals the birthday message and confetti
- [ ] Talents page displays all seven skills
- [ ] Talent photos can be added, saved, and removed in the browser
- [ ] Roast page generates new jokes and defense lines
- [ ] Arcade menu opens each game panel
- [ ] Cake game tracks score, timer, and restart logic
- [ ] Trivia game cycles through questions and results
- [ ] Memory match game shuffles, matches, and replay works
- [ ] Reaction challenge measures response time and handles early clicks
- [ ] Final message opens the letter and routes back to the homepage
- [ ] Secret vault unlocks with the configured code or riddle
- [ ] Sound toggle works and stays disabled when user chooses
- [ ] Navigation remains functional on mobile and desktop

## Notes

The project is intentionally framework-free and uses browser-native JavaScript plus CSS animations. It runs without any backend or external libraries.
