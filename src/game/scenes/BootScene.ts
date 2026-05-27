import Phaser from 'phaser';
import { COLORS } from '../config';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Create graphics for particles
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // Particle texture
    graphics.fillStyle(COLORS.PARTICLE, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('particle', 16, 16);
    graphics.clear();
    
    // Trail particle
    graphics.fillStyle(COLORS.PLAYER_GLOW, 0.8);
    graphics.fillCircle(6, 6, 6);
    graphics.generateTexture('trail', 12, 12);
    graphics.clear();
    
    // Star particle
    graphics.fillStyle(COLORS.STAR, 1);
    graphics.fillStar(10, 10, 4, 10, 4);
    graphics.generateTexture('star', 20, 20);
    graphics.destroy();
  }

  create() {
    this.scene.start('GameScene');
  }
}