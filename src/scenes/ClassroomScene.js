// ============================================
// ClassroomScene — Nivel 3: Salas de Aula
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

EscolaHeroes.ClassroomScene = class ClassroomScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ClassroomScene' });
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
        this.scene.launch('HUDScene', { gameSceneKey: 'ClassroomScene', levelName: 'SALAS DE AULA' });

        // Tracking
        this.monsters = [];
        this.monstersKilled = 0;
        this.levelStartTime = this.time.now;
        this.bossActive = false;
        this.levelComplete = false;
        this.transitioning = false;

        // Boss
        this.boss = null;
        this.bossInvoked = [];

        // Posicoes das portas para spawn de monstros
        this.doorPositions = [
            { x: 80, y: 180 },
            { x: 240, y: 180 },
            { x: 400, y: 180 },
            { x: 560, y: 180 },
            { x: 720, y: 180 }
        ];

        // Eventos
        this.events.on('monsterKilled', function (x, y, scoreValue) {
            self.monstersKilled++;
            self.player.addSpecialCharge();
            EscolaHeroes.trySpawnPowerUp(self, x, y, self.powerUpGroup);
        });

        // Wave configs (25 monstros em 5 waves)
        var waveConfigs = [
            {
                monsters: [
                    { type: 'LivroVoador', count: 5, entryFrom: 'top', delay: 600 }
                ]
            },
            {
                monsters: [
                    { type: 'LivroVoador', count: 3, entryFrom: 'random', delay: 500 },
                    { type: 'Sombra', count: 2, entryFrom: 'random', delay: 400 }
                ]
            },
            {
                monsters: [
                    { type: 'Sombra', count: 5, entryFrom: 'random', delay: 350 }
                ]
            },
            {
                monsters: [
                    { type: 'LivroVoador', count: 3, entryFrom: 'random', delay: 500 },
                    { type: 'Sombra', count: 2, entryFrom: 'left', delay: 400 },
                    { type: 'GosmaVerde', count: 2, entryFrom: 'right', delay: 500 }
                ]
            },
            {
                monsters: [
                    { type: 'GosmaVerde', count: 1, entryFrom: 'random', delay: 500 },
                    { type: 'Morcego', count: 1, entryFrom: 'random', delay: 500 },
                    { type: 'AranhaSaltitona', count: 1, entryFrom: 'random', delay: 500 },
                    { type: 'LivroVoador', count: 1, entryFrom: 'random', delay: 500 },
                    { type: 'Sombra', count: 1, entryFrom: 'random', delay: 400 }
                ]
            }
        ];

        this.waveManager = new EscolaHeroes.WaveManager(this, this.monstersGroup, waveConfigs);

        this.events.on('allWavesComplete', function () {
            self.spawnBoss();
        });

        this.events.on('playerDied', function () {
            if (self.transitioning || self.levelComplete) return;
            self.transitioning = true;
            self.waveManager.stop();
            self.time.delayedCall(1000, function () {
                self.scene.stop('HUDScene');
                self.scene.start('GameOverScene', {
                    levelKey: 'ClassroomScene',
                    stats: {
                        monstersKilled: self.monstersKilled,
                        time: (self.time.now - self.levelStartTime) / 1000
                    }
                });
            });
        });

        // Delay para HUDScene inicializar
        var self2 = this;
        this.time.delayedCall(200, function () { self2.waveManager.start(); });
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
                monster.tryShoot(time, this.player.sprite, this.monsterProjectiles);
            } else if (!monster.alive) {
                this.monsters.splice(i, 1);
            }
        }

        this.waveManager.update();

        // Update boss
        if (this.boss && this.boss.alive) {
            this.updateBoss(time);
        }

        this.cleanupProjectiles(this.projectiles);
        this.cleanupProjectiles(this.monsterProjectiles);
    }

    _syncMonsters() {
        if (this.waveManager && this.waveManager.monstersInWave) {
            for (var i = 0; i < this.waveManager.monstersInWave.length; i++) {
                var m = this.waveManager.monstersInWave[i];
                if (this.monsters.indexOf(m) === -1) this.monsters.push(m);
            }
        }
    }

    drawBackground(W, H) {
        var bg = this.add.graphics();

        // Chao com ladrilhos
        bg.fillStyle(0xDDDDDD, 1);
        bg.fillRect(0, 0, W, H);
        bg.lineStyle(1, 0xCCCCCC, 0.3);
        for (var gx = 0; gx < W; gx += 40) bg.lineBetween(gx, 0, gx, H);
        for (var gy = 0; gy < H; gy += 40) bg.lineBetween(0, gy, W, gy);

        // Parede superior (creme com rodape castanho)
        bg.fillStyle(0xFFF5E1, 1);
        bg.fillRect(0, 0, W, 150);
        bg.fillStyle(0x8B6914, 1);
        bg.fillRect(0, 145, W, 8);

        // Portas
        var doorXs = [80, 240, 400, 560, 720];
        for (var d = 0; d < doorXs.length; d++) {
            var dx = doorXs[d] - 25;
            // Porta castanha
            bg.fillStyle(0x8B4513, 1);
            bg.fillRoundedRect(dx, 40, 50, 105, { tl: 8, tr: 8, bl: 0, br: 0 });
            // Janela na porta
            bg.fillStyle(0x87CEEB, 0.6);
            bg.fillRect(dx + 12, 50, 26, 20);
            bg.lineStyle(1, 0x704C0E, 1);
            bg.strokeRect(dx + 12, 50, 26, 20);
            // Macaneta
            bg.fillStyle(0xDAA520, 1);
            bg.fillCircle(dx + 40, 95, 4);
            // Placa de sala
            bg.fillStyle(0xFFFFFF, 0.9);
            bg.fillRect(dx + 8, 28, 34, 14);
        }

        // Texto das salas
        for (var s = 0; s < doorXs.length; s++) {
            this.add.text(doorXs[s], 35, 'SALA ' + (s + 1), {
                fontFamily: 'Arial, sans-serif',
                fontSize: '8px',
                color: '#333333'
            }).setOrigin(0.5).setDepth(1);
        }

        // Cacifos (serie de rectangulos coloridos na parede inferior)
        var lockerColors = [0x4A90D9, 0x2ECC71, 0xFF4444, 0x4A90D9, 0x2ECC71, 0xFF4444, 0x4A90D9, 0x2ECC71];
        for (var lk = 0; lk < lockerColors.length; lk++) {
            var lx = 30 + lk * 45;
            bg.fillStyle(lockerColors[lk], 0.7);
            bg.fillRect(lx, H - 80, 40, 60);
            bg.lineStyle(1, 0x333333, 0.5);
            bg.strokeRect(lx, H - 80, 40, 60);
            // Ventilacao
            bg.lineStyle(1, 0x333333, 0.3);
            bg.lineBetween(lx + 5, H - 70, lx + 35, H - 70);
            bg.lineBetween(lx + 5, H - 65, lx + 35, H - 65);
            // Trinco
            bg.fillStyle(0x333333, 0.8);
            bg.fillRect(lx + 17, H - 55, 6, 3);
        }

        // Quadros de avisos
        bg.fillStyle(0xD2B48C, 1);
        bg.fillRect(W - 120, 30, 90, 60);
        bg.lineStyle(2, 0x8B4513, 1);
        bg.strokeRect(W - 120, 30, 90, 60);
        // Papeis no quadro
        var paperColors = [0xFFFF00, 0xFF69B4, 0x87CEEB, 0x98FB98];
        for (var pc = 0; pc < paperColors.length; pc++) {
            bg.fillStyle(paperColors[pc], 0.8);
            bg.fillRect(W - 115 + (pc % 2) * 40, 35 + Math.floor(pc / 2) * 28, 30, 22);
        }

        // Relogio na parede
        bg.fillStyle(0xFFFFFF, 1);
        bg.fillCircle(W - 50, 130, 15);
        bg.lineStyle(2, 0x333333, 1);
        bg.strokeCircle(W - 50, 130, 15);
        // Ponteiros
        bg.lineStyle(2, 0x000000, 1);
        bg.lineBetween(W - 50, 130, W - 50, 119);
        bg.lineBetween(W - 50, 130, W - 42, 130);

        bg.setDepth(0);
    }

    // --- PROFESSOR ZOMBIE ---
    spawnBoss() {
        var W = EscolaHeroes.GAME_WIDTH;
        var H = EscolaHeroes.GAME_HEIGHT;
        var self = this;

        var bossText = this.add.text(W / 2, H / 2, 'PROFESSOR ZOMBIE!', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '42px',
            color: '#00AA00',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(50).setScale(0);

        this.tweens.add({
            targets: bossText,
            scaleX: 1, scaleY: 1,
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
            self.createProfessorZombie();
        });
    }

    createProfessorZombie() {
        var W = EscolaHeroes.GAME_WIDTH;
        var self = this;

        // Gerar textura do Professor Zombie
        var g = this.make.graphics({ x: 0, y: 0, add: false });
        var s = 60;
        // Corpo (retangulo verde palido)
        g.fillStyle(0x7BAF7B, 1);
        g.fillRoundedRect(s / 2 - 14, 22, 28, 30, 4);
        // Cabeca (circulo verde palido)
        g.fillStyle(0x8FBC8F, 1);
        g.fillCircle(s / 2, 14, 14);
        // Cabelo ralo
        g.fillStyle(0x555555, 1);
        g.fillRect(s / 2 - 10, 2, 20, 5);
        // Oculos partidos
        g.lineStyle(2, 0x333333, 1);
        g.strokeCircle(s / 2 - 5, 13, 5);
        g.beginPath();
        g.arc(s / 2 + 5, 13, 5, 0, Math.PI, false);
        g.strokePath();
        g.lineBetween(s / 2 - 10, 13, s / 2 + 10, 13);
        // Olhos zombie
        g.fillStyle(0xFF0000, 0.6);
        g.fillCircle(s / 2 - 5, 13, 2);
        g.fillCircle(s / 2 + 5, 13, 2);
        // Boca zombie
        g.lineStyle(2, 0x444444, 1);
        g.lineBetween(s / 2 - 4, 22, s / 2 + 4, 22);
        g.lineBetween(s / 2 - 2, 22, s / 2 - 2, 25);
        g.lineBetween(s / 2 + 2, 22, s / 2 + 2, 25);
        // Gravata torta
        g.fillStyle(0xAA0000, 1);
        g.fillTriangle(s / 2, 24, s / 2 - 5, 30, s / 2 + 3, 35);
        // Bracos
        g.fillStyle(0x7BAF7B, 1);
        g.fillRect(s / 2 - 22, 25, 8, 20);
        g.fillRect(s / 2 + 14, 25, 8, 20);
        // Pernas
        g.fillStyle(0x444444, 1);
        g.fillRect(s / 2 - 10, 52, 8, 8);
        g.fillRect(s / 2 + 2, 52, 8, 8);

        g.generateTexture('boss_zombie', s, s);
        g.destroy();

        this.boss = {
            sprite: this.physics.add.sprite(W / 2, -40, 'boss_zombie'),
            hp: 250,
            maxHp: 250,
            alive: true,
            lastShot: 0,
            lastInvoke: 0,
            damage: 10,
            phase: 1
        };

        this.boss.sprite.setScale(2);
        this.boss.sprite.setDepth(6);
        this.monstersGroup.add(this.boss.sprite);
        this.boss.sprite.monsterRef = {
            alive: true,
            damage: 10,
            isInvulnerable: false,
            takeDamage: function (amount) { self.bossTakeDamage(amount); },
            applySlowEffect: function () { }
        };

        // Barra de vida
        this.bossHealthBg = this.add.graphics().setDepth(50);
        this.bossHealthFill = this.add.graphics().setDepth(51);
        this.bossNameText = this.add.text(0, 0, 'PROFESSOR ZOMBIE', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '10px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(52);

        // Entrada
        this.tweens.add({
            targets: this.boss.sprite,
            y: 250,
            duration: 1000,
            ease: 'Bounce.easeOut'
        });

        this.bossActive = true;
        this.bossInvoked = [];
    }

    updateBoss(time) {
        if (!this.boss || !this.boss.alive) return;

        var sprite = this.boss.sprite;
        var player = this.player.sprite;

        // Determinar fase
        this.boss.phase = this.boss.hp > 150 ? 1 : 2;
        var speed = this.boss.phase === 1 ? 35 : 60;

        // Mover
        var dx = player.x - sprite.x;
        var dy = player.y - sprite.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            sprite.setVelocity((dx / dist) * speed, (dy / dist) * speed);
        }

        // Disparar giz a cada 2s
        if (time > this.boss.lastShot + 2000) {
            this.boss.lastShot = time;
            this.bossShootChalk();
        }

        // Fase 2: invocar Livro Voador a cada 5s (max 3)
        if (this.boss.phase === 2 && time > this.boss.lastInvoke + 5000) {
            this.boss.lastInvoke = time;
            this.bossInvokeLivro();
        }

        this.updateBossHealthBar();
    }

    bossShootChalk() {
        if (!this.boss || !this.boss.alive) return;

        var sprite = this.boss.sprite;
        var player = this.player.sprite;

        // Projectil de giz (branco)
        var proj = this.monsterProjectiles.create(sprite.x, sprite.y, 'proj_monster');
        if (!proj) return;

        proj.setTint(0xFFFFFF);
        proj.setScale(1.3);
        proj.setDepth(5);

        var dx = player.x - sprite.x;
        var dy = player.y - sprite.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return;

        var speed = this.boss.phase === 1 ? 180 : 250;
        proj.setVelocity((dx / dist) * speed, (dy / dist) * speed);
        proj.damage = 15;

        var self = this;
        this.time.delayedCall(4000, function () {
            if (proj && proj.active) proj.destroy();
        });
    }

    bossInvokeLivro() {
        // Limpar invocados mortos
        this.bossInvoked = this.bossInvoked.filter(function (m) { return m.alive; });
        if (this.bossInvoked.length >= 3) return;

        var self = this;
        var sprite = this.boss.sprite;

        // Animacao de invocar (bracos levantam)
        this.tweens.add({
            targets: sprite,
            scaleY: 2.3,
            duration: 200,
            yoyo: true
        });

        // Spawnar numa porta aleatoria
        var doorIdx = Math.floor(Math.random() * this.doorPositions.length);
        var door = this.doorPositions[doorIdx];

        // Flash na porta
        var flash = this.add.circle(door.x, door.y, 20, 0x00FF00, 0.6).setDepth(15);
        this.tweens.add({
            targets: flash,
            alpha: 0, scaleX: 2, scaleY: 2,
            duration: 500,
            onComplete: function () { flash.destroy(); }
        });

        this.time.delayedCall(300, function () {
            var monster = EscolaHeroes.spawnMonster(self, 'LivroVoador', door.x, door.y + 30, self.monstersGroup);
            if (monster) {
                self.bossInvoked.push(monster);
                self.monsters.push(monster);
            }
        });
    }

    updateBossHealthBar() {
        if (!this.boss || !this.boss.sprite || !this.boss.sprite.active) return;

        var x = this.boss.sprite.x - 50;
        var y = this.boss.sprite.y - 70;

        this.bossHealthBg.clear();
        this.bossHealthBg.fillStyle(0x333333, 0.8);
        this.bossHealthBg.fillRoundedRect(x, y, 100, 8, 3);

        var ratio = this.boss.hp / this.boss.maxHp;
        this.bossHealthFill.clear();
        if (ratio > 0) {
            var color = this.boss.phase === 1 ? 0xFF0000 : 0xFF4400;
            this.bossHealthFill.fillStyle(color, 1);
            this.bossHealthFill.fillRoundedRect(x + 1, y + 1, 98 * ratio, 6, 2);
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

        // Matar invocados
        for (var i = 0; i < this.bossInvoked.length; i++) {
            if (this.bossInvoked[i].alive) {
                this.bossInvoked[i].takeDamage(999);
            }
        }

        // Animacao: partes caem (desmorona)
        var parts = [
            { dx: -15, dy: -20, w: 12, h: 12, color: 0x8FBC8F }, // cabeca
            { dx: 0, dy: 0, w: 20, h: 25, color: 0x7BAF7B },   // corpo
            { dx: -18, dy: 5, w: 8, h: 18, color: 0x7BAF7B },   // braco E
            { dx: 18, dy: 5, w: 8, h: 18, color: 0x7BAF7B },    // braco D
            { dx: -5, dy: 15, w: 6, h: 6, color: 0xAA0000 }     // gravata
        ];

        for (var p = 0; p < parts.length; p++) {
            var part = this.add.rectangle(
                x + parts[p].dx, y + parts[p].dy,
                parts[p].w, parts[p].h,
                parts[p].color
            ).setDepth(20);

            this.tweens.add({
                targets: part,
                y: y + 100 + Math.random() * 50,
                x: x + parts[p].dx + (Math.random() - 0.5) * 80,
                angle: Math.random() * 360,
                alpha: 0,
                duration: 800,
                delay: p * 150,
                onComplete: function () { part.destroy(); }
            });
        }

        // Explosao de particulas
        for (var j = 0; j < 12; j++) {
            var particle = this.add.circle(x, y, 4 + Math.random() * 6, 0x7BAF7B, 1);
            particle.setDepth(20);
            this.tweens.add({
                targets: particle,
                x: x + (Math.random() - 0.5) * 200,
                y: y + (Math.random() - 0.5) * 200,
                alpha: 0, scaleX: 0, scaleY: 0,
                duration: 600 + Math.random() * 400,
                onComplete: function () { particle.destroy(); }
            });
        }

        this.cameras.main.shake(400, 0.03);

        this.tweens.add({
            targets: this.boss.sprite,
            alpha: 0, scaleX: 0, scaleY: 0,
            duration: 400,
            delay: 500,
            onComplete: function () {
                if (self.boss.sprite) self.boss.sprite.destroy();
                if (self.bossHealthBg) self.bossHealthBg.destroy();
                if (self.bossHealthFill) self.bossHealthFill.destroy();
                if (self.bossNameText) self.bossNameText.destroy();
            }
        });

        // Drop garantido
        var origChance = EscolaHeroes.POWERUP_DROP_CHANCE;
        EscolaHeroes.POWERUP_DROP_CHANCE = 1.0;
        EscolaHeroes.trySpawnPowerUp(this, x, y, this.powerUpGroup);
        EscolaHeroes.POWERUP_DROP_CHANCE = origChance;

        this.monstersKilled++;
        this.events.emit('monsterKilled', x, y, 100);

        this.time.delayedCall(2000, function () {
            self.completeLevel();
        });
    }

    completeLevel() {
        if (this.transitioning) return;
        this.transitioning = true;
        this.levelComplete = true;
        var elapsed = (this.time.now - this.levelStartTime) / 1000;

        var hudScene = this.scene.get('HUDScene');
        var score = (hudScene && hudScene.score) ? hudScene.score : 0;
        this.scene.stop('HUDScene');

        this.scene.start('LevelCompleteScene', {
            levelName: 'SALAS DE AULA',
            nextLevelKey: 'BossScene',
            stats: {
                monstersKilled: this.monstersKilled,
                totalMonsters: 26,
                hp: this.player.hp,
                time: elapsed,
                score: score
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
        if (monsterSprite.monsterRef) monsterSprite.monsterRef.takeDamage(damage);
        projectile.destroy();
    }

    onMonsterHitPlayer(playerSprite, monsterSprite) {
        if (this.transitioning || this.levelComplete) return;
        if (!playerSprite.active || !monsterSprite.active) return;
        if (!playerSprite.playerRef) return;
        if (monsterSprite.monsterRef && monsterSprite.monsterRef.isInvulnerable) return;
        var damage = monsterSprite.monsterRef ? monsterSprite.monsterRef.damage : 10;
        playerSprite.playerRef.takeDamage(damage);
    }

    onMonsterProjectileHitPlayer(playerSprite, projectile) {
        if (this.transitioning || this.levelComplete) return;
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
