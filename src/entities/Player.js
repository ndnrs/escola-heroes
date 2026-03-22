// ============================================
// Player — Classe do Jogador
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

EscolaHeroes.Player = function (scene, x, y, characterData) {
    this.scene = scene;
    this.characterData = characterData;

    // Criar sprite a partir da textura pre-gerada no BootScene
    var textureKey = 'char_' + characterData.name.toLowerCase();
    this.sprite = scene.physics.add.sprite(x, y, textureKey);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setScale(1.5);
    this.sprite.setDepth(10);

    // Referencia para callbacks de colisao
    this.sprite.playerRef = this;

    // Propriedades
    this.hp = EscolaHeroes.PLAYER_STATS.hp;
    this.maxHp = EscolaHeroes.PLAYER_STATS.hp;
    this.speed = EscolaHeroes.PLAYER_STATS.speed;
    this.fireRate = EscolaHeroes.PLAYER_STATS.fireRate;
    this.damage = EscolaHeroes.PLAYER_STATS.projectileDamage;
    this.specialCharge = 0;
    this.specialMax = EscolaHeroes.SPECIAL_KILLS_NEEDED;
    this.isShielded = false;
    this.isDamageBoost = false;
    this.isSpeedBoost = false;
    this.isInvincible = false;
    this.lastFired = 0;
    this.facingX = 1;
    this.facingY = 0;
    this.alive = true;
    this.damageMultiplier = 1;
    this.speedMultiplier = 1;
};

// Movimento 8 direcoes
EscolaHeroes.Player.prototype.update = function (cursors, time, wasd, joystickData) {
    if (!this.alive) return;

    var vx = 0;
    var vy = 0;
    var currentSpeed = this.speed * this.speedMultiplier;

    // Input mobile (joystick)
    if (joystickData && (joystickData.x !== 0 || joystickData.y !== 0)) {
        vx = joystickData.x;
        vy = joystickData.y;
    } else {
        // Input teclado
        if (cursors.left.isDown || (wasd && wasd.A.isDown)) vx = -1;
        if (cursors.right.isDown || (wasd && wasd.D.isDown)) vx = 1;
        if (cursors.up.isDown || (wasd && wasd.W.isDown)) vy = -1;
        if (cursors.down.isDown || (wasd && wasd.S.isDown)) vy = 1;

        // Normalizar diagonal
        if (vx !== 0 && vy !== 0) {
            var factor = 0.7071;
            vx *= factor;
            vy *= factor;
        }
    }

    this.sprite.setVelocity(vx * currentSpeed, vy * currentSpeed);

    // Actualizar direcao de facing
    if (vx !== 0 || vy !== 0) {
        this.facingX = vx;
        this.facingY = vy;
    }
};

// Disparar projectil
EscolaHeroes.Player.prototype.shoot = function (time, projectiles) {
    if (!this.alive) return null;
    if (time < this.lastFired + this.fireRate) return null;

    this.lastFired = time;

    var projKey = 'proj_' + this.characterData.name.toLowerCase();
    var proj = projectiles.create(this.sprite.x, this.sprite.y, projKey);
    if (!proj) return null;

    proj.setDepth(5);

    var speed = 400;
    var len = Math.sqrt(this.facingX * this.facingX + this.facingY * this.facingY);
    if (len === 0) len = 1;
    var nx = this.facingX / len;
    var ny = this.facingY / len;

    proj.setVelocity(nx * speed, ny * speed);
    proj.damage = this.damage * this.damageMultiplier;

    // Rotacao do projectil na direcao do movimento
    proj.setRotation(Math.atan2(ny, nx));

    EscolaHeroes.AudioManager.play('shoot');
    return proj;
};

// Receber dano
EscolaHeroes.Player.prototype.takeDamage = function (amount) {
    if (!this.alive || this.isInvincible || this.isShielded) return;

    this.hp -= amount;
    if (this.hp < 0) this.hp = 0;

    // Flash visual
    this.isInvincible = true;
    var self = this;
    this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0.3,
        duration: 100,
        yoyo: true,
        repeat: 2,
        onComplete: function () {
            if (self.sprite && self.sprite.active) self.sprite.alpha = 1;
        }
    });

    // Invencibilidade temporaria (500ms)
    this.scene.time.delayedCall(500, function () {
        self.isInvincible = false;
    });

    // Screen shake
    this.scene.cameras.main.shake(100, 0.01);

    EscolaHeroes.AudioManager.play('playerDamage');

    // Notificar HUD
    this.scene.events.emit('playerDamaged', this.hp, this.maxHp);

    if (this.hp <= 0) {
        this.die();
    }
};

