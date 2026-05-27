import Phaser from 'phaser';
import { Player } from '../objects/Player';
import { LevelGenerator } from '../objects/LevelGenerator';
import { COLORS, PHYSICS, PLAYER_SIZE } from '../config';

export class GameScene extends Phaser.Scene {
  player!: Player;
  platforms!: Phaser.Physics.Arcade.StaticGroup;
  spikes!: Phaser.Physics.Arcade.StaticGroup;
  orbs!: Phaser.Physics.Arcade.StaticGroup;
  pads!: Phaser.Physics.Arcade.StaticGroup;
  checkpoints!: Phaser.Physics.Arcade.StaticGroup;
  
  scoreText!: Phaser.GameObjects.Text;
  attemptText!: Phaser.GameObjects.Text;
  background!: Phaser.GameObjects.Graphics;
  ground!: Phaser.GameObjects.TileSprite;
  
  score: number = 0;
  distance: number = 0;
  lastCheckpoint: number = 0;
  isGameOver: boolean = false;
  attempt: number = 1;
  
  particles!: Phaser.GameObjects.Particles.ParticleEmitter;
  trailEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  backgroundStars: Phaser.GameObjects.Shape[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.score = 0;
    this.distance = 0;
    this.lastCheckpoint = 0;
    this.isGameOver = false;

    this.createBackground();
    this.createGround();
    this.createPlayer();
    this.createLevel();
    this.createParticles();
    this.createUI();

    this.setupColliders();
    this.setupInput();

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(100, 0);

    this.events.emit('ready');
  }

  createBackground() {
    // Create gradient background
    this.background = this.add.graphics();
    this.drawBackground();
    
    // Add parallax stars
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, 4000);
      const y = Phaser.Math.Between(0, window.innerHeight * 0.7);
      const size = Phaser.Math.Between(1, 3);
      const alpha = Phaser.Math.FloatBetween(0.3, 1);
      
