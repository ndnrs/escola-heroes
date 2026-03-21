// ============================================
// SpecialBar — Barra de Ataque Especial
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

EscolaHeroes.SpecialBar = function (scene, x, y, width, height, charColor) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width || 150;
    this.height = height || 12;
    this.charColor = charColor || 0xFFFFFF;
    this.segments = EscolaHeroes.SPECIAL_KILLS_NEEDED;
    this.currentCharge = 0;

    // Graficos
    this.bg = scene.add.graphics().setDepth(100);
    this.fill = scene.add.graphics().setDepth(101);
    this.border = scene.add.graphics().setDepth(102);

    // Label
    this.label = scene.add.text(x + this.width / 2, y - 10, 'ESPECIAL', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        color: '#AAAAAA'
    }).setOrigin(0.5).setDepth(103);

    // Texto "PRONTO!" quando cheio
    this.readyText = scene.add.text(x + this.width / 2, y + this.height / 2, 'PRONTO! [Q]', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '11px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 2
    }).setOrigin(0.5).setDepth(104).setAlpha(0);

    this.readyTween = null;

    this.draw();
};

EscolaHeroes.SpecialBar.prototype.draw = function () {
    var x = this.x;
    var y = this.y;
    var w = this.width;
    var h = this.height;

    // Fundo
    this.bg.clear();
    this.bg.fillStyle(0x333333, 0.8);
    this.bg.fillRoundedRect(x, y, w, h, 3);

    // Segmentos preenchidos
    this.fill.clear();
    var segW = (w - 4) / this.segments;
    for (var i = 0; i < this.currentCharge; i++) {
        this.fill.fillStyle(this.charColor, 1);
        this.fill.fillRect(x + 2 + i * segW, y + 2, segW - 1, h - 4);
    }

    // Linhas de separacao dos segmentos
    this.border.clear();
    this.border.lineStyle(1, 0xFFFFFF, 0.2);
    for (var j = 1; j < this.segments; j++) {
        var sx = x + 2 + j * segW;
        this.border.lineBetween(sx, y + 2, sx, y + h - 2);
    }

    // Borda exterior
    this.border.lineStyle(1, 0xFFFFFF, 0.4);
    this.border.strokeRoundedRect(x, y, w, h, 3);
};

EscolaHeroes.SpecialBar.prototype.setCharge = function (current, max) {
    this.currentCharge = current;
    this.segments = max;
    this.draw();

    // Mostrar/esconder texto "PRONTO!"
    if (current >= max) {
        this.readyText.setAlpha(1);
        if (!this.readyTween) {
            this.readyTween = this.scene.tweens.add({
                targets: this.readyText,
                alpha: 0.4,
                duration: 400,
                yoyo: true,
                repeat: -1
            });
        }
    } else {
        this.readyText.setAlpha(0);
        if (this.readyTween) {
            this.readyTween.stop();
            this.readyTween = null;
        }
    }
};

EscolaHeroes.SpecialBar.prototype.destroy = function () {
    this.bg.destroy();
    this.fill.destroy();
    this.border.destroy();
    this.label.destroy();
    this.readyText.destroy();
    if (this.readyTween) this.readyTween.stop();
};

window.EscolaHeroes = EscolaHeroes;
