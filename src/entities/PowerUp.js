// ============================================
// PowerUp — Power-ups do Jogo
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

// Criar grupo de power-ups
EscolaHeroes.createPowerUpGroup = function (scene) {
    return scene.physics.add.group({
        maxSize: 10
    });
};

// Tentar spawnar power-up na posicao de um monstro morto
EscolaHeroes.trySpawnPowerUp = function (scene, x, y, powerUpGroup) {
    if (Math.random() > EscolaHeroes.POWERUP_DROP_CHANCE) return null;

    // Escolher tipo aleatorio
    var types = ['HEART', 'SHIELD', 'ATTACK', 'SPEED'];
    var typeKey = types[Math.floor(Math.random() * types.length)];
    var config = EscolaHeroes.POWERUPS[typeKey];

    var textureKey = 'powerup_' + typeKey.toLowerCase();

    // Verificar se a textura existe
    if (!scene.textures.exists(textureKey)) {
        textureKey = 'powerup_heart'; // fallback
    }

    var powerup = powerUpGroup.create(x, y, textureKey);
    if (!powerup) return null;

    powerup.setDepth(8);
    powerup.powerUpType = typeKey;
    powerup.powerUpConfig = config;

    // Animacao pulsante
    scene.tweens.add({
        targets: powerup,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    // Bobbing vertical
    scene.tweens.add({
        targets: powerup,
        y: y - 8,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    // Desaparecer apos POWERUP_LIFETIME (5s)
    scene.time.delayedCall(EscolaHeroes.POWERUP_LIFETIME - 1000, function () {
        if (powerup && powerup.active) {
            // Piscar antes de desaparecer
            scene.tweens.add({
                targets: powerup,
                alpha: 0,
                duration: 150,
                yoyo: true,
                repeat: 3,
                onComplete: function () {
                    if (powerup && powerup.active) powerup.destroy();
                }
            });
        }
    });

    return powerup;
};

// Aplicar power-up ao jogador
EscolaHeroes.applyPowerUp = function (scene, player, powerup) {
    if (!powerup || !powerup.active) return;

    var config = powerup.powerUpConfig;
    var type = powerup.powerUpType;
    var x = powerup.x;
    var y = powerup.y;

    EscolaHeroes.AudioManager.play('powerup');

    // Aplicar efeito
    switch (type) {
        case 'HEART':
            player.heal(config.value);
            EscolaHeroes.showPowerUpText(scene, x, y, '+25 HP', 0xFF0000);
            break;
        case 'SHIELD':
            player.activateShield(config.duration);
            EscolaHeroes.showPowerUpText(scene, x, y, 'ESCUDO!', 0x00BFFF);
            break;
        case 'ATTACK':
            player.activateDamageBoost(config.duration);
            EscolaHeroes.showPowerUpText(scene, x, y, 'DANO x3!', 0xFFD700);
            break;
        case 'SPEED':
            player.activateSpeed(config.duration);
            EscolaHeroes.showPowerUpText(scene, x, y, 'VELOCIDADE!', 0x00FF88);
            break;
    }

    // Flash no jogador
    if (player.sprite && player.sprite.active) {
        scene.tweens.add({
            targets: player.sprite,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 1
        });
    }

    // Destruir power-up
    powerup.destroy();
};

// Texto flutuante ao apanhar power-up
EscolaHeroes.showPowerUpText = function (scene, x, y, text, color) {
    var colorHex = '#' + color.toString(16).padStart(6, '0');
    var txt = scene.add.text(x, y, text, {
        fontFamily: 'Arial Black, Arial',
        fontSize: '18px',
        color: colorHex,
        stroke: '#000000',
        strokeThickness: 3
    }).setOrigin(0.5).setDepth(25);

    scene.tweens.add({
        targets: txt,
        y: y - 40,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: function () {
            txt.destroy();
        }
    });
};

window.EscolaHeroes = EscolaHeroes;
