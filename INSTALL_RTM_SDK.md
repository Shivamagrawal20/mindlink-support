# 📦 Install Agora RTM SDK

The gaming features require the Agora RTM (Real-Time Messaging) SDK for real-time game synchronization.

## Installation

Run this command in your project root:

```bash
npm install agora-rtm-sdk
```

Or if using yarn:

```bash
yarn add agora-rtm-sdk
```

## Why It's Needed

The RTM SDK enables:
- ✅ Secret role distribution (e.g., telling only the imposter their role)
- ✅ Real-time voting synchronization
- ✅ Game state updates across all players
- ✅ Phase transitions broadcast to everyone

Without it, games will still work but won't have real-time synchronization.

## After Installation

Once installed, the gaming features will automatically use RTM for:
- Role assignments in games like "Catch the Imposter"
- Voting in social deduction games
- Game phase transitions
- Real-time score updates

No additional configuration needed - it uses the same Agora credentials as voice chat!

