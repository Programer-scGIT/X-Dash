import { Player } from './Player';
import { Level } from './Level';
import { ParticleSystem } from './ParticleSystem';
import { COLORS, PHYSICS, PLAYER_SIZE, Difficulty } from './config';

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  player: Player;
  level: Level;
  particles: ParticleSystem;
  
  width: number;
  height: number;
  
  isRunning: boolean = false;
  isDead: boolean = false;
  hasWon: boolean = false;
  score: number = 0;
  difficulty: Difficulty;
  
  cameraX: number = 0;
  groundY: number = 0;
  
  onScore: (score: number) => void;
  onDeath: () => void;
  onVictory: () => void;
  
  animationId: number = 0;
  lastTime: number = 0;
  
  backgroundStars: { x: number; y: number; size: number; alpha: number }[] = [];
  currentPlatform: { x: number; y: number; width: number } | null = null;

  constructor(
    canvas: HTMLCanvasElement, 
    onScore: (score: number) => void, 
    onDeath: () => void, 
    onVictory: () => void,
    difficulty: Difficulty
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onScore = onScore;
    this.onDeath = onDeath;
    this.onVictory = onVictory;
    this.difficulty = difficulty;
    
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    this.groundY = this.height - 80;
    
    this.player = new Player(150, this.groundY - PLAYER_SIZE / 2);
    this.level = new Level(this.groundY, difficulty);
    this.particles = new ParticleSystem();
    
    this.generateStars();
    
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.loop = this.loop.bind(this);
  }

  generateStars() {
    this.backgroundStars = [];
    for (let i = 0; i < 100; i++) {
      this.backgroundStars.push({
        x: Math.random() * this.level.levelLength,
        y: Math.random() * (this.height * 0.7),
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.3,
      });
    }
  }

  handleResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.groundY = this.height - 80;
    this.level.groundY = this.groundY;
    this.generateStars();
  }

  handleKeyDown(e: KeyboardEvent) {
    if (this.isDead || this.hasWon) return;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();
      this.player.jump();
    }
  }

  handlePointerDown(e: PointerEvent) {
    if (this.isDead || this.hasWon) return;
    // Only handle if not on mobile (mobile uses button)
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768;
    if (!isMobile) {
      e.preventDefault();
      this.player.jump();
    }
  }

  jump() {
    if (this.isDead || this.hasWon) return;
    this.player.jump();
  }

  start() {
    this.isRunning = true;
    this.isDead = false;
    this.hasWon = false;
    this.score = 0;
    
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('resize', this.handleResize);
    
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop);
  }

  destroy() {
    this.isRunning = false;
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('resize', this.handleResize);
  }

  die() {
    if (this.isDead || this.hasWon) return;
    this.isDead = true;
    
    for (let i = 0; i < 30; i++) {
      this.particles.create(this.player.x, this.player.y, COLORS.PLAYER);
    }
    
    setTimeout(() => {
      this.onDeath();
    }, 500);
  }

  victory() {
    if (this.hasWon || this.isDead) return;
    this.hasWon = true;
    this.onVictory();
  }

  loop(currentTime: number) {
    if (!this.isRunning) return;
    
    const deltaTime = Math.min((currentTime - this.lastTime) / 16.67, 2);
    this.lastTime = currentTime;
    
    this.update(deltaTime);
    this.render();
    
    requestAnimationFrame(this.loop);
  }

  update(dt: number) {
    if (this.isDead) {
      this.player.updateDead(dt);
      this.particles.update(dt);
      return;
    }
    
    if (this.hasWon) return;
    
    this.player.update(dt, this.groundY);
    this.cameraX = this.player.x - 200;
    
    if (this.player.x >= this.level.levelLength) {
      this.victory();
      return;
    }
    
    const progress = Math.min(100, Math.floor((this.player.x / this.level.levelLength) * 100));
    if (progress !== this.score && progress > this.score) {
      this.score = progress;
      this.onScore(this.score);
    }
    
    this.checkPlatformLeave();
    this.checkCollisions();
    this.particles.update(dt);
    
    if (Math.random() < 0.2 && !this.player.isGrounded) {
      this.particles.createTrail(this.player.x - 20, this.player.y);
    }
  }

  checkPlatformLeave() {
    if (this.currentPlatform && this.player.isGrounded) {
      const plat = this.currentPlatform;
      const playerLeft = this.player.x - PLAYER_SIZE / 2;
      const playerRight = this.player.x + PLAYER_SIZE / 2;
      const platLeft = plat.x - plat.width / 2;
      const platRight = plat.x + plat.width / 2;
      
      if (playerRight < platLeft || playerLeft > platRight) {
        this.player.isGrounded = false;
        this.currentPlatform = null;
      }
    }
  }

  checkCollisions() {
    const playerBounds = this.player.getBounds();
    
    for (const spike of this.level.spikes) {
      if (this.level.isVisible(spike.x, this.cameraX, this.width)) {
        const spikeBounds = {
          x: spike.x - 10,
          y: spike.y - 28,
          width: 20,
          height: 28,
        };
        
        if (this.intersects(playerBounds, spikeBounds)) {
          this.die();
          return;
        }
      }
    }
    
    if (this.player.vy > 0) {
      for (const platform of this.level.platforms) {
        if (this.level.isVisible(platform.x, this.cameraX, this.width)) {
          const platTop = platform.y - 10;
          const platLeft = platform.x - platform.width / 2;
          const platRight = platform.x + platform.width / 2;
          
          const playerBottom = this.player.y + PLAYER_SIZE / 2;
          const playerLeft = this.player.x - PLAYER_SIZE / 2;
          const playerRight = this.player.x + PLAYER_SIZE / 2;
          
          if (playerRight > platLeft && playerLeft < platRight) {
            if (playerBottom >= platTop && playerBottom <= platTop + 20) {
              this.player.y = platTop - PLAYER_SIZE / 2;
              this.player.vy = 0;
              this.player.isGrounded = true;
              this.player.canDoubleJump = true;
              this.player.snapRotation();
              this.currentPlatform = platform;
            }
          }
        }
      }
    }
    
    for (const pad of this.level.pads) {
      if (this.level.isVisible(pad.x, this.cameraX, this.width)) {
        const dx = Math.abs(this.player.x - pad.x);
        const dy = this.player.y - pad.y;
        
        if (dx < 25 && dy > -15 && dy < 15) {
          this.player.padJump();
          this.particles.createPadBurst(pad.x, pad.y, pad.color);
        }
      }
    }
  }

  intersects(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  render() {
    const ctx = this.ctx;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#1a1a3a');
    gradient.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
    
    ctx.fillStyle = '#ffff88';
    for (const star of this.backgroundStars) {
      const screenX = star.x - this.cameraX * 0.2;
      if (screenX > -10 && screenX < this.width + 10) {
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(screenX, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    
    ctx.fillStyle = '#0066aa';
    ctx.fillRect(0, this.groundY, this.width, 80);
    ctx.fillStyle = '#0088cc';
    ctx.fillRect(0, this.groundY, this.width, 8);
    
    ctx.strokeStyle = '#004488';
    ctx.lineWidth = 1;
    for (let x = -((this.cameraX * 0.5) % 50); x < this.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, this.groundY);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    
    const finishX = this.level.levelLength - this.cameraX;
    if (finishX > -50 && finishX < this.width + 50) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
      ctx.fillRect(finishX - 25, 0, 50, this.groundY);
      
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(finishX, 0);
      ctx.lineTo(finishX, this.groundY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('FINISH', finishX, 100);
    }
    
    this.level.render(ctx, this.cameraX, this.width);
    this.player.render(ctx, this.cameraX);
    this.particles.render(ctx, this.cameraX);
  }
}