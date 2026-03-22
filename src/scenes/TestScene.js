// ============================================
// TestScene — Scene de Teste (Temporaria)
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

EscolaHeroes.TestScene = class TestScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TestScene' });
    }

    create() {
        var W = EscolaHeroes.GAME_WIDTH;
        var H = EscolaHeroes.GAME_HEIGHT;

        // Fundo liso
        this.cameras.main.setBackgroundColor('#3a3a5e');

        // Grelha de fundo para referencia visual
        var grid = this.add.graphics();
        grid.lineStyle(1, 0xFFFFFF, 0.05);
        for (var gx = 0; gx < W; gx += 40) {
            grid.lineBetween(gx, 0, gx, H);
        }
        for (var gy = 0; gy < H; gy += 40) {
            grid.lineBetween(0, gy, W, gy);
        }

        // Personagem seleccionada
        this.charData = this.registry.get('selectedCharacter');

        // --- Criar grupos de fisica ---
        this.projectiles = EscolaHeroes.createProjectileGroup(this);
        this.monsterProjectiles = EscolaHeroes.createMonsterProjectileGroup(this);
        this.monstersGroup = this.physics.add.group();
        this.powerUpGroup = EscolaHeroes.createPowerUpGroup(this);

        // --- Criar jogador ---
        this.player = new EscolaHeroes.Player(this, W / 2, H / 2, this.charData);

        // --- Input teclado ---
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D
        });
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

        // --- Colisoes ---
        // Projecteis jogador vs monstros
        this.physics.add.overlap(
            this.projectiles,
            this.monstersGroup,
            this.onProjectileHitMonster,
            null,
            this
        );

        // Monstros vs jogador (contacto)
        this.physics.add.overlap(
            this.player.sprite,
            this.monstersGroup,
            this.onMonsterHitPlayer,
            null,
            this
        );

        // Projecteis monstro vs jogador
        this.physics.add.overlap(
            this.player.sprite,
            this.monsterProjectiles,
            this.onMonsterProjectileHitPlayer,
            null,
            this
        );

        // Jogador vs power-ups
        this.physics.add.overlap(
            this.player.sprite,
            this.powerUpGroup,
            this.onPlayerCollectPowerUp,
            null,
            this
        );

        // --- Limpar projecteis fora do ecra ---
        this.physics.world.setBounds(0, 0, W, H);
        this.physics.world.on('worldbounds', function (body) {
            if (body.gameObject) body.gameObject.destroy();
        });

        // --- Activar world bounds para projecteis ---
        this.projectiles.defaults = {};

        // --- Lancar HUD ---
        this.scene.launch('HUDScene');

        // --- Rastrear monstros activos ---
        this.monsters = [];
        this.monsterSpawnTimer = 0;
        this.monsterSpawnInterval = 2000;
        this.monstersKilled = 0;

        // --- Tipos de monstros disponiveis no teste ---
        this.availableMonsterTypes = [
            'GosmaVerde', 'Morcego', 'AranhaSaltitona',
            'Fantasma', 'LivroVoador', 'Sombra'
        ];

        // --- Evento de morte de monstro ---
        var self = this;
        this.events.on('monsterKilled', function (x, y, scoreValue) {
            self.monstersKilled++;
            self.player.addSpecialCharge();

            // Tentar spawnar power-up
            EscolaHeroes.trySpawnPowerUp(self, x, y, self.powerUpGroup);
        });

        // --- Texto de instrucoes ---
        this.add.text(W / 2, H - 12, 'WASD/Setas: mover | Espaco: disparar | Q: especial | Monstros aparecem automaticamente', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '10px',
            color: '#AAAAAA'
        }).setOrigin(0.5).setDepth(50);

        // Spawnar primeiros monstros
        this.spawnWave(3);
    }

    update(time, delta) {
        if (!this.player.alive) return;

        // Input mobile
        var hudScene = this.scene.get('HUDScene');
        var joystickData = hudScene ? hudScene.getJoystickData() : { x: 0, y: 0 };

        // Movimento do jogador
        this.player.update(this.cursors, time, this.wasd, joystickData);

        // Disparo
        var isFiring = this.spaceKey.isDown;
        if (hudScene && hudScene.isMobileFiring()) isFiring = true;

        // Tiro automatico continuo
        if (isFiring || joystickData.x !== 0 || joystickData.y !== 0) {
            var proj = this.player.shoot(time, this.projectiles);
            if (proj) {
                proj.body.onWorldBounds = true;
            }
        }

        // Ataque especial
        if (Phaser.Input.Keyboard.JustDown(this.qKey)) {
            this.player.useSpecial(this.monstersGroup);
        }
        if (hudScene && hudScene.isMobileSpecialPressed()) {
            this.player.useSpecial(this.monstersGroup);
        }

        // Update monstros
        for (var i = this.monsters.length - 1; i >= 0; i--) {
            var monster = this.monsters[i];
            if (monster.alive && monster.sprite.active) {
                monster.update(time, this.player.sprite);
                monster.tryShoot(time, this.player.sprite, this.monsterProjectiles);
            } else {
                this.monsters.splice(i, 1);
            }
        }

        // Spawn automatico de monstros
        if (time > this.monsterSpawnTimer + this.monsterSpawnInterval) {
            this.monsterSpawnTimer = time;
            if (this.monsters.length < 8) {
                this.spawnWave(1);
            }
        }

        // Limpar projecteis do jogador fora dos limites
        this.cleanupProjectiles(this.projectiles);
        this.cleanupProjectiles(this.monsterProjectiles);
    }

    spawnWave(count) {
        for (var i = 0; i < count; i++) {
            var monster = EscolaHeroes.spawnRandomMonster(
                this, this.monstersGroup, this.availableMonsterTypes
            );
            if (monster) {
                this.monsters.push(monster);
            }
        }
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

        var damage = 10;
        if (monsterSprite.monsterRef) {
            damage = monsterSprite.monsterRef.damage;
        }

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
            if (p.active && (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20)) {
                p.destroy();
            }
        }
    }
};

window.EscolaHeroes = EscolaHeroes;
