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
            // Nao precisa de tween extra, o salto esta no update
            break;

        case 'Fantasma':
            // Aparecer/desaparecer
            monster.sprite.setAlpha(0.7);
            scene.tweens.add({
                targets: monster.sprite,
                alpha: 0.3,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
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
