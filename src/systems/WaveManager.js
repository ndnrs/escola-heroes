// ============================================
// WaveManager — Sistema de Waves de Monstros
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

// Wave config format:
// [{ monsters: [{ type: 'GosmaVerde', count: 3, entryFrom: 'right', delay: 500 }] }]
EscolaHeroes.WaveManager = function (scene, monstersGroup, waveConfigs) {
    this.scene = scene;
    this.monstersGroup = monstersGroup;
    this.waveConfigs = waveConfigs;
    this.currentWave = -1;
    this.monstersInWave = [];
    this.expectedCount = 0;
    this.active = false;
    this.allComplete = false;
    this.waveInProgress = false;
    this.totalKilled = 0;
};

EscolaHeroes.WaveManager.prototype.start = function () {
    this.active = true;
    this.startNextWave();
};

EscolaHeroes.WaveManager.prototype.startNextWave = function () {
    this.currentWave++;

    if (this.currentWave >= this.waveConfigs.length) {
        this.allComplete = true;
        this.active = false;
        this.scene.events.emit('allWavesComplete');
        return;
    }

    this.monstersInWave = [];
    this.waveInProgress = true;

    // Calcular total esperado
    var config = this.waveConfigs[this.currentWave];
    this.expectedCount = 0;
    for (var i = 0; i < config.monsters.length; i++) {
        this.expectedCount += config.monsters[i].count;
    }

    // Mostrar texto da wave (excepto a primeira)
    var spawnDelay = 500;
    if (this.currentWave > 0) {
        this.showWaveText(this.currentWave + 1);
        spawnDelay = 1500;
    }

    this.scene.events.emit('waveStart', this.currentWave + 1, this.waveConfigs.length);

    // Spawnar monstros com delays
    var delay = spawnDelay;
    var self = this;

    for (var j = 0; j < config.monsters.length; j++) {
        var mc = config.monsters[j];
        for (var k = 0; k < mc.count; k++) {
            (function (type, entryFrom) {
                self.scene.time.delayedCall(delay, function () {
                    if (!self.active && !self.waveInProgress) return;
                    var pos = self.getEntryPosition(entryFrom);
                    var monster = EscolaHeroes.spawnMonster(self.scene, type, pos.x, pos.y, self.monstersGroup);
                    if (monster) {
                        self.monstersInWave.push(monster);
                    }
                });
            })(mc.type, mc.entryFrom || 'random');
            delay += mc.delay || 500;
        }
    }
};

EscolaHeroes.WaveManager.prototype.getEntryPosition = function (side) {
    var W = EscolaHeroes.GAME_WIDTH;
    var H = EscolaHeroes.GAME_HEIGHT;
    var margin = 30;

    if (side === 'random') {
        var sides = ['top', 'bottom', 'left', 'right'];
        side = sides[Math.floor(Math.random() * 4)];
    }

    switch (side) {
        case 'top': return { x: 80 + Math.random() * (W - 160), y: -margin };
        case 'bottom': return { x: 80 + Math.random() * (W - 160), y: H + margin };
        case 'left': return { x: -margin, y: 80 + Math.random() * (H - 160) };
        case 'right': return { x: W + margin, y: 80 + Math.random() * (H - 160) };
        default: return { x: W + margin, y: 80 + Math.random() * (H - 160) };
    }
};

EscolaHeroes.WaveManager.prototype.update = function () {
    if (!this.waveInProgress || this.allComplete) return;

    // Esperar que todos os monstros tenham sido spawnados
    if (this.monstersInWave.length < this.expectedCount) return;

    // Verificar se todos os monstros da wave morreram
    var allDead = true;
    for (var i = 0; i < this.monstersInWave.length; i++) {
        if (this.monstersInWave[i].alive) {
            allDead = false;
            break;
        }
    }

    if (allDead) {
        this.waveInProgress = false;
        this.totalKilled += this.monstersInWave.length;
        this.scene.events.emit('waveComplete', this.currentWave + 1);

        // Proxima wave apos 3 segundos
        var self = this;
        this.scene.time.delayedCall(3000, function () {
            self.startNextWave();
        });
    }
};

EscolaHeroes.WaveManager.prototype.showWaveText = function (waveNum) {
    var W = EscolaHeroes.GAME_WIDTH;
    var H = EscolaHeroes.GAME_HEIGHT;
    var scene = this.scene;

    var text = scene.add.text(W / 2, H / 2, 'WAVE ' + waveNum + '!', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '48px',
        color: '#FFDD00',
        stroke: '#000000',
        strokeThickness: 5
    }).setOrigin(0.5).setDepth(50).setScale(0);

    scene.tweens.add({
        targets: text,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Back.easeOut',
        onComplete: function () {
            scene.tweens.add({
                targets: text,
                alpha: 0,
                y: text.y - 30,
                duration: 500,
                delay: 800,
                onComplete: function () {
                    text.destroy();
                }
            });
        }
    });
};

EscolaHeroes.WaveManager.prototype.stop = function () {
    this.active = false;
    this.waveInProgress = false;
};

window.EscolaHeroes = EscolaHeroes;
