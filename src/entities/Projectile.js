// ============================================
// Projectile — Projecteis do Jogador
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

// Funcao auxiliar para criar o grupo de projecteis numa scene
EscolaHeroes.createProjectileGroup = function (scene) {
    var group = scene.physics.add.group({
        defaultKey: 'proj_matilde',
        maxSize: 30,
        runChildUpdate: false
    });

    // Limpar projecteis fora dos limites do mundo
    scene.physics.world.on('worldbounds', function (body) {
        if (body.gameObject && body.gameObject.texture &&
            body.gameObject.texture.key.indexOf('proj_') === 0) {
            body.gameObject.destroy();
        }
    });

    return group;
};

// Funcao auxiliar para criar o grupo de projecteis de monstros
EscolaHeroes.createMonsterProjectileGroup = function (scene) {
    var group = scene.physics.add.group({
        defaultKey: 'proj_monster',
        maxSize: 20,
        runChildUpdate: false
    });

    return group;
};

window.EscolaHeroes = EscolaHeroes;
