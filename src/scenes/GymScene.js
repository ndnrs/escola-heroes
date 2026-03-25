// ============================================
// GymScene — Nivel 2: Pavilhao Desportivo
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

EscolaHeroes.GymScene = class GymScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GymScene' });
    }

    create() {
        var W = EscolaHeroes.GAME_WIDTH;
        var H = EscolaHeroes.GAME_HEIGHT;
        var self = this;

        this.cameras.main.fadeIn(500);
        EscolaHeroes.AudioManager.startMusic('level');

        this.drawBackground(W, H);

        this.charData = this.registry.get('selectedCharacter');

        // Grupos
        this.projectiles = EscolaHeroes.createProjectileGroup(this);
        this.monsterProjectiles = EscolaHeroes.createMonsterProjectileGroup(this);
        this.monstersGroup = this.physics.add.group();
        this.powerUpGroup = EscolaHeroes.createPowerUpGroup(this);

        // Jogador
        this.player = new EscolaHeroes.Player(this, W / 2, H / 2, this.charData);

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
        this.physics.add.overlap(this.projectiles, this.monstersGroup, this.onProjectileHitMonster, this.processMonsterHit, this);
        this.physics.add.overlap(this.player.sprite, this.monstersGroup, this.onMonsterHitPlayer, null, this);
        this.physics.add.overlap(this.player.sprite, this.monsterProjectiles, this.onMonsterProjectileHitPlayer, null, this);
        this.physics.add.overlap(this.player.sprite, this.powerUpGroup, this.onPlayerCollectPowerUp, null, this);

        // HUD
        this.scene.launch('HUDScene', { gameSceneKey: 'GymScene', levelName: 'PAVILHAO' });

        // Tracking
        this.monsters = [];
        this.monstersKilled = 0;
        this.levelStartTime = this.time.now;
        this.bossActive = false;
        this.levelComplete = false;

        // Polvo boss
        this.polvo = null;
        this.tentacles = [];

        // Eventos
        this.events.on('monsterKilled', function (x, y, scoreValue) {
            self.monstersKilled++;
            self.player.addSpecialCharge();
            EscolaHeroes.trySpawnPowerUp(self, x, y, self.powerUpGroup);
        });

        // Wave configs (20 monstros em 4 waves de 5)
        var waveConfigs = [
            {
                monsters: [
                    { type: 'AranhaSaltitona', count: 5, entryFrom: 'bottom', delay: 500 }
                ]
            },
            {
                monsters: [
                    { type: 'AranhaSaltitona', count: 3, entryFrom: 'random', delay: 500 },
                    { type: 'Fantasma', count: 2, entryFrom: 'left', delay: 600 }
                ]
            },
            {
                monsters: [
                    { type: 'AranhaSaltitona', count: 2, entryFrom: 'random', delay: 400 },
                    { type: 'Fantasma', count: 3, entryFrom: 'random', delay: 500 }
                ]
            },
            {
                monsters: [
                    { type: 'Fantasma', count: 5, entryFrom: 'random', delay: 400 }
                ]
            }
        ];

        this.waveManager = new EscolaHeroes.WaveManager(this, this.monstersGroup, waveConfigs);

        this.events.on('allWavesComplete', function () {
            self.spawnPolvo();
        });

        this.events.on('playerDied', function () {
            self.waveManager.stop();
            self.time.delayedCall(1000, function () {
                self.scene.stop('HUDScene');
                self.scene.stop('GymScene');
                self.scene.start('GameOverScene', {
                    levelKey: 'GymScene',
                    stats: {
                        monstersKilled: self.monstersKilled,
                        time: (self.time.now - self.levelStartTime) / 1000
                    }
                });
            });
        });

        this.waveManager.start();
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

        if (Phaser.Input.Keyboard.JustDown(this.qKey)) {
            this.player.useSpecial(this.monstersGroup);
        }
        if (hudScene && hudScene.isMobileSpecialPressed()) {
            this.player.useSpecial(this.monstersGroup);
        }

        // Update monstros
        this._syncMonsters();
        for (var i = this.monsters.length - 1; i >= 0; i--) {
            var monster = this.monsters[i];
            if (monster.alive && monster.sprite && monster.sprite.active) {
                monster.update(time, this.player.sprite);
            } else if (!monster.alive) {
                this.monsters.splice(i, 1);
            }
        }

        this.waveManager.update();

        // Update Polvo
        if (this.polvo && this.polvo.alive) {
            this.updatePolvo(time);
        }

        this.cleanupProjectiles(this.projectiles);
        this.cleanupProjectiles(this.monsterProjectiles);
    }

    _syncMonsters() {
        if (this.waveManager && this.waveManager.monstersInWave) {
            for (var i = 0; i < this.waveManager.monstersInWave.length; i++) {
                var m = this.waveManager.monstersInWave[i];
                if (this.monsters.indexOf(m) === -1) {
                    this.monsters.push(m);
                }
            }
        }
    }

    drawBackground(W, H) {
        var bg = this.add.graphics();

        // Chao do ginasio (madeira)
        bg.fillStyle(0xCD853F, 1);
        bg.fillRect(0, 0, W, H);

        // Linhas do campo (brancas)
        bg.lineStyle(3, 0xFFFFFF, 0.6);
        // Linhas exteriores
        bg.strokeRect(40, 40, W - 80, H - 80);
        // Linha central
        bg.lineBetween(W / 2, 40, W / 2, H - 40);
        // Circulo central
        bg.strokeCircle(W / 2, H / 2, 60);

        // Paredes laterais (cinza)
        bg.fillStyle(0xCCCCCC, 1);
        bg.fillRect(0, 0, W, 30);

        // Balizas (brancas com rede)
        // Baliza esquerda
        bg.fillStyle(0xFFFFFF, 0.8);
        bg.fillRect(10, H / 2 - 50, 15, 100);
        bg.lineStyle(1, 0xCCCCCC, 0.5);
        for (var ny = 0; ny < 10; ny++) {
            bg.lineBetween(10, H / 2 - 50 + ny * 10, 25, H / 2 - 50 + ny * 10);
        }
        // Baliza direita
        bg.fillStyle(0xFFFFFF, 0.8);
        bg.fillRect(W - 25, H / 2 - 50, 15, 100);
        for (var ny2 = 0; ny2 < 10; ny2++) {
            bg.lineBetween(W - 25, H / 2 - 50 + ny2 * 10, W - 10, H / 2 - 50 + ny2 * 10);
        }

        // Cestos de basquete
        // Esquerda
        bg.fillStyle(0xFFFFFF, 1);
        bg.fillRect(50, 60, 30, 20);
        bg.lineStyle(3, 0xFF4500, 1);
        bg.strokeCircle(65, 90, 12);
        // Direita
        bg.fillStyle(0xFFFFFF, 1);
        bg.fillRect(W - 80, 60, 30, 20);
        bg.lineStyle(3, 0xFF4500, 1);
        bg.strokeCircle(W - 65, 90, 12);

        // Banco sueco (castanho fino)
        bg.fillStyle(0x8B4513, 0.8);
        bg.fillRect(W - 60, H - 100, 50, 8);
        // Pernas
        bg.fillRect(W - 58, H - 92, 4, 15);
        bg.fillRect(W - 16, H - 92, 4, 15);

        // Espaldar (linhas horizontais na parede)
        bg.lineStyle(2, 0x8B4513, 0.6);
        for (var ey = 0; ey < 6; ey++) {
            bg.lineBetween(W - 50, 120 + ey * 15, W - 10, 120 + ey * 15);
        }
        bg.lineStyle(2, 0x8B4513, 0.6);
        bg.lineBetween(W - 50, 120, W - 50, 195);
        bg.lineBetween(W - 10, 120, W - 10, 195);

        // Bolas decorativas
        var ballColors = [0xFF0000, 0x0000FF, 0xFFFF00, 0x00FF00];
        var balls = [
            { x: 150, y: 480 }, { x: 600, y: 500 }, { x: 700, y: 150 }, { x: 350, y: 100 }
        ];
        for (var b = 0; b < balls.length; b++) {
            bg.fillStyle(ballColors[b], 0.5);
            bg.fillCircle(balls[b].x, balls[b].y, 8);
        }

        bg.setDepth(0);
    }

    // --- POLVO DESPORTISTA ---
    spawnPolvo() {
        var W = EscolaHeroes.GAME_WIDTH;
        var H = EscolaHeroes.GAME_HEIGHT;
        var self = this;

        // Anuncio
        var bossText = this.add.text(W / 2, H / 2, 'BOSS!', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '56px',
            color: '#9B59B6',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(50).setScale(0);

        this.tweens.add({
            targets: bossText,
            scaleX: 1.2, scaleY: 1.2,
            duration: 500,
            ease: 'Bounce.easeOut',
            onComplete: function () {
                self.tweens.add({
                    targets: bossText,
                    alpha: 0, duration: 500, delay: 1000,
                    onComplete: function () { bossText.destroy(); }
                });
            }
        });

        this.cameras.main.shake(500, 0.02);

        this.time.delayedCall(1500, function () {
            self.createPolvo();
        });
    }

    createPolvo() {
        var W = EscolaHeroes.GAME_WIDTH;
        var H = EscolaHeroes.GAME_HEIGHT;
        var self = this;

        // Gerar textura do polvo (corpo roxo grande)
        var g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x7B2D8E, 1);
        g.fillCircle(30, 30, 28);
        g.fillStyle(0x9B59B6, 1);
        g.fillCircle(30, 28, 22);
        g.fillStyle(0xFFFFFF, 1);
        g.fillCircle(22, 24, 6);
        g.fillCircle(38, 24, 6);
        g.fillStyle(0x000000, 1);
        g.fillCircle(23, 25, 3);
        g.fillCircle(39, 25, 3);
        g.fillStyle(0x7B2D8E, 0.8);
        g.fillEllipse(30, 38, 12, 5);
        g.generateTexture('boss_polvo', 60, 60);
        g.destroy();

        // Corpo
        this.polvo = {
            sprite: this.physics.add.sprite(W / 2, -40, 'boss_polvo'),
            hp: 200,
            maxHp: 200,
            alive: true,
            lastAttack: 0,
            tentacleAngle: 0,
            damage: 10
        };

        this.polvo.sprite.setScale(2);
        this.polvo.sprite.setDepth(6);

        // Adicionar ao grupo para colisao com projecteis
        this.monstersGroup.add(this.polvo.sprite);
        this.polvo.sprite.monsterRef = {
            alive: true,
            damage: 10,
            isInvulnerable: false,
            takeDamage: function (amount) { self.polvoTakeDamage(amount); },
            applySlowEffect: function () { }
        };

        // 4 tentaculos (graphics objects)
        this.tentacles = [];
        for (var i = 0; i < 4; i++) {
            var tentacle = {
                angle: (i / 4) * Math.PI * 2,
                length: 60,
                baseLength: 60,
                width: 8,
                attacking: false
            };
            this.tentacles.push(tentacle);
        }

        // Graphics para tentaculos
        this.tentacleGfx = this.add.graphics().setDepth(5);

        // Barra de vida
        this.polvoHealthBg = this.add.graphics().setDepth(50);
        this.polvoHealthFill = this.add.graphics().setDepth(51);
        this.polvoNameText = this.add.text(0, 0, 'POLVO DESPORTISTA', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '10px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(52);

        // Entrada
        this.tweens.add({
            targets: this.polvo.sprite,
            y: H / 3,
            duration: 1000,
            ease: 'Bounce.easeOut'
        });

        this.bossActive = true;
    }

    updatePolvo(time) {
        if (!this.polvo || !this.polvo.alive) return;

        var sprite = this.polvo.sprite;
        var player = this.player.sprite;

        // Mover lentamente
        var dx = player.x - sprite.x;
        var dy = player.y - sprite.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            sprite.setVelocity((dx / dist) * 30, (dy / dist) * 30);
        }

        // Rodar tentaculos
        this.polvo.tentacleAngle += 0.02;

        // Desenhar tentaculos
        this.tentacleGfx.clear();
        for (var i = 0; i < this.tentacles.length; i++) {
            var t = this.tentacles[i];
            var angle = t.angle + this.polvo.tentacleAngle;
            var endX = sprite.x + Math.cos(angle) * t.length;
            var endY = sprite.y + Math.sin(angle) * t.length;

            // Tentaculo (linha grossa)
            this.tentacleGfx.lineStyle(t.width, 0x9B59B6, 0.8);
            this.tentacleGfx.lineBetween(sprite.x, sprite.y, endX, endY);

            // Ponta do tentaculo
            this.tentacleGfx.fillStyle(0x7B2D8E, 1);
            this.tentacleGfx.fillCircle(endX, endY, t.width / 2 + 2);

            // Verificar colisao tentaculo com jogador
            var playerDist = Math.sqrt(
                (player.x - endX) * (player.x - endX) +
                (player.y - endY) * (player.y - endY)
            );
            if (playerDist < 25 && this.player.alive) {
                this.player.takeDamage(this.polvo.damage);
            }
        }

        // Ataque: a cada 3 segundos esticar um tentaculo
        if (time > this.polvo.lastAttack + 3000) {
            this.polvo.lastAttack = time;
            this.polvoAttack();
        }

        // Barra de vida
        this.updatePolvoHealthBar();
    }

    polvoAttack() {
        if (!this.polvo || !this.polvo.alive) return;

        // Escolher tentaculo aleatorio
        var idx = Math.floor(Math.random() * this.tentacles.length);
        var t = this.tentacles[idx];

        // Esticar rapidamente e retrair
        var self = this;
        t.attacking = true;
        t.width = 12;

        this.tweens.add({
            targets: t,
            length: 140,
            duration: 200,
            ease: 'Power2',
            yoyo: true,
            hold: 200,
            onComplete: function () {
                t.length = t.baseLength;
                t.width = 8;
                t.attacking = false;
            }
        });
    }

    polvoTakeDamage(amount) {
        if (!this.polvo || !this.polvo.alive) return;

        this.polvo.hp -= amount;
        this.polvo.sprite.setTint(0xFF0000);
        var self = this;
        this.time.delayedCall(100, function () {
            if (self.polvo && self.polvo.sprite && self.polvo.sprite.active) {
                self.polvo.sprite.clearTint();
            }
        });

        if (this.polvo.hp <= 0) {
            this.polvoDie();
        }
    }

    updatePolvoHealthBar() {
        if (!this.polvo || !this.polvo.sprite || !this.polvo.sprite.active) return;

        var x = this.polvo.sprite.x - 50;
        var y = this.polvo.sprite.y - 70;

        this.polvoHealthBg.clear();
        this.polvoHealthBg.fillStyle(0x333333, 0.8);
        this.polvoHealthBg.fillRoundedRect(x, y, 100, 8, 3);

        var ratio = this.polvo.hp / this.polvo.maxHp;
        this.polvoHealthFill.clear();
        if (ratio > 0) {
            this.polvoHealthFill.fillStyle(0xFF0000, 1);
            this.polvoHealthFill.fillRoundedRect(x + 1, y + 1, 98 * ratio, 6, 2);
        }

        this.polvoNameText.setPosition(this.polvo.sprite.x, y - 8);
    }

    polvoDie() {
        this.polvo.alive = false;
        this.polvo.sprite.monsterRef.alive = false;
        var self = this;
        var x = this.polvo.sprite.x;
        var y = this.polvo.sprite.y;

        // Tentaculos caem um a um
        for (var i = 0; i < this.tentacles.length; i++) {
            (function (idx) {
                self.time.delayedCall(idx * 300, function () {
                    self.tentacles[idx].length = 0;
                    self.tentacles[idx].width = 0;
                });
            })(i);
        }

        // Corpo explode apos tentaculos caem
        this.time.delayedCall(1500, function () {
            // Particulas
            for (var j = 0; j < 20; j++) {
                var particle = self.add.circle(x, y, 5 + Math.random() * 8, 0x9B59B6, 1);
                particle.setDepth(20);
                self.tweens.add({
                    targets: particle,
                    x: x + (Math.random() - 0.5) * 250,
                    y: y + (Math.random() - 0.5) * 250,
                    alpha: 0, scaleX: 0, scaleY: 0,
                    duration: 600 + Math.random() * 400,
                    onComplete: function () { particle.destroy(); }
                });
            }

            self.cameras.main.shake(400, 0.04);

            self.tweens.add({
                targets: self.polvo.sprite,
                scaleX: 0, scaleY: 0, alpha: 0, angle: 720,
                duration: 600,
                onComplete: function () {
                    if (self.polvo.sprite) self.polvo.sprite.destroy();
                    if (self.tentacleGfx) self.tentacleGfx.destroy();
                    if (self.polvoHealthBg) self.polvoHealthBg.destroy();
                    if (self.polvoHealthFill) self.polvoHealthFill.destroy();
                    if (self.polvoNameText) self.polvoNameText.destroy();
                }
            });

            // Drop power-up garantido
            var origChance = EscolaHeroes.POWERUP_DROP_CHANCE;
            EscolaHeroes.POWERUP_DROP_CHANCE = 1.0;
            EscolaHeroes.trySpawnPowerUp(self, x, y, self.powerUpGroup);
            EscolaHeroes.POWERUP_DROP_CHANCE = origChance;

            self.monstersKilled++;
            self.events.emit('monsterKilled', x, y, 80);

            // Nivel completo
            self.time.delayedCall(2000, function () {
                self.completeLevel();
            });
        });
    }

    completeLevel() {
        this.levelComplete = true;
        var elapsed = (this.time.now - this.levelStartTime) / 1000;

        this.scene.stop('HUDScene');
        this.scene.start('LevelCompleteScene', {
            levelName: 'PAVILHAO DESPORTIVO',
            nextLevelKey: 'ClassroomScene',
            stats: {
                monstersKilled: this.monstersKilled,
                totalMonsters: 21,
                hp: this.player.hp,
                time: elapsed,
                score: 0
            }
        });
    }

    // --- Collision handlers ---
    processMonsterHit(projectile, monsterSprite) {
        if (monsterSprite.monsterRef && monsterSprite.monsterRef.isInvulnerable) return false;
        return true;
    }

    onProjectileHitMonster(projectile, monsterSprite) {
        if (!projectile.active || !monsterSprite.active) return;
        var damage = projectile.damage || EscolaHeroes.PLAYER_STATS.projectileDamage;
        if (monsterSprite.monsterRef) {
            monsterSprite.monsterRef.takeDamage(damage);
        }
        projectile.destroy();
    }

    onMonsterHitPlayer(playerSprite, monsterSprite) {
        if (!playerSprite.active || !monsterSprite.active) return;
        if (!playerSprite.playerRef) return;
        if (monsterSprite.monsterRef && monsterSprite.monsterRef.isInvulnerable) return;
        var damage = 10;
        if (monsterSprite.monsterRef) damage = monsterSprite.monsterRef.damage;
        playerSprite.playerRef.takeDamage(damage);
    }

    onMonsterProjectileHitPlayer(playerSprite, projectile) {
        if (!playerSprite.active || !projectile.active) return;
        if (!playerSprite.playerRef) return;
        playerSprite.playerRef.takeDamage(projectile.damage || EscolaHeroes.MONSTER_PROJECTILE_DAMAGE);
        projectile.destroy();
    }

    onPlayerCollectPowerUp(playerSprite, powerup) {
        if (!playerSprite.active || !powerup.active) return;
        if (!playerSprite.playerRef) return;
        EscolaHeroes.applyPowerUp(this, playerSprite.playerRef, powerup);
    }

    cleanupProjectiles(group) {
        var W = EscolaHeroes.GAME_WIDTH;
        var H = EscolaHeroes.GAME_HEIGHT;
        var children = group.getChildren();
        for (var i = children.length - 1; i >= 0; i--) {
            var p = children[i];
            if (p.active && (p.x < -30 || p.x > W + 30 || p.y < -30 || p.y > H + 30)) {
                p.destroy();
            }
        }
    }
};

window.EscolaHeroes = EscolaHeroes;
