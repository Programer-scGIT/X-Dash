import { COLORS, Difficulty, DIFFICULTY_CONFIG } from './config';

interface Spike { x: number; y: number; }
interface Platform { x: number; y: number; width: number; }
interface Pad { x: number; y: number; color: string; }

export class Level {
  spikes: Spike[] = [];
  platforms: Platform[] = [];
  pads: Pad[] = [];
  groundY: number;
  levelLength: number = 15000;
  difficulty: Difficulty;

  constructor(groundY: number, difficulty: Difficulty) {
    this.groundY = groundY;
    this.difficulty = difficulty;
    this.generate();
  }

  generate() {
    const config = DIFFICULTY_CONFIG[this.difficulty];
    let x = 600;
    
    this.addSpike(x);
    x += 400;
    
    while (x < this.levelLength - 500) {
      const rand = Math.random();
      
      if (rand < config.platformChance) {
        const height = 80 + Math.random() * 60;
        const width = 100 + Math.random() * 80;
        const platY = this.groundY - height;
        
        this.addPlatform(x, platY, width);
        
        if (Math.random() < config.spikeOnPlatformChance) {
          const spikeCount = config.spikeCount[Math.floor(Math.random() * config.spikeCount.length)];
          const spikeStartX = x - (spikeCount - 1) * 17.5;
          for (let i = 0; i < spikeCount; i++) {
            this.addSpike(spikeStartX + i * 35, platY - 10);
          }
        }
        
        x += width + 200;
      } else {
        const spikeCount = config.groundSpikeCount[Math.floor(Math.random() * config.groundSpikeCount.length)];
        for (let i = 0; i < spikeCount; i++) {
          this.addSpike(x + i * 35);
        }
        x += spikeCount * 35 + 50;
      }
      
      const gap = config.gapBetweenObstacles[0] + Math.random() * (config.gapBetweenObstacles[1] - config.gapBetweenObstacles[0]);
      x += gap;
      
      if (Math.random() < 0.15) {
        this.addPad(x);
        x += 100;
      }
    }
  }

  addSpike(x: number, y?: number) {
    this.spikes.push({ x, y: y ?? this.groundY });
  }

  addPlatform(x: number, y: number, width: number) {
    this.platforms.push({ x, y, width });
  }

  addPad(x: number) {
    this.pads.push({ x, y: this.groundY - 8, color: COLORS.PAD_YELLOW });
  }

  isVisible(objX: number, cameraX: number, width: number) {
    return objX > cameraX - 100 && objX < cameraX + width + 100;
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, width: number) {
    for (const platform of this.platforms) {
      if (this.isVisible(platform.x, cameraX, width)) {
        const screenX = platform.x - cameraX;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(screenX - platform.width / 2 + 4, platform.y - 8, platform.width, 20);
        
        ctx.fillStyle = COLORS.PLATFORM;
        ctx.fillRect(screenX - platform.width / 2, platform.y - 10, platform.width, 20);
        
        ctx.fillStyle = COLORS.PLATFORM_TOP;
        ctx.fillRect(screenX - platform.width / 2, platform.y - 10, platform.width, 4);
      }
    }
    
    for (const spike of this.spikes) {
      if (this.isVisible(spike.x, cameraX, width)) {
        const screenX = spike.x - cameraX;
        const screenY = spike.y;
        
        ctx.fillStyle = COLORS.SPIKE_GLOW;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.moveTo(screenX - 14, screenY);
        ctx.lineTo(screenX, screenY - 35);
        ctx.lineTo(screenX + 14, screenY);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        
        ctx.fillStyle = COLORS.SPIKE;
        ctx.beginPath();
        ctx.moveTo(screenX - 12, screenY);
        ctx.lineTo(screenX, screenY - 28);
        ctx.lineTo(screenX + 12, screenY);
        ctx.closePath();
        ctx.fill();
      }
    }
    
    for (const pad of this.pads) {
      if (this.isVisible(pad.x, cameraX, width)) {
        const screenX = pad.x - cameraX;
        
        ctx.fillStyle = pad.color;
        ctx.globalAlpha = 0.4;
        ctx.fillRect(screenX - 27, pad.y - 10, 54, 18);
        ctx.globalAlpha = 1;
        
        ctx.fillStyle = pad.color;
        ctx.fillRect(screenX - 25, pad.y - 8, 50, 16);
        
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(screenX, pad.y - 16);
        ctx.lineTo(screenX - 8, pad.y - 6);
        ctx.lineTo(screenX + 8, pad.y - 6);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }
}