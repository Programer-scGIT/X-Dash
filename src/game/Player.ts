import { COLORS, PHYSICS, PLAYER_SIZE } from './config';

export class Player {
  x: number;
  y: number;
  vy: number = 0;
  
  rotation: number = 0;
  rotationSpeed: number = 0;
  
  isGrounded: boolean = false;
  canDoubleJump: boolean = false;
  isDead: boolean = false;
  
  squashX: number = 1;
  squashY: number = 1;
  glowScale: number = 1;
  glowAlpha: number = 0.4;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  jump() {
    if (this.isDead) return;
    
    if (this.isGrounded) {
      this.vy = PHYSICS.JUMP_VELOCITY;
      this.isGrounded = false;
      this.canDoubleJump = true;
      this.rotationSpeed = PHYSICS.ROTATION_SPEED;
      this.playJumpEffect();
    } else if (this.canDoubleJump) {
      this.vy = PHYSICS.DOUBLE_JUMP_VELOCITY;
      this.canDoubleJump = false;
      this.rotationSpeed = PHYSICS.ROTATION_SPEED * 1.5;
      this.playJumpEffect();
    }
  }

  padJump() {
    if (this.isDead) return;
    this.vy = PHYSICS.PAD_JUMP_VELOCITY;
    this.rotationSpeed = PHYSICS.ROTATION_SPEED * 1.2;
    this.isGrounded = false;
    this.canDoubleJump = true;
    this.playJumpEffect();
  }

  playJumpEffect() {
    this.squashX = 1.3;
    this.squashY = 0.7;
    this.glowScale = 1.5;
    this.glowAlpha = 0.8;
  }

  snapRotation() {
    const targetRotation = Math.round(this.rotation / (Math.PI / 2)) * (Math.PI / 2);
    this.rotation = targetRotation;
    this.rotationSpeed = 0;
  }

  updateDead(dt: number) {
    this.vy += 2000 * dt * 0.016;
    this.y += this.vy * dt * 0.016;
    this.rotation += this.rotationSpeed * dt * 0.016;
  }

  update(dt: number, groundY: number) {
    this.x += PHYSICS.PLAYER_SPEED * dt * 0.016;
    
    if (!this.isGrounded) {
      this.vy += PHYSICS.GRAVITY * dt * 0.016;
      this.y += this.vy * dt * 0.016;
      this.rotation += this.rotationSpeed * dt * 0.016;
    }
    
    if (this.y >= groundY - PLAYER_SIZE / 2) {
      this.y = groundY - PLAYER_SIZE / 2;
      this.vy = 0;
      this.isGrounded = true;
      this.canDoubleJump = true;
      this.snapRotation();
    }
    
    this.squashX += (1 - this.squashX) * 0.2;
    this.squashY += (1 - this.squashY) * 0.2;
    this.glowScale += (1 - this.glowScale) * 0.15;
    this.glowAlpha += (0.4 - this.glowAlpha) * 0.15;
  }

  getBounds() {
    return {
      x: this.x - PLAYER_SIZE / 2 + 4,
      y: this.y - PLAYER_SIZE / 2 + 4,
      width: PLAYER_SIZE - 8,
      height: PLAYER_SIZE - 8,
    };
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number) {
    const screenX = this.x - cameraX;
    
    ctx.save();
    ctx.translate(screenX, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.squashX, this.squashY);
    
    const glowSize = PLAYER_SIZE * this.glowScale;
    ctx.fillStyle = COLORS.PLAYER_GLOW;
    ctx.globalAlpha = this.glowAlpha;
    ctx.fillRect(-glowSize / 2, -glowSize / 2, glowSize, glowSize);
    ctx.globalAlpha = 1;
    
    ctx.fillStyle = this.isDead ? COLORS.SPIKE : COLORS.PLAYER;
    ctx.fillRect(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(-PLAYER_SIZE / 2 + 8, -PLAYER_SIZE / 2 + 8, PLAYER_SIZE - 16, PLAYER_SIZE - 16);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(8, -5, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(10, -7, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
}