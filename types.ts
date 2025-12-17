export enum GameScreen {
  HOME = 'HOME',
  PLAYING = 'PLAYING',
  RESULT = 'RESULT',
}

export enum ItemType {
  FOOD_BURGER = 'FOOD_BURGER',
  FOOD_PIZZA = 'FOOD_PIZZA',
  ENEMY_X = 'ENEMY_X',
  ENEMY_SKULL = 'ENEMY_SKULL',
}

export interface GameObject {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: ItemType;
  speed: number;
  active: boolean;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  active: boolean;
}

export interface Spawner {
  id: string;
  x: number;
  y: number;
  direction: number; // 1 for right, -1 for left
  type: 'DEMON' | 'CHEF';
  nextSpawnTime: number;
}