      const star = this.add.circle(x, y, size, COLORS.STAR, alpha);
      star.setScrollFactor(0.2, 0.1);
      this.backgroundStars.push(star);
    }
  }

  drawBackground() {
    const height = window.innerHeight;
    const width = 10000;
    
    this.background.fillGradientStyle(
      COLORS.BG_GRADIENT_TOP,
      COLORS.BG_GRADIENT_TOP,
      COLORS.BG,
      COLORS.BG,
      1
    );
    this.background.fillRect(0, 0, width, height);
  }

  createGround() {
    const groundY = window.innerHeight - 60;
    
    // Create ground graphics
    const groundGraphics = this.make.graphics({ x: 0, y: 0 });
    groundGraphics.fillStyle(COLORS.PLATFORM, 1);
    groundGraphics.fillRect(0, 0, 64, 64);
    groundGraphics.fillStyle(COLORS.PLATFORM_TOP, 1);
    groundGraphics.fillRect(0, 0, 64, 8);
    groundGraphics.generateTexture('ground', 64, 64);
    groundGraphics.destroy();
    
    this.ground = this.add.tileSprite(
      5000,
      groundY,
      10000,
      64,
      'ground'
    );
    this.physics.add.existing(this.ground, true);
    (this.ground.body as Phaser.Physics.Arcade.Body).setSize(10000, 60).setOffset(0, 0);
  }

  createPlayer() {
    const groundY = window.innerHeight - 60;
    this.player = new Player(this, 150, groundY - PLAYER_SIZE - 10);
  }

  createLevel() {
    this.platforms = this.physics.add.staticGroup();
    this.spikes = this.physics.add.staticGroup();
    this.orbs = this.physics.add.staticGroup();
    this.pads = this.physics.add.staticGroup();
    this.checkpoints = this.physics.add.staticGroup();

    const generator = new LevelGenerator(this);
    generator.generate(0, 15000);
  }

  createParticles() {
    // Trail particles
    this.trailEmitter = this.add.particles(0, 0, 'trail', {
      speed: { min: 20, max: 50 },
      angle: { min: 160, max: 200 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 300,
      frequency: 20,
      blendMode: Phaser.BlendModes.ADD,
    });
    
    // Death particles
    this.particles = this.add.particles(0, 0, 'particle', {
      speed: { min: 200, max: 500 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 800,
      quantity: 30,
      active: false,
      blendMode: Phaser.BlendModes.ADD,
    });
  }

  createUI() {
    this.scoreText = this.add
      .text(20, 20, '0%', {
        fontSize: '32px',
        fontFamily: 'Arial Black, sans-serif',
        color: COLORS.TEXT,
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.attemptText = this.add
      .text(20, 60, `Attempt ${this.attempt}`, {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        color: '#aaaaaa',
      })
      .setScrollFactor(0)
      .setDepth(100);
  }

  setupColliders() {
    // Ground collision
    this.physics.add.collider(this.player, this.ground);
    
    // Platform collision
    this.physics.add.collider(this.player, this.platforms);
    
    // Spike collision
    this.physics.add.overlap(this.player, this.spikes, () => this.die(), undefined, this);
    
    // Orb collision
    this.physics.add.overlap(
      this.player,
      this.orbs,
      (_player, orb) => this.activateOrb(orb as Phaser.GameObjects.Container),
      undefined,
      this
    );
    
    // Pad collision
    this.physics.add.overlap(
      this.player,
      this.pads,
      (_player, pad) => this.activatePad(pad as Phaser.GameObjects.Container),
      undefined,
      this
    );
    
    // Checkpoint collision
    this.physics.add.overlap(
      this.player,
      this.checkpoints,
      (_player, checkpoint) => this.activateCheckpoint(checkpoint as Phaser.GameObjects.Sprite),
      undefined,
      this
    );
  }

  setupInput() {
    this.input.keyboard?.on('keydown-SPACE', () => this.player.jump());
    this.input.keyboard?.on('keydown-UP', () => this.player.jump());
    this.input.keyboard?.on('keydown-W', () => this.player.jump());
    this.input.on('pointerdown', () => this.player.jump());
  }

  activateOrb(orb: Phaser.GameObjects.Container) {
    if (!this.player.canOrbJump || orb.getData('used')) return;
    
    const type = orb.getData('orbType');
    orb.setData('used', true);
    
    // Visual feedback
    this.tweens.add({
      targets: orb,
      scale: 1.5,
      alpha: 0,
      duration: 150,
      onComplete: () => orb.destroy(),
    });
    
    // Jump effect based on orb type
    if (type === 'yellow') {
      this.player.orbJump(PHYSICS.ORB_JUMP_VELOCITY);
    } else if (type === 'blue') {
      this.player.orbJump(PHYSICS.ORB_JUMP_VELOCITY * 1.2);
    } else if (type === 'pink') {
      this.player.orbJump(PHYSICS.ORB_JUMP_VELOCITY * 0.8);
    }
    
    this.player.canOrbJump = false;
  }

  activatePad(pad: Phaser.GameObjects.Container) {
    const type = pad.getData('padType');
    
    // Visual feedback
    this.tweens.add({
      targets: pad,
      scaleY: 0.3,
      duration: 100,
      yoyo: true,
    });
    
    if (type === 'yellow') {
      this.player.padJump(PHYSICS.PAD_JUMP_VELOCITY);
    }
  }

  activateCheckpoint(checkpoint: Phaser.GameObjects.Sprite) {
    if (checkpoint.getData('activated')) return;
    
    checkpoint.setData('activated', true);
    this.lastCheckpoint = checkpoint.x;
    
    // Visual feedback
    checkpoint.setTint(COLORS.CHECKPOINT);
    this.tweens.add({
      targets: checkpoint,
      alpha: 0.5,
      duration: 200,
      yoyo: true,
    });
  }

  die() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    // Death particles
    this.particles.setPosition(this.player.x, this.player.y);
    this.particles.explode(30);

    // Camera shake
    this.cameras.main.shake(300, 0.02);

    // Flash effect
    this.cameras.main.flash(200, 255, 0, 0, true);

    // Player death animation
    this.player.die();

    // Emit death event
    this.time.delayedCall(500, () => {
      this.events.emit('death');
    });
  }

  update() {
    if (this.isGameOver) return;

    // Update player
    this.player.update();
    
    // Update trail position
    this.trailEmitter.setPosition(this.player.x - 20, this.player.y);

    // Update score based on distance
    this.distance = Math.max(this.distance, this.player.x);
    const progress = Math.floor((this.distance / 15000) * 100);
    this.scoreText.setText(`${progress}%`);
    this.events.emit('score', progress);

    // Update ground tile position
    this.ground.tilePositionX = this.cameras.main.scrollX * 0.5;

    // Keep player moving forward
    this.player.setVelocityX(PHYSICS.PLAYER_SPEED);
  }
}