// ============================================
// CantinScene — Nivel 1: Cantina
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

EscolaHeroes.CantinScene = class CantinScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CantinScene' });
    }

    create() {
        var W = EscolaHeroes.GAME_WIDTH;
        var H = EscolaHeroes.GAME_HEIGHT;
        var self = this;

        // Fundo da cantina
        this.drawBackground(W, H);

        // Personagem
        this.charData = this.registry.get('selectedCharacter');

        // Grupos de fisica
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
        this.physics.add.overlap(this.projectiles, this.monstersGroup, this.onProjectileHitMonster, null, this);
        this.physics.add.overlap(this.player.sprite, this.monstersGroup, this.onMonsterHitPlayer, null, this);
        this.physics.add.overlap(this.player.sprite, this.monsterProjectiles, this.onMonsterProjectileHitPlayer, null, this);
        this.physics.add.overlap(this.player.sprite, this.powerUpGroup, this.onPlayerCollectPowerUp, null, this);

        // HUD
        this.scene.launch('HUDScene', { gameSceneKey: 'CantinScene', levelName: 'CANTINA' });

        // Tracking
        this.monsters = [];
        this.monstersKilled = 0;
        this.levelStartTime = this.time.now;
        this.bossActive = false;
        this.bossDefeated = false;
        this.levelComplete = false;

        // Eventos de morte de monstros
        this.events.on('monsterKilled', function (x, y, scoreValue) {
            self.monstersKilled++;
            self.player.addSpecialCharge();
            EscolaHeroes.trySpawnPowerUp(self, x, y, self.powerUpGroup);
        });

        // Wave configs (15 monstros em 3 waves de 5)
        var waveConfigs = [
            {
                monsters: [
                    { type: 'GosmaVerde', count: 5, entryFrom: 'right', delay: 600 }
                ]
            },
            {
                monsters: [
                    { type: 'GosmaVerde', count: 3, entryFrom: 'right', delay: 500 },
                    { type: 'Morcego', count: 2, entryFrom: 'top', delay: 500 }
                ]
            },
            {
                monsters: [
                    { type: 'GosmaVerde', count: 2, entryFrom: 'random', delay: 500 },
                    { type: 'Morcego', count: 3, entryFrom: 'random', delay: 400 }
                ]
            }
        ];

        this.waveManager = new EscolaHeroes.WaveManager(this, this.monstersGroup, waveConfigs);

        // Quando todas as waves acabam, spawnar boss
        this.events.on('allWavesComplete', function () {
            self.spawnBoss();
        });

        // Evento de morte do jogador
        this.events.on('playerDied', function () {
            self.waveManager.stop();
            self.time.delayedCall(1000, function () {
                self.scene.stop('HUDScene');
                self.scene.start('GameOverScene', {
                    levelKey: 'CantinScene',
                    stats: {
                        monstersKilled: self.monstersKilled,
                        time: (self.time.now - self.levelStartTime) / 1000
                    }
                });
            });
        });

        // Iniciar waves
        this.waveManager.start();

        // Guardar referencia dos monstros do WaveManager
        this._updateMonsterList();
    }

    update(time, delta) {
        if (!this.player.alive || this.levelComplete) return;

        var hudScene = this.scene.get('HUDScene');
        var joystickData = hudScene ? hudScene.getJoystickData() : { x: 0, y: 0 };

        // Movimento
        this.player.update(this.cursors, time, this.wasd, joystickData);

        // Tiro
        var isFiring = this.spaceKey.isDown;
        if (hudScene && hudScene.isMobileFiring()) isFiring = true;
        if (isFiring) {
            var proj = this.player.shoot(time, this.projectiles);
            if (proj) proj.body.onWorldBounds = true;
        }

        // Especial
        if (Phaser.Input.Keyboard.JustDown(this.qKey)) {
            this.player.useSpecial(this.monstersGroup);
        }
        if (hudScene && hudScene.isMobileSpecialPressed()) {
            this.player.useSpecial(this.monstersGroup);
        }

        // Update monstros
        this._updateMonsterList();
        for (var i = this.monsters.length - 1; i >= 0; i--) {
            var monster = this.monsters[i];
            if (monster.alive && monster.sprite && monster.sprite.active) {
                monster.update(time, this.player.sprite);
                monster.tryShoot(time, this.player.sprite, this.monsterProjectiles);
            } else if (!monster.alive) {
                this.monsters.splice(i, 1);
            }
        }

        // Update WaveManager
        this.waveManager.update();

        // Update boss
        if (this.boss && this.boss.alive) {
            this.updateBoss(time);
        }

        // Limpar projecteis
        this.cleanupProjectiles(this.projectiles);
        this.cleanupProjectiles(this.monsterProjectiles);
    }

    _updateMonsterList() {
        // Sincronizar lista de monstros com os que estao no WaveManager
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

        // Parede de fundo (creme)
        bg.fillStyle(0xFFF8DC, 1);
        bg.fillRect(0, 0, W, H);

        // Chao (bege/castanho claro)
        bg.fillStyle(0xDEB887, 1);
        bg.fillRect(0, H * 0.7, W, H * 0.3);

        // Linha do chao
        bg.lineStyle(2, 0xC8A87A, 1);
        bg.lineBetween(0, H * 0.7, W, H * 0.7);

        // Cozinha ao fundo (cinza)
        bg.fillStyle(0xBBBBBB, 1);
        bg.fillRect(W * 0.6, 20, W * 0.35, H * 0.25);
        bg.lineStyle(2, 0x999999, 1);
        bg.strokeRect(W * 0.6, 20, W * 0.35, H * 0.25);

        // Panelas (circulos)
        bg.fillStyle(0x888888, 1);
        bg.fillCircle(W * 0.68, 60, 12);
        bg.fillCircle(W * 0.78, 55, 15);
        bg.fillCircle(W * 0.88, 60, 10);

        // Janelas (topo)
        bg.fillStyle(0x87CEEB, 0.6);
        for (var jx = 0; jx < 4; jx++) {
            bg.fillRect(60 + jx * 180, 25, 60, 40);
            bg.lineStyle(2, 0x8B7355, 1);
            bg.strokeRect(60 + jx * 180, 25, 60, 40);
            bg.lineBetween(90 + jx * 180, 25, 90 + jx * 180, 65);
            bg.lineBetween(60 + jx * 180, 45, 120 + jx * 180, 45);
        }

        // Mesas (rectangulos castanhos)
        var tables = [
            { x: 100, y: 200, w: 80, h: 50 },
            { x: 300, y: 150, w: 70, h: 45 },
            { x: 550, y: 280, w: 85, h: 50 },
            { x: 150, y: 380, w: 75, h: 45 },
            { x: 400, y: 420, w: 80, h: 50 },
            { x: 650, y: 400, w: 70, h: 45 }
        ];

        for (var t = 0; t < tables.length; t++) {
            var tb = tables[t];
            bg.fillStyle(0x8B6914, 1);
            bg.fillRoundedRect(tb.x, tb.y, tb.w, tb.h, 4);
            bg.lineStyle(1, 0x704C0E, 1);
            bg.strokeRoundedRect(tb.x, tb.y, tb.w, tb.h, 4);

            // Tabuleiros nas mesas
            bg.fillStyle(0xFF6347, 0.7);
            bg.fillRect(tb.x + 10, tb.y + 8, 20, 15);
            bg.fillStyle(0x4A90D9, 0.7);
            bg.fillRect(tb.x + 40, tb.y + 10, 18, 12);
        }

        // Posters nas paredes
        var posterColors = [0xFF6347, 0x4A90D9, 0x2ECC71, 0xFF69B4];
        for (var p = 0; p < 4; p++) {
            bg.fillStyle(posterColors[p], 0.8);
            bg.fillRect(30 + p * 160, 80, 30, 40);
            bg.lineStyle(1, 0x000000, 0.3);
            bg.strokeRect(30 + p * 160, 80, 30, 40);
        }

        bg.setDepth(0);
    }

    spawnBoss() {
        var W = EscolaHeroes.GAME_WIDTH;
        var self = this;

        // Anuncio "BOSS!"
        var bossText = this.add.text(W / 2, 200, 'BOSS!', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '56px',
            color: '#FF0000',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(50).setScale(0);

        this.tweens.add({
            targets: bossText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            ease: 'Bounce.easeOut',
            onComplete: function () {
                self.tweens.add({
                    targets: bossText,
                    alpha: 0,
                    duration: 500,
                    delay: 1000,
                    onComplete: function () { bossText.destroy(); }
                });
            }
        });

        this.cameras.main.shake(500, 0.02);

        // Spawnar Gosma Gigante apos anuncio
        this.time.delayedCall(1500, function () {
            self.createGosmaGigante();
        });
    }

    createGosmaGigante() {
        var W = EscolaHeroes.GAME_WIDTH;
        var self = this;

        // Usar textura de gosma verde mas maior
        this.boss = {
            sprite: this.physics.add.sprite(W / 2, -40, 'monster_gosmaverde'),
            hp: 150,
            maxHp: 150,
            alive: true,
            lastShot: 0,
            damage: 15
        };

        this.boss.sprite.setScale(2.5);
        this.boss.sprite.setDepth(6);
        this.boss.sprite.bossRef = this.boss;

        // Adicionar ao grupo de monstros para colisao com projecteis
        this.monstersGroup.add(this.boss.sprite);

        // Referencia para colisao
        this.boss.sprite.monsterRef = {
            alive: true,
            damage: 15,
            takeDamage: function (amount) {
                self.bossTakeDamage(amount);
            },
            applySlowEffect: function () { },
            isInvulnerable: false
        };

        // Barra de vida do boss
        this.bossHealthBg = this.add.graphics().setDepth(50);
        this.bossHealthFill = this.add.graphics().setDepth(51);
        this.bossNameText = this.add.text(0, 0, 'GOSMA GIGANTE', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '10px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(52);

        // Tween de entrada
        this.tweens.add({
            targets: this.boss.sprite,
            y: 120,
            duration: 1000,
            ease: 'Bounce.easeOut'
        });

        // Bobbing do boss
        this.tweens.add({
            targets: this.boss.sprite,
            scaleY: 2.7,
            scaleX: 2.3,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 1000
        });

        this.bossActive = true;
    }

    updateBoss(time) {
        if (!this.boss || !this.boss.alive) return;

        var sprite = this.boss.sprite;
        var player = this.player.sprite;

        // Mover lentamente para o jogador
        var dx = player.x - sprite.x;
        var dy = player.y - sprite.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            sprite.setVelocity((dx / dist) * 40, (dy / dist) * 40);
        }

        // Disparar bolas de lodo a cada 2 segundos
        if (time > this.boss.lastShot + 2000) {
            this.boss.lastShot = time;
            this.bossShoot();
        }

        // Actualizar barra de vida
        this.updateBossHealthBar();
    }

    bossShoot() {
        if (!this.boss || !this.boss.alive) return;
        var sprite = this.boss.sprite;
        var player = this.player.sprite;

        var proj = this.monsterProjectiles.create(sprite.x, sprite.y, 'proj_monster');
        if (!proj) return;

        proj.setScale(1.5);
        proj.setTint(0x00AA00);
        proj.setDepth(5);

        var dx = player.x - sprite.x;
        var dy = player.y - sprite.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return;

        proj.setVelocity((dx / dist) * 150, (dy / dist) * 150);
        proj.damage = 15;

        var self = this;
        this.time.delayedCall(4000, function () {
            if (proj && proj.active) proj.destroy();
        });
    }

    updateBossHealthBar() {
        if (!this.boss || !this.boss.sprite || !this.boss.sprite.active) return;

        var x = this.boss.sprite.x - 40;
        var y = this.boss.sprite.y - 55;
        var w = 80;
        var h = 8;

        this.bossHealthBg.clear();
        this.bossHealthBg.fillStyle(0x333333, 0.8);
        this.bossHealthBg.fillRoundedRect(x, y, w, h, 3);

        var ratio = this.boss.hp / this.boss.maxHp;
        this.bossHealthFill.clear();
        if (ratio > 0) {
            this.bossHealthFill.fillStyle(0xFF0000, 1);
            this.bossHealthFill.fillRoundedRect(x + 1, y + 1, (w - 2) * ratio, h - 2, 2);
        }

        this.bossNameText.setPosition(this.boss.sprite.x, y - 8);
    }

    bossTakeDamage(amount) {
        if (!this.boss || !this.boss.alive) return;

        this.boss.hp -= amount;
        this.boss.sprite.setTint(0xFF0000);
        var self = this;
        this.time.delayedCall(100, function () {
            if (self.boss && self.boss.sprite && self.boss.sprite.active) {
                self.boss.sprite.clearTint();
            }
        });

        if (this.boss.hp <= 0) {
            this.bossDie();
        }
    }

    bossDie() {
        this.boss.alive = false;
        this.boss.sprite.monsterRef.alive = false;
        var self = this;
        var x = this.boss.sprite.x;
        var y = this.boss.sprite.y;

        // Explosao grande de particulas
        for (var i = 0; i < 15; i++) {
            var particle = this.add.circle(x, y, 6 + Math.random() * 8, 0x00AA00, 1);
            particle.setDepth(20);
            this.tweens.add({
                targets: particle,
                x: x + (Math.random() - 0.5) * 200,
                y: y + (Math.random() - 0.5) * 200,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: 600 + Math.random() * 400,
                onComplete: function () { particle.destroy(); }
            });
        }

        this.cameras.main.shake(300, 0.03);

        // Animacao de morte do boss
        this.tweens.add({
            targets: this.boss.sprite,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            angle: 720,
            duration: 800,
            onComplete: function () {
                if (self.boss.sprite) self.boss.sprite.destroy();
                if (self.bossHealthBg) self.bossHealthBg.destroy();
                if (self.bossHealthFill) self.bossHealthFill.destroy();
                if (self.bossNameText) self.bossNameText.destroy();
            }
        });

        // Drop garantido de power-up coracao
        var origChance = EscolaHeroes.POWERUP_DROP_CHANCE;
        EscolaHeroes.POWERUP_DROP_CHANCE = 1.0;
        EscolaHeroes.trySpawnPowerUp(this, x, y, this.powerUpGroup);
        EscolaHeroes.POWERUP_DROP_CHANCE = origChance;

        this.monstersKilled++;
        this.events.emit('monsterKilled', x, y, 50);

        // Nivel completo!
        this.time.delayedCall(2000, function () {
            self.completeLevel();
        });
    }

    completeLevel() {
        this.levelComplete = true;
        var elapsed = (this.time.now - this.levelStartTime) / 1000;

        this.scene.stop('HUDScene');
        this.scene.start('LevelCompleteScene', {
            levelName: 'CANTINA',
            nextLevelKey: 'GymScene',
            stats: {
                monstersKilled: this.monstersKilled,
                totalMonsters: 16, // 15 + boss
                hp: this.player.hp,
                time: elapsed,
                score: this.scene.get('HUDScene') ? 0 : 0
            }
        });
    }

    // --- Collision handlers (mesmos do TestScene) ---
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
        var damage = 10;
        if (monsterSprite.monsterRef) damage = monsterSprite.monsterRef.damage;
        playerSprite.playerRef.takeDamage(damage);
    }

    onMonsterProjectileHitPlayer(playerSprite, projectile) {
        if (!playerSprite.active || !projectile.active) return;
        if (!playerSprite.playerRef) return;
        var damage = projectile.damage || EscolaHeroes.MONSTER_PROJECTILE_DAMAGE;
        playerSprite.playerRef.takeDamage(damage);
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
