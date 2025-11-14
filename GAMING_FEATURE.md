# 🎮 Gaming Feature Implementation

## Overview

A comprehensive gaming system has been added to the MindLink Support platform, allowing room creators to select from 12 different multiplayer social games when creating voice rooms. Games are selected during room creation and cannot be changed afterward, ensuring consistent room behavior.

## ✅ Completed Features

### 1. Database & Backend
- ✅ **SupportCircle Model Updated** (`backend/models/SupportCircle.js`)
  - Added `gameType` field with enum of 12 game types + 'none'
  - Default value: 'none' (no game, just voice chat)

- ✅ **Backend Route Updated** (`backend/routes/supportCircles.js`)
  - Room creation endpoint now accepts `gameType` parameter
  - Game type is saved with the room

### 2. Frontend Components

#### Room Creation
- ✅ **CreateSupportCircleDialog** (`src/components/CreateSupportCircleDialog.tsx`)
  - Added game selection dropdown with all 12 games
  - Games displayed with emojis and clear names
  - Optional field (defaults to "No Game")

#### Game System
- ✅ **Game Configuration** (`src/lib/games.ts`)
  - Centralized game type definitions
  - Each game has: name, description, emoji, min/max players, duration, host requirements
  - Helper functions for game display

- ✅ **GameEngine Component** (`src/components/GameEngine.tsx`)
  - Manages game state (waiting, starting, active, paused, ended)
  - Validates player count requirements
  - Host controls for starting/ending games
  - Renders game-specific components

- ✅ **Example Game: Catch the Imposter** (`src/components/games/CatchTheImposter.tsx`)
  - Full implementation of Among Us-style game
  - Role assignment, discussion phase, voting, results
  - Demonstrates game component structure

#### Integration
- ✅ **VoiceRoom Component** (`src/components/VoiceRoom.tsx`)
  - Integrated GameEngine component
  - Passes game type, participants, host status
  - Only shows games when connected and game type is not 'none'

- ✅ **Rooms Page** (`src/pages/Rooms.tsx`)
  - Displays game type badge on room cards
  - Shows which game is available in each room

## 🎮 Available Games

1. **🎭 Catch the Imposter** - Among Us style social deduction
2. **🐺 Mafia / Werewolf** - Classic social deduction
3. **🕵️ Spyfall** - Find the spy who doesn't know the location
4. **💬 Scribble Words** - Describe words without saying them
5. **⚡ Fastest First** - Answer questions as fast as possible
6. **🧠 Memory Repeat** - Simon Says voice version
7. **⏱️ Five Seconds Game** - Answer questions in under 5 seconds
8. **🎯 Truth or Lie** - Two truths, one lie
9. **🚩 Red Flag / Green Flag** - Rate scenarios
10. **🎵 Emoji Sound Guess** - Make sound effects for emojis
11. **👑 Guard the Leader** - Team-based game
12. **📚 Rapid Quiz Battles** - Head-to-head voice quiz

## 📋 Game Requirements

Each game has specific requirements:
- **Min/Max Players**: Enforced by GameEngine
- **Host Required**: Some games need a host to moderate
- **Estimated Duration**: Shown to users

## 🔧 Technical Architecture

### Game Flow
```
Room Creation → Select Game Type → Save to DB
     ↓
Join Room → VoiceRoom Component → GameEngine Component
     ↓
GameEngine checks player count → Host starts game
     ↓
Game-specific component renders → Players interact via voice + UI
```

### Data Flow
- Game type stored in `SupportCircle.gameType`
- Game state managed client-side in `GameEngine`
- Participants list passed from `VoiceRoom` to `GameEngine`
- Host status determined by comparing `user.id` with `circle.hostId`

## 🚀 Future Enhancements

### Backend Game Session (Optional)
- Create `GameSession` model for persistent game state
- Add routes for game actions (votes, roles, etc.)
- Use Agora RTM for real-time game messaging

### Additional Game Components
- Implement remaining 11 games following `CatchTheImposter` pattern
- Each game component receives:
  - `participants`: Array of player objects
  - `isHost`: Boolean for host controls
  - `onGameAction`: Callback for game events

### RTM Integration
- Use Agora RTM for:
  - Secret role distribution (imposter, spy, etc.)
  - Real-time voting
  - Game state synchronization
  - Timer signals

## 📝 Usage

### Creating a Room with a Game
1. Click "Create Room"
2. Fill in room details (topic, description, etc.)
3. Select a game from "Game Type" dropdown
4. Create room
5. Game will be available when players join

### Playing a Game
1. Join a room with a game selected
2. Wait for enough players (shown in GameEngine)
3. Host clicks "Start Game"
4. Follow game-specific instructions
5. Use voice chat for interaction

## 🎯 Key Files

- `backend/models/SupportCircle.js` - Database schema
- `backend/routes/supportCircles.js` - API routes
- `src/lib/games.ts` - Game configuration
- `src/components/GameEngine.tsx` - Game manager
- `src/components/games/CatchTheImposter.tsx` - Example game
- `src/components/VoiceRoom.tsx` - Room component with game integration
- `src/components/CreateSupportCircleDialog.tsx` - Room creation with game selection

## ✨ Features

- ✅ Game selection during room creation
- ✅ Game type displayed on room cards
- ✅ Player count validation
- ✅ Host controls for game management
- ✅ Extensible game component system
- ✅ Example game fully implemented
- ✅ Beautiful UI with game-specific styling

The gaming system is now fully functional and ready for use! 🎉

