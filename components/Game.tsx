import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  GAME_DURATION, 
  PLAYER_WIDTH, 
  PLAYER_HEIGHT, 
  PLAYER_Y_OFFSET,
  ITEM_SIZE,
  BULLET_SIZE,
  BULLET_SPEED,
  SCORE_MAP
} from '../constants';
import { GameObject, Bullet, Spawner, ItemType } from '../types';

interface GameProps {
  onFinish: (score: number) => void;
}

export const Game: React.FC<GameProps> = ({ onFinish }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game State Refs (for Loop)
  const gameStateRef = useRef({
    score: 0,
    playerX: CANVAS_WIDTH / 2,
    items: [] as GameObject[],
    bullets: [] as Bullet[],
    lastTime: 0,
    lastUiSyncTime: 0,
    timeLeft: GAME_DURATION,
    isPlaying: true,
  });

  // Entities - Using a list to manage multiple spawners dynamically
  const spawnersRef = useRef<Spawner[]>([]);

  // React State for UI Overlay (updated less frequently)
  const [uiScore, setUiScore] = useState(0);
  const [uiTime, setUiTime] = useState(GAME_DURATION);

  // Initialize Spawners
  useEffect(() => {
    // Initial spawners: 1 Demon, 1 Chef
    spawnersRef.current = [
      { id: 'demon-1', x: 50, y: 60, direction: 1, type: 'DEMON', nextSpawnTime: 0 },
      { id: 'chef-1', x: CANVAS_WIDTH - 50, y: 60, direction: -1, type: 'CHEF', nextSpawnTime: 0 }
    ];
  }, []);

  // Helper: Spawn Item
  const spawnItem = (spawner: Spawner) => {
    const isDemon = spawner.type === 'DEMON';
    let type: ItemType;
    
    if (isDemon) {
      type = Math.random() > 0.6 ? ItemType.ENEMY_SKULL : ItemType.ENEMY_X;
    } else {
      type = Math.random() > 0.5 ? ItemType.FOOD_BURGER : ItemType.FOOD_PIZZA;
    }

    // Speed increases as time decreases
    const progress = 1 - (gameStateRef.current.timeLeft / GAME_DURATION);
    const itemSpeed = 3 + (progress * 4); // 3 to 7

    gameStateRef.current.items.push({
      id: Date.now() + Math.random(),
      x: spawner.x,
      y: spawner.y + 40,
      width: ITEM_SIZE,
      height: ITEM_SIZE,
      type,
      speed: itemSpeed,
      active: true,
    });
  };

  // Helper: Calculate next spawn time
  const getNextSpawnDelay = (timeLeft: number) => {
    // 0 (start) to 1 (end)
    const progress = 1 - (timeLeft / GAME_DURATION);
    
    // Base delay decreases from 1500ms down to 400ms
    const baseDelay = 1500 - (progress * 1100); 
    
    // Random jitter 0-600ms to desynchronize
    const jitter = Math.random() * 600;
    
    return baseDelay + jitter;
  };

  // Helper: Check Collision (Box)
  const isColliding = (rect1: {x: number, y: number, width: number, height: number}, rect2: {x: number, y: number, width: number, height: number}) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  };

  // Core Loop
  const gameLoop = useCallback((timestamp: number) => {
    if (!gameStateRef.current.isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;
    
    // Initialize timing on first frame
    if (state.lastTime === 0) {
      state.lastTime = timestamp;
      // Set initial spawn times
      spawnersRef.current.forEach(s => {
        s.nextSpawnTime = timestamp + Math.random() * 1000;
      });
    }

    const deltaTime = timestamp - state.lastTime;
    state.lastTime = timestamp;

    // 1. Logic Update
    
    // Timer
    state.timeLeft -= deltaTime / 1000;
    if (state.timeLeft <= 0) {
      state.isPlaying = false;
      onFinish(state.score);
      return;
    }

    const elapsed = GAME_DURATION - state.timeLeft;

    // Dynamic Level Design: Add Demons over time
    // 10 seconds in -> Add 2nd Demon
    if (elapsed > 10 && spawnersRef.current.filter(s => s.type === 'DEMON').length < 2) {
       spawnersRef.current.push({
         id: 'demon-2',
         x: CANVAS_WIDTH / 2, // Start middle
         y: 60,
         direction: Math.random() > 0.5 ? 1 : -1,
         type: 'DEMON',
         nextSpawnTime: timestamp + 1000 // Short delay before firing
       });
    }
    // 20 seconds in -> Add 3rd Demon
    if (elapsed > 20 && spawnersRef.current.filter(s => s.type === 'DEMON').length < 3) {
       spawnersRef.current.push({
         id: 'demon-3',
         x: 40, // Start left
         y: 60,
         direction: 1,
         type: 'DEMON',
         nextSpawnTime: timestamp + 1000
       });
    }

    // Update Spawners
    spawnersRef.current.forEach(spawner => {
      // Move
      spawner.x += spawner.direction * 2.5; // Slightly faster movement
      if (spawner.x < 40 || spawner.x > CANVAS_WIDTH - 40) {
        spawner.direction *= -1;
      }

      // Check Spawn Timer
      if (timestamp >= spawner.nextSpawnTime) {
        spawnItem(spawner);
        spawner.nextSpawnTime = timestamp + getNextSpawnDelay(state.timeLeft);
      }
    });

    // Update Items
    state.items.forEach(item => {
      item.y += item.speed;
      
      // Collision with Player
      const playerRect = {
        x: state.playerX - PLAYER_WIDTH / 2,
        y: CANVAS_HEIGHT - PLAYER_Y_OFFSET,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT
      };

      if (item.active && isColliding(item, playerRect)) {
        item.active = false;
        state.score += SCORE_MAP[item.type];
      }

      // Out of bounds
      if (item.y > CANVAS_HEIGHT) item.active = false;
    });

    // Update Bullets
    state.bullets.forEach(bullet => {
      bullet.y -= bullet.speed;
      
      // Collision with Items
      state.items.forEach(item => {
        if (item.active && bullet.active && isColliding(bullet, item)) {
          item.active = false;
          bullet.active = false;
          // Shooting items doesn't give points, just clears them
        }
      });

      if (bullet.y < 0) bullet.active = false;
    });

    // Cleanup inactive
    state.items = state.items.filter(i => i.active);
    state.bullets = state.bullets.filter(b => b.active);

    // 2. Render
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Spawners
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    spawnersRef.current.forEach(spawner => {
      const icon = spawner.type === 'DEMON' ? '😈' : '👨‍🍳';
      ctx.fillText(icon, spawner.x, spawner.y);
    });

    // Draw Items
    state.items.forEach(item => {
      let icon = '';
      switch(item.type) {
        case ItemType.FOOD_BURGER: icon = '🍔'; break;
        case ItemType.FOOD_PIZZA: icon = '🍕'; break;
        case ItemType.ENEMY_X: icon = '❌'; break;
        case ItemType.ENEMY_SKULL: icon = '💀'; break;
      }
      ctx.fillText(icon, item.x + item.width/2, item.y + item.height/2);
    });

    // Draw Bullets
    ctx.fillStyle = '#facc15'; // Yellow
    state.bullets.forEach(bullet => {
      ctx.beginPath();
      ctx.arc(bullet.x + bullet.width/2, bullet.y + bullet.height/2, BULLET_SIZE/2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Player (Hands)
    ctx.font = '60px Arial';
    ctx.fillText('👐', state.playerX, CANVAS_HEIGHT - PLAYER_Y_OFFSET + 30);

    // 3. Sync UI (Time-based sync, e.g., every 100ms)
    if (timestamp - state.lastUiSyncTime > 100) {
      setUiScore(state.score);
      setUiTime(Math.max(0, Math.ceil(state.timeLeft)));
      state.lastUiSyncTime = timestamp;
    }

    requestAnimationFrame(gameLoop);
  }, [onFinish]);

  // Input Handling
  const handleInput = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Map screen X to canvas X
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const canvasX = (clientX - rect.left) * scaleX;

    // Clamp
    gameStateRef.current.playerX = Math.max(PLAYER_WIDTH/2, Math.min(CANVAS_WIDTH - PLAYER_WIDTH/2, canvasX));
  }, []);

  const handleShoot = useCallback(() => {
    if (!gameStateRef.current.isPlaying) return;
    
    gameStateRef.current.bullets.push({
      id: Date.now() + Math.random(),
      x: gameStateRef.current.playerX - BULLET_SIZE / 2,
      y: CANVAS_HEIGHT - PLAYER_Y_OFFSET,
      width: BULLET_SIZE,
      height: BULLET_SIZE,
      speed: BULLET_SPEED,
      active: true,
    });
  }, []);

  useEffect(() => {
    // Reset state on mount/remount
    gameStateRef.current.lastTime = 0;
    gameStateRef.current.isPlaying = true;
    
    const animId = requestAnimationFrame(gameLoop);
    
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Stop scrolling
      handleInput(e.touches[0].clientX);
    };
    
    const onMouseMove = (e: MouseEvent) => {
      handleInput(e.clientX);
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('touchmove', onTouchMove, { passive: false });
      canvas.addEventListener('mousemove', onMouseMove);
    }

    return () => {
      cancelAnimationFrame(animId);
      gameStateRef.current.isPlaying = false;
      if (canvas) {
        canvas.removeEventListener('touchmove', onTouchMove);
        canvas.removeEventListener('mousemove', onMouseMove);
      }
    };
  }, [gameLoop, handleInput]);

  return (
    <div className="relative w-full h-full bg-slate-800 overflow-hidden flex justify-center">
      {/* HUD */}
      <div className="absolute top-4 left-4 z-10 bg-black/40 px-4 py-2 rounded-lg text-white font-mono font-bold border border-white/10 backdrop-blur-sm">
        時間: {uiTime}s
      </div>
      <div className={`absolute top-4 right-4 z-10 px-4 py-2 rounded-lg font-mono font-bold border backdrop-blur-sm transition-colors duration-300 ${
        uiScore >= 200 ? 'bg-yellow-500/80 text-white border-yellow-300' : 'bg-black/40 text-white border-white/10'
      }`}>
        分數: {uiScore}
      </div>

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="h-full w-full max-w-[480px] bg-gradient-to-b from-slate-700 to-slate-900 shadow-2xl cursor-crosshair touch-none"
        onMouseDown={handleShoot}
        onTouchStart={(e) => {
          // e.preventDefault();
          handleInput(e.touches[0].clientX);
          handleShoot();
        }}
      />
      
      <div className="absolute bottom-4 text-white/30 text-xs pointer-events-none">
        點擊射擊 / 拖曳移動
      </div>
    </div>
  );
};