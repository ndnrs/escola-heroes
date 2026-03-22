// ============================================
// MonsterTypes — Fabrica de Monstros
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

// Criar um monstro de um tipo especifico
EscolaHeroes.spawnMonster = function (scene, typeName, x, y, monstersGroup) {
    var types = EscolaHeroes.MONSTER_TYPES;
    var config = null;

    // Encontrar config pelo nome
    var keys = Object.keys(types);
    for (var i = 0; i < keys.length; i++) {
        if (types[keys[i]].name === typeName) {
            config = types[keys[i]];
            break;
        }
    }

    if (!config) {
        console.warn('MonsterTypes: tipo desconhecido:', typeName);
        return null;
    }

    var monster = new EscolaHeroes.Monster(scene, x, y, config);
    monster.addToGroup(monstersGroup);

    // Animacoes especificas por tipo
    switch (typeName) {
        case 'GosmaVerde':
            // Bobbing lento
            scene.tweens.add({
                targets: monster.sprite,
                scaleY: 1.1,
                scaleX: 0.9,
                duration: 600,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            break;

        case 'Morcego':
            // Bater asas (escala x)
            scene.tweens.add({
                targets: monster.sprite,
                scaleX: 0.8,
                duration: 200,
                yoyo: true,
                repeat: -1
            });
            break;

        case 'AranhaSaltitona':
            // Salto visual periodico (cada 2 segundos)
            scene.time.addEvent({
                delay: 2000,
                callback: function () {
                    if (!monster.alive || !monster.sprite || !monster.sprite.active) return;
                    scene.tweens.add({
                        targets: monster.sprite,
                        y: monster.sprite.y - 80,
                        duration: 250,
                        ease: 'Power2',
                        yoyo: true
                    });
                },
                loop: true
            });
            break;

        case 'Fantasma':
            // Invulnerabilidade ciclica: visivel 3s, invisivel 1.5s
            monster.sprite.setAlpha(0.7);
            monster.isInvulnerable = false;
            scene.time.addEvent({
                delay: 3000,
                callback: function () {
                    if (!monster.alive || !monster.sprite || !monster.sprite.active) return;
                    // Ficar invisivel e invulneravel
                    monster.isInvulnerable = true;
                    if (monster.sprite.body) monster.sprite.body.enable = false;
                    scene.tweens.add({
                        targets: monster.sprite,
                        alpha: 0.1,
                        duration: 300,
                        onComplete: function () {
                            // Voltar ao normal apos 1.5s
                            scene.time.delayedCall(1500, function () {
                                if (!monster.alive || !monster.sprite || !monster.sprite.active) return;
                                monster.isInvulnerable = false;
                                if (monster.sprite.body) monster.sprite.body.enable = true;
                                scene.tweens.add({
                                    targets: monster.sprite,
                                    alpha: 0.7,
                                    duration: 300
                                });
                            });
                        }
                    });
                },
                loop: true
            });
            break;

        case 'LivroVoador':
            // Rotacao leve
            scene.tweens.add({
                targets: monster.sprite,
                angle: { from: -15, to: 15 },
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            break;

        case 'Sombra':
            // Pulsacao de escala
            scene.tweens.add({
                targets: monster.sprite,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 400,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            break;
    }

    return monster;
};

// Spawnar monstro aleatorio numa posicao aleatoria nos bordos do ecra
EscolaHeroes.spawnRandomMonster = function (scene, monstersGroup, allowedTypes) {
    var W = EscolaHeroes.GAME_WIDTH;
    var H = EscolaHeroes.GAME_HEIGHT;

    // Posicao aleatoria num dos 4 bordos
    var side = Math.floor(Math.random() * 4);
    var x, y;
    switch (side) {
        case 0: x = Math.random() * W; y = -20; break;        // Topo
        case 1: x = W + 20; y = Math.random() * H; break;     // Direita
        case 2: x = Math.random() * W; y = H + 20; break;     // Baixo
        case 3: x = -20; y = Math.random() * H; break;        // Esquerda
    }

    // Tipo aleatorio
    if (!allowedTypes) {
        allowedTypes = ['GosmaVerde', 'Morcego'];
    }
    var typeName = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];

    return EscolaHeroes.spawnMonster(scene, typeName, x, y, monstersGroup);
};

window.EscolaHeroes = EscolaHeroes;
