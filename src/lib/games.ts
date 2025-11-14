// Game types configuration and utilities

export type GameType = 
  | 'none'
  | 'imposter'
  | 'mafia'
  | 'spyfall'
  | 'scribble-words'
  | 'fastest-first'
  | 'memory-repeat'
  | 'five-seconds'
  | 'truth-or-lie'
  | 'red-flag-green-flag'
  | 'emoji-sound-guess'
  | 'guard-the-leader'
  | 'rapid-quiz';

export interface GameConfig {
  id: GameType;
  name: string;
  description: string;
  emoji: string;
  minPlayers: number;
  maxPlayers: number;
  estimatedDuration: number; // in minutes
  requiresHost: boolean;
}

export const GAME_CONFIGS: Record<GameType, GameConfig> = {
  none: {
    id: 'none',
    name: 'No Game',
    description: 'Just voice chat',
    emoji: '💬',
    minPlayers: 1,
    maxPlayers: 30,
    estimatedDuration: 0,
    requiresHost: false,
  },
  imposter: {
    id: 'imposter',
    name: 'Catch the Imposter',
    description: 'Among Us style - find the imposter among crewmates',
    emoji: '🎭',
    minPlayers: 4,
    maxPlayers: 10,
    estimatedDuration: 15,
    requiresHost: true,
  },
  mafia: {
    id: 'mafia',
    name: 'Mafia / Werewolf',
    description: 'Classic social deduction game',
    emoji: '🐺',
    minPlayers: 6,
    maxPlayers: 15,
    estimatedDuration: 20,
    requiresHost: true,
  },
  spyfall: {
    id: 'spyfall',
    name: 'Spyfall',
    description: 'Find the spy who doesn\'t know the location',
    emoji: '🕵️',
    minPlayers: 3,
    maxPlayers: 8,
    estimatedDuration: 10,
    requiresHost: true,
  },
  'scribble-words': {
    id: 'scribble-words',
    name: 'Scribble Words',
    description: 'Describe words without saying them',
    emoji: '💬',
    minPlayers: 2,
    maxPlayers: 10,
    estimatedDuration: 10,
    requiresHost: false,
  },
  'fastest-first': {
    id: 'fastest-first',
    name: 'Fastest First',
    description: 'Answer questions as fast as possible',
    emoji: '⚡',
    minPlayers: 2,
    maxPlayers: 10,
    estimatedDuration: 10,
    requiresHost: false,
  },
  'memory-repeat': {
    id: 'memory-repeat',
    name: 'Memory Repeat',
    description: 'Simon Says voice version - repeat and add',
    emoji: '🧠',
    minPlayers: 3,
    maxPlayers: 10,
    estimatedDuration: 10,
    requiresHost: false,
  },
  'five-seconds': {
    id: 'five-seconds',
    name: 'Five Seconds Game',
    description: 'Answer questions in under 5 seconds',
    emoji: '⏱️',
    minPlayers: 2,
    maxPlayers: 10,
    estimatedDuration: 10,
    requiresHost: false,
  },
  'truth-or-lie': {
    id: 'truth-or-lie',
    name: 'Truth or Lie',
    description: 'Two truths, one lie - guess which is the lie',
    emoji: '🎯',
    minPlayers: 3,
    maxPlayers: 10,
    estimatedDuration: 15,
    requiresHost: false,
  },
  'red-flag-green-flag': {
    id: 'red-flag-green-flag',
    name: 'Red Flag / Green Flag',
    description: 'Rate scenarios as red or green flags',
    emoji: '🚩',
    minPlayers: 2,
    maxPlayers: 10,
    estimatedDuration: 10,
    requiresHost: false,
  },
  'emoji-sound-guess': {
    id: 'emoji-sound-guess',
    name: 'Emoji Sound Guess',
    description: 'Make sound effects for emojis, others guess',
    emoji: '🎵',
    minPlayers: 3,
    maxPlayers: 10,
    estimatedDuration: 10,
    requiresHost: false,
  },
  'guard-the-leader': {
    id: 'guard-the-leader',
    name: 'Guard the Leader',
    description: 'Team-based game with leader and distractors',
    emoji: '👑',
    minPlayers: 6,
    maxPlayers: 12,
    estimatedDuration: 15,
    requiresHost: true,
  },
  'rapid-quiz': {
    id: 'rapid-quiz',
    name: 'Rapid Quiz Battles',
    description: 'Head-to-head voice quiz rounds',
    emoji: '📚',
    minPlayers: 2,
    maxPlayers: 10,
    estimatedDuration: 15,
    requiresHost: false,
  },
};

export const getGameConfig = (gameType: GameType): GameConfig => {
  return GAME_CONFIGS[gameType] || GAME_CONFIGS.none;
};

export const getGameDisplayName = (gameType: GameType): string => {
  const config = getGameConfig(gameType);
  return `${config.emoji} ${config.name}`;
};

