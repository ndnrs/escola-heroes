// ============================================
// Monster — Classe Base de Monstro
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

EscolaHeroes.Monster = function (scene, x, y, typeConfig) {
    this.scene = scene;
    this.typeConfig = typeConfig;

    // Criar sprite
    var textureKey = 'monster_' + typeConfig.name.toLowerCase();
    this.sprite = scene.physics.add.sprite(x, y, textureKey);
    this.sprite.setDepth(5);

    // Reduzir hitbox para colisoes mais justas (textura 40x40)
    this.sprite.body.setSize(24, 24);
    this.sprite.body.setOffset(8, 8);

    // Referencia para callbacks de colisao
    this.sprite.monsterRef = this;

    // Propriedades
    this.hp = typeConfig.hp;
    this.maxHp = typeConfig.hp;
    this.speed = typeConfig.speed;
    this.damage = typeConfig.damage;
    this.scoreValue = typeConfig.scoreValue;
    this.typeName = typeConfig.name;
    this.alive = true;
    this.isSlowed = false;
    this.speedMultiplier = 1;

    // Variacao de movimento (para nao ser linear)
    this.moveTimer = 0;
    this.moveOffset = Math.random() * Math.PI * 2;
};

// Adicionar sprite a um grupo de fisica
EscolaHeroes.Monster.prototype.addToGroup = function (group) {
    group.add(this.sprite);
    return this;
};

// Update — IA basica: mover em direcao ao jogador
EscolaHeroes.Monster.prototype.update = function (time, playerSprite) {
    if (!this.alive || !this.sprite.active || !playerSprite || !playerSprite.active) return;

    this.moveTimer = time;
    var currentSpeed = this.speed * this.speedMultiplier;

    // Direcao para o jogador
    var dx = playerSprite.x - this.sprite.x;
    var dy = playerSprite.y - this.sprite.y;
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (dist === 0) return;

    var nx = dx / dist;
    var ny = dy / dist;

    // Comportamento por tipo
    var vx = nx * currentSpeed;
    var vy = ny * currentSpeed;

    switch (this.typeName) {
        case 'Morcego':
            // Zig-zag (seno aplicado perpendicularmente)
            var zigzag = Math.sin((time + this.moveOffset * 1000) * 0.005) * 80;
            vx += -ny * zigzag * 0.02;
            vy += nx * zigzag * 0.02;
            break;

        case 'AranhaSaltitona':
            // Saltos periodicos
            if (Math.sin((time + this.moveOffset * 1000) * 0.003) > 0.7) {
                vx *= 2.5;
                vy *= 2.5;
            }
            break;

        case 'Fantasma':
            // Movimento sinuoso
            var wave = Math.sin((time + this.moveOffset * 1000) * 0.002) * 50;
            vx += -ny * wave * 0.03;
            vy += nx * wave * 0.03;
            break;

        case 'Sombra':
            // Muda direcao a cada 1.5s dentro de 45 graus da direcao ao jogador
            if (!this._lastDirChange) this._lastDirChange = 0;
            if (time > this._lastDirChange + 1500) {
                this._lastDirChange = time;
                var baseAngle = Math.atan2(ny, nx);
                var deviation = (Math.random() - 0.5) * (Math.PI / 2);
                this._sombraAngle = baseAngle + deviation;
            }
            if (this._sombraAngle !== undefined) {
                vx = Math.cos(this._sombraAngle) * currentSpeed;
                vy = Math.sin(this._sombraAngle) * currentSpeed;
            }
            break;

        default:
            // Variacao leve (GosmaVerde, LivroVoador)
            var drift = Math.sin((time + this.moveOffset * 1000) * 0.001) * 20;
            vx += drift * 0.02;
            break;
    }

    this.sprite.setVelocity(vx, vy);
};

// Disparo de monstro (para LivroVoador)
EscolaHeroes.Monster.prototype.tryShoot = function (time, playerSprite, monsterProjectiles) {
    if (this.typeName !== 'LivroVoador') return;
    if (!this.alive || !this.sprite.active || !playerSprite || !playerSprite.active) return;

    // Dispara letra a cada 2.5 segundos
    if (!this._lastShot) this._lastShot = 0;
    if (time < this._lastShot + 2500) return;
    this._lastShot = time;

    // Projectil letra
    var letters = ['A', 'B', 'C', 'X', 'Z'];
    var letter = letters[Math.floor(Math.random() * letters.length)];
    var proj = this.scene.add.text(this.sprite.x, this.sprite.y, letter, {
        fontFamily: 'Arial Black, Arial',
        fontSize: '16px',
        color: '#FFFFFF',
        stroke: '#8B4513',
        strokeThickness: 3
    }).setOrigin(0.5).setDepth(5);

    this.scene.physics.add.existing(proj);
    monsterProjectiles.add(proj);

    var dx = playerSprite.x - this.sprite.x;
    var dy = playerSprite.y - this.sprite.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;

    proj.body.setVelocity((dx / dist) * 200, (dy / dist) * 200);
    proj.damage = EscolaHeroes.MONSTER_PROJECTILE_DAMAGE;

    // Auto-destruir apos 3 segundos
    this.scene.time.delayedCall(3000, function () {
        if (proj && proj.active) proj.destroy();
    });
};

// Receber dano
EscolaHeroes.Monster.prototype.takeDamage = function (amount) {
    if (!this.alive) return;

    this.hp -= amount;

    EscolaHeroes.AudioManager.play('hit');

    // Flash vermelho
    if (this.sprite && this.sprite.active) {
        this.sprite.setTint(0xFF0000);
        var self = this;
        this.scene.time.delayedCall(100, function () {
            if (self.sprite && self.sprite.active) {
                self.sprite.clearTint();
            }
        });
    }

    if (this.hp <= 0) {
        this.die();
    }
};

// Morte do monstro
EscolaHeroes.Monster.prototype.die = function () {
    if (!this.alive) return;
    this.alive = false;

    var self = this;
    var x = this.sprite.x;
    var y = this.sprite.y;
    var color = this.typeConfig.color;

    // Particulas de morte (circulos coloridos)
    for (var i = 0; i < 6; i++) {
        var particle = this.scene.add.circle(x, y, 4 + Math.random() * 4, color, 1);
        particle.setDepth(15);
        this.scene.tweens.add({
            targets: particle,
            x: x + (Math.random() - 0.5) * 80,
            y: y + (Math.random() - 0.5) * 80,
            alpha: 0,
            scaleX: 0,
            scaleY: 0,
            duration: 400 + Math.random() * 200,
            onComplete: function () {
                particle.destroy();
            }
        });
    }

    // Animacao de escala 0
    this.scene.tweens.add({
        targets: this.sprite,
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        duration: 200,
        onComplete: function () {
            if (self.sprite && self.sprite.active) {
                self.sprite.destroy();
            }
        }
    });

    EscolaHeroes.AudioManager.play('monsterDie');

    // Emitir evento de morte (para power-ups e score)
    this.scene.events.emit('monsterKilled', x, y, this.scoreValue);
};

// Aplicar efeito de lentidao (especial da Riana)
EscolaHeroes.Monster.prototype.applySlowEffect = function (duration) {
    var self = this;
    this.isSlowed = true;
    this.speedMultiplier = 0.3;

    if (this.sprite && this.sprite.active) {
        this.sprite.setTint(0x87CEEB);
    }

    this.scene.time.delayedCall(duration, function () {
        self.isSlowed = false;
        self.speedMultiplier = 1;
        if (self.sprite && self.sprite.active) {
            self.sprite.clearTint();
        }
    });
};

window.EscolaHeroes = EscolaHeroes;
