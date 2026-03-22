// ============================================
// BossScene — Nivel 4: Boss Final no Patio da Escola
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

EscolaHeroes.BossScene = class BossScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BossScene' });
    }

    create() {
        var W = EscolaHeroes.GAME_WIDTH;
        var H = EscolaHeroes.GAME_HEIGHT;
        var self = this;

        this.drawBackground(W, H);

        this.charData = this.registry.get('selectedCharacter');

        // Grupos
        this.projectiles = EscolaHeroes.createProjectileGroup(this);
        this.monsterProjectiles = EscolaHeroes.createMonsterProjectileGroup(this);
        this.monstersGroup = this.physics.add.group();
        this.powerUpGroup = EscolaHeroes.createPowerUpGroup(this);
        this.bossProjectiles = this.physics.add.group({ maxSize: 50 });

        // Jogador
        this.player = new EscolaHeroes.Player(this, W / 2, H - 80, this.charData);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D
        });
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

        // Colisoes
        this.physics.add.overlap(this.projectiles, this.monstersGroup, this.onProjectileHitMonster, null, this);
        this.physics.add.overlap(this.player.sprite, this.monstersGroup, this.onMonsterHitPlayer, null, this);
        this.physics.add.overlap(this.player.sprite, this.monsterProjectiles, this.onMonsterProjectileHitPlayer, null, this);
        this.physics.add.overlap(this.player.sprite, this.bossProjectiles, this.onMonsterProjectileHitPlayer, null, this);
        this.physics.add.overlap(this.player.sprite, this.powerUpGroup, this.onPlayerCollectPowerUp, null, this);

        // HUD
        this.scene.launch('HUDScene', { gameSceneKey: 'BossScene', levelName: 'PATIO - BOSS FINAL' });

        // Tracking
        this.monsters = [];
        this.monstersKilled = 0;
        this.levelStartTime = this.time.now;
        this.levelComplete = false;

        // Boss
        this.boss = null;
        this.bossPhase = 0;
        this.lastBossShot = 0;
        this.lastBossSlam = 0;
        this.lastBossSpawn = 0;

        // Eventos
        this.events.on('monsterKilled', function (x, y, scoreValue) {
            self.monstersKilled++;
            self.player.addSpecialCharge();
            EscolaHeroes.trySpawnPowerUp(self, x, y, self.powerUpGroup);
        });

        this.events.on('playerDied', function () {
            self.time.delayedCall(1000, function () {
                self.scene.stop('HUDScene');
                self.scene.start('GameOverScene', {
                    levelKey: 'BossScene',
                    stats: {
                        monstersKilled: self.monstersKilled,
                        time: (self.time.now - self.levelStartTime) / 1000
                    }
                });
            });
        });

        // Intro dramatica
        this.time.delayedCall(1000, function () {
            self.spawnMonstroMaster();
        });
    }

    update(time, delta) {
        if (!this.player.alive || this.levelComplete) return;

        var hudScene = this.scene.get('HUDScene');
        var joystickData = hudScene ? hudScene.getJoystickData() : { x: 0, y: 0 };

        this.player.update(this.cursors, time, this.wasd, joystickData);

        var isFiring = this.spaceKey.isDown;
        if (hudScene && hudScene.isMobileFiring()) isFiring = true;
        if (isFiring) {
            var proj = this.player.shoot(time, this.projectiles);
            if (proj) proj.body.onWorldBounds = true;
        }

        if (Phaser.Input.Keyboard.JustDown(this.qKey)) this.player.useSpecial(this.monstersGroup);
        if (hudScene && hudScene.isMobileSpecialPressed()) this.player.useSpecial(this.monstersGroup);

        // Update monstros suporte
        for (var i = this.monsters.length - 1; i >= 0; i--) {
            var m = this.monsters[i];
            if (m.alive && m.sprite && m.sprite.active) {
                m.update(time, this.player.sprite);
            } else if (!m.alive) {
                this.monsters.splice(i, 1);
            }
        }

        // Update boss
        if (this.boss && this.boss.alive) {
            this.updateBoss(time);
        }

        this.cleanupProjectiles(this.projectiles);
        this.cleanupProjectiles(this.monsterProjectiles);
        this.cleanupProjectiles(this.bossProjectiles);
    }

    drawBackground(W, H) {
        var bg = this.add.graphics();

        // Ceu gradiente
        var skyColors = [0x4A90D9, 0x5BA0E5, 0x6BB0F0, 0x87CEEB];
        for (var si = 0; si < skyColors.length; si++) {
            bg.fillStyle(skyColors[si], 1);
            bg.fillRect(0, si * 30, W, 35);
        }

        // Muro de fundo
        bg.fillStyle(0x999999, 1);
        bg.fillRect(0, 100, W, 30);
        bg.lineStyle(1, 0x777777, 0.5);
        for (var mx = 0; mx < W; mx += 30) {
            bg.lineBetween(mx, 100, mx, 130);
        }
        bg.lineBetween(0, 115, W, 115);

        // Chao (alcatrao)
        bg.fillStyle(0x888888, 1);
        bg.fillRect(0, 130, W, H - 130);

        // Amarelinha
        bg.lineStyle(2, 0xFFFF00, 0.4);
        for (var ay = 0; ay < 4; ay++) {
            bg.strokeRect(350, 400 + ay * 30, 40, 30);
        }
        bg.strokeRect(330, 520, 40, 30);
        bg.strokeRect(370, 520, 40, 30);

        // Portao (fundo centro)
        bg.fillStyle(0x222222, 1);
        bg.fillRect(W / 2 - 60, 85, 120, 45);
        bg.lineStyle(3, 0x333333, 1);
        for (var px = 0; px < 8; px++) {
            bg.lineBetween(W / 2 - 55 + px * 15, 85, W / 2 - 55 + px * 15, 128);
        }
        // Arco
        bg.lineStyle(4, 0x222222, 1);
        bg.beginPath();
        bg.arc(W / 2, 90, 58, Math.PI, 0, false);
        bg.strokePath();

        // Arvores
        var trees = [{ x: 60, y: 180 }, { x: 720, y: 170 }, { x: 100, y: 450 }, { x: 700, y: 500 }];
        for (var t = 0; t < trees.length; t++) {
            bg.fillStyle(0x8B4513, 1);
            bg.fillRect(trees[t].x - 6, trees[t].y, 12, 40);
            bg.fillStyle(0x228B22, 0.9);
            bg.fillCircle(trees[t].x, trees[t].y - 5, 22);
            bg.fillCircle(trees[t].x - 12, trees[t].y + 5, 16);
            bg.fillCircle(trees[t].x + 12, trees[t].y + 5, 16);
        }

        // Bancos
        bg.fillStyle(0x8B6914, 1);
        bg.fillRect(180, 350, 50, 8);
        bg.fillRect(180, 358, 4, 12);
        bg.fillRect(226, 358, 4, 12);
        bg.fillRect(550, 250, 50, 8);
        bg.fillRect(550, 258, 4, 12);
        bg.fillRect(596, 258, 4, 12);

        // Caixote do lixo
        bg.fillStyle(0x666666, 1);
        bg.fillRect(640, 400, 20, 25);
        bg.fillStyle(0x555555, 1);
        bg.fillRect(638, 398, 24, 4);

        bg.setDepth(0);
    }

    // --- MONSTRO MASTER ---
    spawnMonstroMaster() {
        var W = EscolaHeroes.GAME_WIDTH;
        var self = this;

        // Gerar textura
        var g = this.make.graphics({ x: 0, y: 0, add: false });
        var s = 70;
        // Corpo escuro roxo
        g.fillStyle(0x2D0A3E, 1);
        g.fillEllipse(s / 2, s / 2 + 5, 55, 50);
        g.fillStyle(0x3D1A5E, 1);
        g.fillEllipse(s / 2, s / 2, 45, 42);
        // Coroa torta
        g.fillStyle(0xDAA520, 1);
        g.fillTriangle(s / 2 - 18, 8, s / 2 - 12, 0, s / 2 - 6, 8);
        g.fillTriangle(s / 2 - 6, 8, s / 2, -2, s / 2 + 6, 8);
        g.fillTriangle(s / 2 + 6, 8, s / 2 + 12, 1, s / 2 + 18, 8);
        g.fillRect(s / 2 - 18, 8, 36, 5);
        // 3 olhos vermelhos
        g.fillStyle(0xFF0000, 1);
        g.fillCircle(s / 2 - 10, s / 2 - 5, 5);
        g.fillCircle(s / 2 + 10, s / 2 - 5, 5);
        g.fillCircle(s / 2, s / 2 - 14, 4);
        g.fillStyle(0xFFFF00, 1);
        g.fillCircle(s / 2 - 10, s / 2 - 5, 2);
        g.fillCircle(s / 2 + 10, s / 2 - 5, 2);
        g.fillCircle(s / 2, s / 2 - 14, 1.5);
        // Boca com dentes
        g.fillStyle(0x1A0028, 1);
        g.fillEllipse(s / 2, s / 2 + 10, 24, 10);
        g.fillStyle(0xFFFFFF, 1);
        for (var tooth = 0; tooth < 5; tooth++) {
            g.fillTriangle(
                s / 2 - 10 + tooth * 5, s / 2 + 6,
                s / 2 - 8 + tooth * 5, s / 2 + 12,
                s / 2 - 6 + tooth * 5, s / 2 + 6
            );
        }
        g.generateTexture('boss_master', s, s);
        g.destroy();

        // Texto de introducao
        var introText = this.add.text(W / 2, 250, 'MONSTRO MASTER!', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '48px',
            color: '#FF0000',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(50).setScale(0);

        this.tweens.add({
            targets: introText,
            scaleX: 1.1, scaleY: 1.1,
            duration: 600,
            ease: 'Bounce.easeOut',
            onComplete: function () {
                self.tweens.add({
                    targets: introText,
                    alpha: 0, duration: 500, delay: 1200,
                    onComplete: function () { introText.destroy(); }
                });
            }
        });

        this.cameras.main.shake(800, 0.03);

        this.time.delayedCall(2000, function () {
            self.createBoss();
        });
    }

    createBoss() {
        var W = EscolaHeroes.GAME_WIDTH;
        var self = this;

        this.boss = {
            sprite: this.physics.add.sprite(W / 2, -50, 'boss_master'),
            hp: 500,
            maxHp: 500,
            alive: true,
            damage: 15,
            baseSpeed: 30
        };

        this.boss.sprite.setScale(2.5);
        this.boss.sprite.setDepth(6);
        this.monstersGroup.add(this.boss.sprite);
        this.boss.sprite.monsterRef = {
            alive: true,
            damage: 15,
            isInvulnerable: false,
            takeDamage: function (amount) { self.bossTakeDamage(amount); },
            applySlowEffect: function () { }
        };

        // Aura (circulos escuros)
        this.bossAura = [];
        for (var a = 0; a < 6; a++) {
            var aura = this.add.circle(0, 0, 8 + Math.random() * 10, 0x3D1A5E, 0.3).setDepth(5);
            this.bossAura.push(aura);
            this.tweens.add({
                targets: aura,
                alpha: 0.1,
                duration: 500 + Math.random() * 500,
                yoyo: true,
                repeat: -1,
                delay: Math.random() * 500
            });
        }

        // Barra de vida larga (topo)
        this.bossBarBg = this.add.graphics().setDepth(100);
        this.bossBarFill = this.add.graphics().setDepth(101);
        this.bossBarName = this.add.text(W / 2, 52, 'MONSTRO MASTER', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '12px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(102);

        // Entrada
        this.tweens.add({
            targets: this.boss.sprite,
            y: 200,
            duration: 1500,
            ease: 'Bounce.easeOut'
        });

        this.bossPhase = 1;
    }

    updateBoss(time) {
        if (!this.boss || !this.boss.alive) return;

        var sprite = this.boss.sprite;
        var player = this.player.sprite;

        // Determinar fase
        var newPhase = this.boss.hp > 300 ? 1 : (this.boss.hp > 100 ? 2 : 3);
        if (newPhase !== this.bossPhase) {
            this.onPhaseChange(newPhase);
            this.bossPhase = newPhase;
        }

        // Velocidade por fase
        var speedMult = this.bossPhase === 1 ? 1 : (this.bossPhase === 2 ? 1.5 : 2);
        var speed = this.boss.baseSpeed * speedMult;

        // Mover
        var dx = player.x - sprite.x;
        var dy = player.y - sprite.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) sprite.setVelocity((dx / dist) * speed, (dy / dist) * speed);

        // Aura segue o boss
        for (var a = 0; a < this.bossAura.length; a++) {
            var angle = (time * 0.002 + a * (Math.PI * 2 / this.bossAura.length));
            var radius = 45 + Math.sin(time * 0.003 + a) * 10;
            this.bossAura[a].setPosition(
                sprite.x + Math.cos(angle) * radius,
                sprite.y + Math.sin(angle) * radius
            );
        }

        // Disparar projecteis
        var shootInterval = this.bossPhase === 1 ? 2000 : (this.bossPhase === 2 ? 1500 : 2000);
        if (time > this.lastBossShot + shootInterval) {
            this.lastBossShot = time;
            this.bossShoot();
        }

        // Slam (fase 2+)
        if (this.bossPhase >= 2) {
            var slamInterval = this.bossPhase === 2 ? 5000 : 4000;
            if (time > this.lastBossSlam + slamInterval) {
                this.lastBossSlam = time;
                this.bossSlam();
            }
        }

        // Spawn monstros suporte
        var spawnInterval = this.bossPhase === 1 ? 8000 : (this.bossPhase === 2 ? 6000 : 4000);
        var maxSupport = this.bossPhase <= 2 ? (this.bossPhase === 1 ? 3 : 5) : 5;
        if (time > this.lastBossSpawn + spawnInterval && this.monsters.length < maxSupport) {
            this.lastBossSpawn = time;
            this.spawnSupport();
        }

        // Pulsacao vermelha fase 3
        if (this.bossPhase === 3 && Math.sin(time * 0.01) > 0.5) {
            sprite.setTint(0xFF3333);
        } else if (this.bossPhase === 3) {
            sprite.clearTint();
        }

        this.updateBossBar();
    }

    bossShoot() {
        if (!this.boss || !this.boss.alive) return;

        var sprite = this.boss.sprite;
        var player = this.player.sprite;
        var baseAngle = Math.atan2(player.y - sprite.y, player.x - sprite.x);

        if (this.bossPhase <= 2) {
            // Leque de projecteis
            var count = this.bossPhase === 1 ? 3 : 5;
            var spread = this.bossPhase === 1 ? (Math.PI / 6) : (Math.PI / 4);
            for (var i = 0; i < count; i++) {
                var angle = baseAngle + (i - (count - 1) / 2) * (spread / (count - 1 || 1));
                this.createBossProjectile(sprite.x, sprite.y, angle);
            }
        } else {
            // Padrao circular (8 projecteis)
            for (var j = 0; j < 8; j++) {
                var circAngle = (j / 8) * Math.PI * 2;
                this.createBossProjectile(sprite.x, sprite.y, circAngle);
            }
        }
    }

    createBossProjectile(x, y, angle) {
        // Gerar textura se nao existe
        if (!this.textures.exists('proj_boss')) {
            var g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x7B2D8E, 0.6);
            g.fillCircle(8, 8, 8);
            g.fillStyle(0x9B59B6, 1);
            g.fillCircle(8, 8, 5);
            g.fillStyle(0xFFFFFF, 0.5);
            g.fillCircle(7, 6, 2);
            g.generateTexture('proj_boss', 16, 16);
            g.destroy();
        }

        var proj = this.bossProjectiles.create(x, y, 'proj_boss');
        if (!proj) return;

        proj.setDepth(5);
        proj.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
        proj.damage = 15;

        var self = this;
        this.time.delayedCall(4000, function () {
            if (proj && proj.active) proj.destroy();
        });
    }

    bossSlam() {
        if (!this.boss || !this.boss.alive) return;

        var sprite = this.boss.sprite;
        var self = this;

        // Boss pisca vermelho
        sprite.setTint(0xFF0000);
        this.time.delayedCall(1000, function () {
            if (!self.boss || !self.boss.alive) return;
            sprite.clearTint();

            // Area de dano
            var radius = self.bossPhase === 3 ? 130 : 100;
            var slamCircle = self.add.circle(sprite.x, sprite.y, 10, 0xFF0000, 0.4).setDepth(15);

            self.tweens.add({
                targets: slamCircle,
                radius: radius,
                alpha: 0,
                duration: 400,
                onUpdate: function () {
                    slamCircle.setRadius(slamCircle.radius || 10);
                    // Verificar dano ao jogador
                    if (self.player.alive) {
                        var d = Phaser.Math.Distance.Between(
                            slamCircle.x, slamCircle.y,
                            self.player.sprite.x, self.player.sprite.y
                        );
                        if (d < slamCircle.radius && slamCircle.alpha > 0.1) {
                            self.player.takeDamage(20);
                        }
                    }
                },
                onComplete: function () {
                    slamCircle.destroy();
                }
            });

            self.cameras.main.shake(200, 0.02);
        });
    }

    spawnSupport() {
        var types = this.bossPhase === 1 ? ['GosmaVerde'] :
            (this.bossPhase === 2 ? ['Morcego'] : ['GosmaVerde', 'Morcego', 'AranhaSaltitona']);
        var type = types[Math.floor(Math.random() * types.length)];
        var monster = EscolaHeroes.spawnRandomMonster(this, this.monstersGroup, [type]);
        if (monster) this.monsters.push(monster);
    }

    onPhaseChange(newPhase) {
        var W = EscolaHeroes.GAME_WIDTH;
        var H = EscolaHeroes.GAME_HEIGHT;

        this.cameras.main.shake(500, 0.03);
        this.cameras.main.flash(300, 255, 0, 0);

        var texts = {
            2: 'O MONSTRO ESTA FURIOSO!',
            3: 'AGORA ACABA ISTO!'
        };

        var phaseText = this.add.text(W / 2, H / 2, texts[newPhase] || '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '32px',
            color: newPhase === 2 ? '#FF4400' : '#FF0000',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(50).setScale(0);

        var self = this;
        this.tweens.add({
            targets: phaseText,
            scaleX: 1, scaleY: 1,
            duration: 400,
            ease: 'Back.easeOut',
            onComplete: function () {
                self.tweens.add({
                    targets: phaseText,
                    alpha: 0, duration: 500, delay: 1500,
                    onComplete: function () { phaseText.destroy(); }
                });
            }
        });
    }

    updateBossBar() {
        var W = EscolaHeroes.GAME_WIDTH;
        var barX = 50;
        var barY = 60;
        var barW = W - 100;
        var barH = 12;

        this.bossBarBg.clear();
        this.bossBarBg.fillStyle(0x333333, 0.8);
        this.bossBarBg.fillRoundedRect(barX, barY, barW, barH, 4);

        var ratio = Math.max(0, this.boss.hp / this.boss.maxHp);
        this.bossBarFill.clear();
        if (ratio > 0) {
            var color = this.bossPhase === 1 ? 0x9B59B6 : (this.bossPhase === 2 ? 0xFF4400 : 0xFF0000);
            this.bossBarFill.fillStyle(color, 1);
            this.bossBarFill.fillRoundedRect(barX + 1, barY + 1, (barW - 2) * ratio, barH - 2, 3);
        }
    }

    bossTakeDamage(amount) {
        if (!this.boss || !this.boss.alive) return;
        this.boss.hp -= amount;
        this.boss.sprite.setTint(0xFF0000);
        var self = this;
        this.time.delayedCall(80, function () {
            if (self.boss && self.boss.sprite && self.boss.sprite.active && self.bossPhase !== 3) {
                self.boss.sprite.clearTint();
            }
        });
        if (this.boss.hp <= 0) this.bossDie();
    }

    bossDie() {
        this.boss.alive = false;
        this.boss.sprite.monsterRef.alive = false;
        this.levelComplete = true;
        var self = this;
        var sprite = this.boss.sprite;
        var x = sprite.x;
        var y = sprite.y;

        // 1. Congela e treme
        sprite.setVelocity(0, 0);
        this.tweens.add({
            targets: sprite,
            x: x - 3, duration: 50, yoyo: true, repeat: 20
        });

        // 2. Flash branco
        this.time.delayedCall(1200, function () {
            self.cameras.main.flash(500, 255, 255, 255);
        });

        // 3. Encolhe lentamente
        this.time.delayedCall(1800, function () {
            self.tweens.add({
                targets: sprite,
                scaleX: 0, scaleY: 0, alpha: 0,
                duration: 1500,
                ease: 'Expo.easeIn',
                onComplete: function () {
                    sprite.destroy();
                }
            });
        });

        // 4. Explosao colorida
        this.time.delayedCall(3300, function () {
            var colors = [0xFF69B4, 0x4A90D9, 0x9B59B6, 0x2ECC71, 0xFFD700, 0xFF4444];
            for (var i = 0; i < 30; i++) {
                var color = colors[Math.floor(Math.random() * colors.length)];
                var particle = self.add.circle(x, y, 5 + Math.random() * 8, color, 1).setDepth(25);
                self.tweens.add({
                    targets: particle,
                    x: x + (Math.random() - 0.5) * 400,
                    y: y + (Math.random() - 0.5) * 400,
                    alpha: 0, scaleX: 0, scaleY: 0,
                    duration: 800 + Math.random() * 600,
                    onComplete: function () { particle.destroy(); }
                });
            }
            self.cameras.main.shake(500, 0.04);

            // Limpar aura
            for (var a = 0; a < self.bossAura.length; a++) {
                self.bossAura[a].destroy();
            }
        });

        // 5. Matar suportes
        this.time.delayedCall(3500, function () {
            for (var m = 0; m < self.monsters.length; m++) {
                if (self.monsters[m].alive) self.monsters[m].takeDamage(999);
            }
        });

        // 6. Limpar UI boss
        this.time.delayedCall(3800, function () {
            if (self.bossBarBg) self.bossBarBg.destroy();
            if (self.bossBarFill) self.bossBarFill.destroy();
            if (self.bossBarName) self.bossBarName.destroy();
        });

        // 7. Pausa + Transicao para VictoryScene
        this.time.delayedCall(5000, function () {
            var elapsed = (self.time.now - self.levelStartTime) / 1000;
            var totalStats = self.registry.get('totalStats') || { monstersKilled: 0, time: 0 };

            self.scene.stop('HUDScene');
            self.scene.start('VictoryScene', {
                charData: self.charData,
                stats: {
                    monstersKilled: totalStats.monstersKilled + self.monstersKilled,
                    time: totalStats.time + elapsed
                }
            });
        });
    }

    // --- Collision handlers ---
    onProjectileHitMonster(projectile, monsterSprite) {
        if (!projectile.active || !monsterSprite.active) return;
        var damage = projectile.damage || EscolaHeroes.PLAYER_STATS.projectileDamage;
        if (monsterSprite.monsterRef) monsterSprite.monsterRef.takeDamage(damage);
        projectile.destroy();
    }

    onMonsterHitPlayer(playerSprite, monsterSprite) {
        if (!playerSprite.active || !monsterSprite.active || !playerSprite.playerRef) return;
        var damage = monsterSprite.monsterRef ? monsterSprite.monsterRef.damage : 10;
        playerSprite.playerRef.takeDamage(damage);
    }

    onMonsterProjectileHitPlayer(playerSprite, projectile) {
        if (!playerSprite.active || !projectile.active || !playerSprite.playerRef) return;
        playerSprite.playerRef.takeDamage(projectile.damage || 15);
        projectile.destroy();
    }

    onPlayerCollectPowerUp(playerSprite, powerup) {
        if (!playerSprite.active || !powerup.active || !playerSprite.playerRef) return;
        EscolaHeroes.applyPowerUp(this, playerSprite.playerRef, powerup);
    }

    cleanupProjectiles(group) {
        var W = EscolaHeroes.GAME_WIDTH;
        var H = EscolaHeroes.GAME_HEIGHT;
        var children = group.getChildren();
        for (var i = children.length - 1; i >= 0; i--) {
            var p = children[i];
            if (p.active && (p.x < -30 || p.x > W + 30 || p.y < -30 || p.y > H + 30)) p.destroy();
        }
    }
};

window.EscolaHeroes = EscolaHeroes;
