import Phaser from 'phaser';
import { COLORS } from '../config';

export class LevelGenerator {
  scene: Phaser.Scene;
  platforms: Phaser.Physics.Arcade.StaticGroup;
  spikes: Phaser.Physics.Arcade.StaticGroup;
  orbs: Phaser.Physics.Arcade.StaticGroup;
  pads: Phaser.Physics.Arcade.StaticGroup;
  checkpoints: Phaser.Physics.Arcade.StaticGroup;
  groundY: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.platforms = scene.platforms;
    this.spikes = scene.spikes;
    this.orbs = scene.orbs;
    this.pads = scene.pads;
    this.checkpoints = scene.checkpoints;
    this.groundY = window.innerHeight - 60;
  }

  generate(startX: number, endX: number) {
    let x = startX + 300;
    
    // Tutorial section
    x = this.createTutorialSection(x);
    
    // Main level generation
    while (x < endX) {
      const sectionType = Phaser.Math.Between(0, 10);
      
      if (sectionType <= 3) {
        x = this.createSpikeSection(x);
      } else if (sectionType <= 5) {
        x = this.createPlatformSection(x);
      } else if (sectionType <= 7) {
        x = this.createOrbSection(x);
      } else if (sectionType <= 9) {
        x = this.createPadSection(x);
      } else {
        x = this.createCheckpointSection(x);
      }
      
      // Add spacing between sections
      x += Phaser.Math.Between(100, 200);
    }
  }

  createTutorialSection(x: number): number {
    // Simple spikes to start
    this.createSpike(x + 100);
    x += 250;
    
    // Double spike
    this.createSpike(x);
    this.createSpike(x + 30);
    x += 200;
    
    // Platform jump
    this.createPlatform(x, this.groundY - 100, 150);
    x += 300;
    
    return x;
  }

  createSpikeSection(x: number): number {
    const count = Phaser.Math.Between(1, 4);
    const spacing = Phaser.Math.Between(25, 35);
    
    for (let i = 0; i < count; i++) {
      this.createSpike(x + i * spacing);
    }
    
    return x + count * spacing + Phaser.Math.Between(100, 200);
  }

  createPlatformSection(x: number): number {
    const platformCount = Phaser.Math.Between(2, 4);
    const height = Phaser.Math.Between(80, 200);
    
    for (let i = 0; i < platformCount; i++) {
      const width = Phaser.Math.Between(80, 150);
      this.createPlatform(x, this.groundY - height - i * 80, width);
      x += width + Phaser.Math.Between(150, 250);
    }
    
    return x;
  }

  createOrbSection(x: number): number {
    // Add spike before orb
    this.createSpike(x);
    
    // Add orb
    const orbType = ['yellow', 'blue', 'pink'][Phaser.Math.Between(0, 2)];
    this.createOrb(x + 80, this.groundY - 100, orbType);
    
    // Add spike after orb
    this.createSpike(x + 160);
    
    return x + 250;
  }

  createPadSection(x: number): number {
    // Yellow jump pad
    this.createPad(x, this.groundY - 10, 'yellow');
    
    // Platform to land on
    this.createPlatform(x + 200, this.groundY - 200, 100);
    
    // Spikes below
    this.createSpike(x + 150);
    
    return x + 350;
  }

  createCheckpointSection(x: number): number {
    this.createCheckpoint(x);
    return x + 100;
  }

  createSpike(x: number) {
    const spike = this.scene.add.container(x, this.groundY - 15);
    
    // Main spike triangle
    const triangle = this.scene.add.triangle(0, 0, 0, 30, 15, 0, 30, 30, COLORS.SPIKE);
    triangle.setOrigin(0.5, 1);
    spike.add(triangle);
    
    // Glow effect
    const glow = this.scene.add.triangle(0, 0, 0, 30, 15, 0, 30, 30, COLORS.SPIKE_GLOW, 0.4);
    glow.setOrigin(0.5, 1);
    glow.setScale(1.2);
    spike.add(glow);
    
    this.scene.physics.add.existing(spike, true);
    const body = spike.body as Phaser.Physics.Arcade.Body;
    body.setSize(24, 28).setOffset(3, 2);
    
    this.spikes.add(spike);
  }

  createPlatform(x: number, y: number, width: number) {
    const platform = this.scene.add.container(x, y);
    
    // Main platform
    const rect = this.scene.add.rectangle(0, 0, width, 20, COLORS.PLATFORM);
    platform.add(rect);
    
    // Top highlight
    const top = this.scene.add.rectangle(0, -8, width, 4, COLORS.PLATFORM_TOP);
    platform.add(top);
    
    this.scene.physics.add.existing(platform, true);
    const body = platform.body as Phaser.Physics.Arcade.Body;
    body.setSize(width, 20);
    
    this.platforms.add(platform);
  }

  createOrb(x: number, y: number, type: string) {
    const orb = this.scene.add.container(x, y);
    
    // Get color based on type
    let color: number;
    switch (type) {
      case 'blue': color = COLORS.ORB_BLUE; break;
      case 'pink': color = COLORS.ORB_PINK; break;
      default: color = COLORS.ORB_YELLOW;
    }
    
    // Outer glow
    const glow = this.scene.add.circle(0, 0, 25, color, 0.3);
    orb.add(glow);
    
    // Main orb
    const circle = this.scene.add.circle(0, 0, 18, color);
    orb.add(circle);
    
    // Inner highlight
    const inner = this.scene.add.circle(-5, -5, 8, 0xffffff, 0.5);
    orb.add(inner);
    
    // Pulsing animation
    this.scene.tweens.add({
      targets: glow,
      scale: { from: 1, to: 1.3 },
      alpha: { from: 0.3, to: 0.5 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
    
    orb.setData('orbType', type);
    orb.setData('used', false);
    
    this.scene.physics.add.existing(orb, true);
    const body = orb.body as Phaser.Physics.Arcade.Body;
    body.setCircle(20);
    
    this.orbs.add(orb);
  }

  createPad(x: number, y: number, type: string) {
    const pad = this.scene.add.container(x, y);
    
    // Get color based on type
    const color = type === 'yellow' ? COLORS.PAD_YELLOW : COLORS.ORB_BLUE;
    
    // Main pad
    const rect = this.scene.add.rectangle(0, 0, 50, 15, color);
    pad.add(rect);
    
    // Glow
    const glow = this.scene.add.rectangle(0, 0, 54, 19, color, 0.4);
    pad.add(glow);
    
    pad.setData('padType', type);
    
    this.scene.physics.add.existing(pad, true);
    const body = pad.body as Phaser.Physics.Arcade.Body;
    body.setSize(50, 15);
    
    this.pads.add(pad);
  }

  createCheckpoint(x: number) {
    const checkpoint = this.scene.add.container(x, this.groundY - 50);
    
    // Pole
    const pole = this.scene.add.rectangle(0, 0, 6, 50, COLORS.CHECKPOINT, 0.8);
    checkpoint.add(pole);
    
    // Flag
    const flag = this.scene.add.triangle(10, -15, 0, 0, 20, 10, 0, 20, COLORS.CHECKPOINT);
    checkpoint.add(flag);
    
    checkpoint.setData('activated', false);
    
    this.scene.physics.add.existing(checkpoint, true);
    const body = checkpoint.body as Phaser.Physics.Arcade.Body;
    body.setSize(30, 50);
    
    this.checkpoints.add(checkpoint);
  }
}