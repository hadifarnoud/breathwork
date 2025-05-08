# Breathwork App

A Progressive Web App (PWA) that guides users through breathing exercises to reduce stress and improve well-being.

## Features

### Core Functionality
- **Guided Breathing Timer:** Follow visual and audio cues through inhale, hold, and exhale phases
- **Customizable Breathing Patterns:** Choose from presets (Box Breathing, 4-7-8 Relaxing, Wim Hof) or create your own
- **Flexible Session Lengths:** Choose how long to practice (1:15, 2:30, 5, or 10 minutes)
- **Progress Tracking:** Monitor daily practice, build streaks, and view your progress on a calendar

### Advanced Features
- **Achievement System:** Earn achievements as you develop your breathing practice
- **Streak Tracking:** Keep track of consecutive days practiced
- **Dark/Light Mode:** Choose your preferred visual theme
- **Audio Controls:** Adjust sound volume or mute completely
- **Interactive Tutorial:** Guided walkthrough for new users
- **Full Offline Support:** Works without an internet connection (PWA)

## Getting Started

### Installation
1. Visit the app in a web browser
2. On mobile, tap "Add to Home Screen" when prompted
3. On desktop, look for the install icon in the address bar

### Using the App
1. Choose a breathing pattern (or create your own)
2. Select your desired session length
3. Press Start to begin your guided breathing session
4. Follow the on-screen instructions and timer

## Technical Details

The Breathwork app is built with:
- HTML5, CSS3, and vanilla JavaScript
- Progressive Web App (PWA) technologies for offline use
- LocalStorage for tracking user data and preferences
- Service Worker for caching assets and offline functionality

## Development

### Project Structure
- `index.html` - Main app structure
- `style.css` - All styling and animations
- `app.js` - Core app functionality
- `achievements.js` - Achievement and streak tracking system
- `tutorial.js` - First-time user tutorial
- `service-worker.js` - PWA offline functionality
- `manifest.json` - PWA installation configuration

### Future Development
See the `development-plan.md` file for the roadmap of planned improvements and enhancements. 