// Curar
EscolaHeroes.Player.prototype.heal = function (amount) {
    this.hp = Math.min(this.hp + amount, this.maxHp);
    this.scene.events.emit('playerDamaged', this.hp, this.maxHp);
};

// Activar escudo
EscolaHeroes.Player.prototype.activateShield = function (duration) {
    var self = this;
    this.isShielded = true;
    this.sprite.setTint(0x00BFFF);

    var shieldTween = this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0.7,
        duration: 300,
        yoyo: true,
        repeat: -1
    });

    this.scene.time.delayedCall(duration, function () {
        self.isShielded = false;
        if (self.sprite && self.sprite.active) {
            self.sprite.clearTint();
            self.sprite.alpha = 1;
        }
        if (shieldTween) shieldTween.stop();
    });
};

// Activar dano x3
EscolaHeroes.Player.prototype.activateDamageBoost = function (duration) {
    var self = this;
    this.isDamageBoost = true;
    this.damageMultiplier = 3;
    this.sprite.setTint(0xFFD700);

    this.scene.time.delayedCall(duration, function () {
        self.isDamageBoost = false;
        self.damageMultiplier = 1;
        if (self.sprite && self.sprite.active) self.sprite.clearTint();
    });
};

// Activar velocidade x1.5
EscolaHeroes.Player.prototype.activateSpeed = function (duration) {
    var self = this;
    this.isSpeedBoost = true;
    this.speedMultiplier = 1.5;
    this.sprite.setTint(0x00FF88);

    this.scene.time.delayedCall(duration, function () {
        self.isSpeedBoost = false;
        self.speedMultiplier = 1;
        if (self.sprite && self.sprite.active) self.sprite.clearTint();
    });
};

// Adicionar carga especial
EscolaHeroes.Player.prototype.addSpecialCharge = function () {
    if (this.specialCharge < this.specialMax) {
        this.specialCharge++;
        this.scene.events.emit('specialChargeChanged', this.specialCharge, this.specialMax);
    }
};

// Usar ataque especial
EscolaHeroes.Player.prototype.useSpecial = function (monsters) {
    if (this.specialCharge < this.specialMax || !this.alive) return false;

    this.specialCharge = 0;
    this.scene.events.emit('specialChargeChanged', this.specialCharge, this.specialMax);

    var self = this;
    var charName = this.characterData.name;
    var specialDamage = EscolaHeroes.PLAYER_STATS.specialDamage;
    var effectColor = this.characterData.color;

    // Efeito visual: circulo expansivo
    var effectGfx = this.scene.add.graphics();
    effectGfx.setDepth(20);
    var radius = { value: 10 };

    this.scene.tweens.add({
        targets: radius,
        value: 150,
        duration: 500,
        onUpdate: function () {
            effectGfx.clear();
            effectGfx.lineStyle(3, effectColor, 1 - radius.value / 150);
            effectGfx.strokeCircle(self.sprite.x, self.sprite.y, radius.value);
            effectGfx.fillStyle(effectColor, 0.2 * (1 - radius.value / 150));
            effectGfx.fillCircle(self.sprite.x, self.sprite.y, radius.value);
        },
        onComplete: function () {
            effectGfx.destroy();
        }
    });

    EscolaHeroes.AudioManager.play('special');

    // Flash da camera
    this.scene.cameras.main.flash(300,
        (effectColor >> 16) & 0xFF,
        (effectColor >> 8) & 0xFF,
        effectColor & 0xFF
    );

    // Dano em area a todos os monstros no alcance
    if (monsters) {
        var children = monsters.getChildren();
        for (var i = 0; i < children.length; i++) {
            var monster = children[i];
            if (monster.active && monster.monsterRef) {
                var dist = Phaser.Math.Distance.Between(
                    self.sprite.x, self.sprite.y,
                    monster.x, monster.y
                );
                if (dist < 150) {
                    monster.monsterRef.takeDamage(specialDamage);
                }
            }
        }
    }

    // Efeitos especificos por personagem
    if (charName === 'Riana') {
        // Onda congelante: abranda todos os monstros
        if (monsters) {
            var children2 = monsters.getChildren();
            for (var j = 0; j < children2.length; j++) {
                if (children2[j].active && children2[j].monsterRef) {
                    children2[j].monsterRef.applySlowEffect(3000);
                }
            }
        }
    } else if (charName === 'Violeta') {
        // Escudo violeta: invencibilidade 3s
        this.activateShield(3000);
    }

    return true;
};

// Morte do jogador
EscolaHeroes.Player.prototype.die = function () {
    this.alive = false;
    this.sprite.setVelocity(0, 0);

    this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0,
        scaleX: 0.5,
        scaleY: 0.5,
        angle: 360,
        duration: 500
    });

    this.scene.events.emit('playerDied');
};

window.EscolaHeroes = EscolaHeroes;
