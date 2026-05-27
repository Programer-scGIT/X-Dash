export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_CONFIG: Record<Difficulty, {
  spikeCount: number[];
  spikeOnPlatformChance: number;
  groundSpikeCount: number[];
  gapBetweenObstacles: [number, number];
  platformChance: number;
}> = {
  easy: {
    spikeCount: [1],
    spikeOnPlatformChance: 0,
    groundSpikeCount: [1],
    gapBetweenObstacles: [280, 400],
    platformChance: 0.35,
  },
  medium: {
    spikeCount: [1, 2],
    spikeOnPlatformChance: 0.4,
    groundSpikeCount: [1, 2, 2],
    gapBetweenObstacles: [220, 340],
    platformChance: 0.4,
  },
  hard: {
    spikeCount: [2, 3, 3],
    spikeOnPlatformChance: 0.8,
    groundSpikeCount: [2, 3, 3, 4],
    gapBetweenObstacles: [180, 280],
    platformChance: 0.45,
  },
};

export const COLORS = {
  BG: '#0a0a1a',
  PLAYER: '#00ffaa',
  PLAYER_GLOW: '#00ff88',
  PLATFORM: '#0088ff',
  PLATFORM_TOP: '#00aaff',
  SPIKE: '#ff3366',
  SPIKE_GLOW: '#ff0044',
  ORB_YELLOW: '#ffcc00',
  PAD_YELLOW: '#ffcc00',
};

export const PHYSICS = {
  GRAVITY: 1800,
  JUMP_VELOCITY: -650,
  DOUBLE_JUMP_VELOCITY: -550,
  PAD_JUMP_VELOCITY: -750,
  PLAYER_SPEED: 450,
  ROTATION_SPEED: 8,
};

export const PLAYER_SIZE = 44;