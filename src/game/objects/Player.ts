import Phaser from 'phaser';
import { COLORS, PHYSICS, PLAYER_SIZE } from '../config';

export class Player extends Phaser.GameObjects.Container {
  body!: Phaser.Physics.Arcade.Body;
  cube: Phaser.GameObjects.Rectangle;
  glow: Phaser.GameObjects.Rectangle;
  innerGlow: Phaser.GameObjects.Rectangle;
  
  isGrounded: boolean = false;
  canDoubleJump: boolean = false;
  canOrbJump: boolean = false;
  isDead: boolean = false;
  
  rotationSpeed: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    
    // Create glow effect
    this.glow = scene.add.rectangle(0, 0, PLAYER_SIZE + 8, PLAYER_SIZE + 8, COLORS.PLAYER_GLOW, 0.4);
    this.add(this.glow);
    
    // Create main cube
    this.cube = scene.add.rectangle(0, 0, PLAYER_SIZE, PLAYER_SIZE, COLORS.PLAYER);
    this.add(this.cube);
    
    // Inner glow/highlight
    this.innerGlow = scene.add.rectangle(0, 0, PLAYER_SIZE - 10, PLAYER_SIZE - 10, 0xffffff, 0.3);
    this.add(this.innerGlow);
    
    // Add physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.body.setSize(PLAYER_SIZE, PLAYER_SIZE);
    this.body.setCollideWorldBounds(true);
    this.body.setBounce(0, 0);
    this.body.setGravityY(0);
    
    // Glow pulse animation
    scene.tweens.add({
      targets: this.glow,
      alpha: { from: 0.3, to: 0.6 },
      scale: { from: 1, to: 1.1 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  jump() {
    if (this.isDead) return;
    
    if (this.body.touching.down || this.body.blocked.down) {
      this.body.setVelocityY(PHYSICS.JUMP_VELOCITY);
      this.canDoubleJump = true;
      this.canOrbJump = false;
      this.rotationSpeed = PHYSICS.ROTATION_SPEED;
      this.playJumpEffect();
    } else if (this.canDoubleJump) {
      this.body.setVelocityY(PHYSICS.DOUBLE_JUMP_VELOCITY);
      this.canDoubleJump = false;
      this.rotationSpeed = PHYSICS.ROTATION_SPEED * 1.5;
      this.playJumpEffect();
    }
  }

  orbJump(velocity: number) {
    if (this.isDead) return;
    this.body.setVelocityY(velocity);
    this.rotationSpeed = PHYSICS.ROTATION_SPEED;
    this.playJumpEffect();
  }

  padJump(velocity: number) {
    if (this.isDead) return;
    this.body.setVelocityY(velocity);
    this.rotationSpeed = PHYSICS.ROTATION_SPEED * 1.2;
    this.playJumpEffect();
  }

  playJumpEffect() {
    // Scale squash effect
    this.scene.tweens.add({
      targets: this.cube,
      scaleY: 0.7,
      scaleX: 1.3,
      duration: 50,
      yoyo: true,
      ease: 'Power2',
    });
    
    // Glow burst
    this.scene.tweens.add({
      targets: this.glow,
      scale: 1.5,
      alpha: 0.8,
      duration: 100,
      yoyo: true,
    });
  }

  die() {
    this.isDead = true;
    this.body.setVelocity(0, -600);
    this.body.setGravityY(1500);
    this.rotationSpeed = 720;
    
    // Flash white then red
    this.cube.setFillStyle(0xffffff);
    this.scene.time.delayedCall(100, () => {
      this.cube.setFillStyle(COLORS.SPIKE);
    });
  }

  update() {
    // Check if grounded
    this.isGrounded = this.body.touching.down || this.body.blocked.down;
    
    // Update orb jump availability
    this.canOrbJump = !this.isGrounded;
    
    // Rotation animation
    if (this.isGrounded && !this.isDead) {
      // Snap to nearest 90 degrees when landing
      const nearestRotation = Math.round(this.rotation / (Math.PI / 2)) * (Math.PI / 2);
      if (Math.abs(this.rotation - nearestRotation) > 0.01) {
        this.rotation = Phaser.Math.Linear(this.rotation, nearestRotation, 0.3);
      } else {
        this.rotation = nearestRotation;
      }
      this.rotationSpeed = 0;
    } else {
      // Rotate while in air
      this.rotation += this.rotationSpeed * 0.0003 * (this.scene.game.loop.delta / 16);
    }
    
    // Update glow position
    this.glow.setRotation(this.rotation);
    this.innerGlow.setRotation(this.rotation);
  }
}