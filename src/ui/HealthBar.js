// ============================================
// HealthBar — Barra de Vida
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

EscolaHeroes.HealthBar = function (scene, x, y, width, height) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width || 200;
    this.height = height || 20;
    this.value = 1; // 0 a 1

    // Fundo da barra
    this.bg = scene.add.graphics();
    this.bg.setDepth(100);

    // Preenchimento
    this.fill = scene.add.graphics();
    this.fill.setDepth(101);

    // Borda
    this.border = scene.add.graphics();
    this.border.setDepth(102);

    // Texto HP
    this.text = scene.add.text(x + this.width / 2, y + this.height / 2, '100/100', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '12px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 2
    }).setOrigin(0.5).setDepth(103);

    this.draw();
};

EscolaHeroes.HealthBar.prototype.draw = function () {
    var x = this.x;
    var y = this.y;
    var w = this.width;
    var h = this.height;

    // Fundo
    this.bg.clear();
    this.bg.fillStyle(0x333333, 0.8);
    this.bg.fillRoundedRect(x, y, w, h, 4);

    // Cor baseada no valor
    var color;
    if (this.value > 0.6) {
        color = 0x00CC00; // Verde
    } else if (this.value > 0.3) {
        color = 0xFFCC00; // Amarelo
    } else {
        color = 0xFF3300; // Vermelho
    }

    // Preenchimento
    this.fill.clear();
    if (this.value > 0) {
        this.fill.fillStyle(color, 1);
        this.fill.fillRoundedRect(x + 2, y + 2, (w - 4) * this.value, h - 4, 3);
    }

    // Borda
    this.border.clear();
    this.border.lineStyle(2, 0xFFFFFF, 0.5);
    this.border.strokeRoundedRect(x, y, w, h, 4);
};

EscolaHeroes.HealthBar.prototype.setValue = function (current, max) {
    this.value = Math.max(0, Math.min(1, current / max));
    this.text.setText(current + '/' + max);
    this.draw();
};

EscolaHeroes.HealthBar.prototype.destroy = function () {
    this.bg.destroy();
    this.fill.destroy();
    this.border.destroy();
    this.text.destroy();
};

window.EscolaHeroes = EscolaHeroes;
