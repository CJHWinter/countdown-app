# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🛠️ Development Commands

### Running the Application
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Access at `http://localhost:8000`

### Project Structure
```
倒计时氛围感/
├── index.html          # Main entry point
├── styles.css          # Stylesheet with CSS variables
├── app.js             # Core application logic (CountdownApp class)
├── quotes.json        # 500+ quotes database
├── assets/
│   ├── audio/         # Sound effects
│   └── fonts/         # Optional fonts
└── README.md          # Project documentation
```

## 🏗️ Architecture Overview

### Core Components
- **CountdownApp class**: Main application controller managing all functionality
- **Modular design**: Separated concerns for time management, UI, audio, and quotes
- **Event-driven architecture**: Decoupled components communicating through events
- **Centralized state management**: Persists settings via localStorage

### Key Modules
- **Time Management**: Handles countdown logic and Beijing time sync
- **UI Components**: Digital clock display with flip animation
- **Quote System**: Manages 500+ quotes with filtering and typing animation
- **Audio System**: Handles sound effects and music with caching

### Development Notes
- Pure frontend app (HTML/CSS/JS) with no dependencies
- Uses CSS variables for theming (`--accent-primary`, `--bg-primary`, etc.)
- Main entry point: `index.html` with logic in `app.js`
- Time calibration uses multiple APIs with fallback to local time
- Audio files need to be added to `assets/audio/` (MP3 + OGG formats)

## 💡 Common Tasks

### Adding New Quotes
Edit `quotes.json`:
```json
{
  "text": "New quote text",
  "author": "Author Name",
  "tags": ["time", "focus"]
}
```

### Theming
Modify CSS variables in `styles.css`:
```css
:root {
  --accent-primary: #00d4ff;
  --accent-secondary: #ff6b35;
  --bg-primary: #0a0a0a;
}
```

### Debugging
- Check console logs for API errors
- Use `localStorage.clear()` to reset settings
- Verify audio files exist in correct paths