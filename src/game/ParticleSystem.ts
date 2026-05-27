import { COLORS } from './config';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export class ParticleSystem {
  particles: Particle[] = [];

  create(x: number, y: number, color: string) {
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 4;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 3,
        color,
        alpha: 1,
        life: 1,
        maxLife: 1,
      });
    }
  }

  createTrail(x: number, y: number) {
    this.particles.push({
      x, y,
      vx: -2,
      vy: Math.random() * 2 - 1,
      size: Math.random() * 4 + 2,
      color: COLORS.PLAYER,
      alpha: 0.6,
      life: 0.5,
      maxLife: 0.5,
    });
  }

  createPadBurst(x: number, y: number, color: string) {
    for (let i = 0; i < 10; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
      const speed = Math.random() * 6 + 3;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color,
        alpha: 1,
        life: 0.7,
        maxLife: 0.7,
      });
    }
  }

  update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt * 0.016;
      p.y += p.vy * dt * 0.016;
      p.vy += 5 * dt * 0.016;
      p.life -= 0.02 * dt * 0.016;
      p.alpha = p.life / p.maxLife;
      
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number) {
    for (const p of this.particles) {
      const screenX = p.x - cameraX;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fillRect(screenX - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }
}