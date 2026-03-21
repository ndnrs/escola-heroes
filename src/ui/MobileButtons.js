// ============================================
// MobileButtons — Botoes de Tiro e Especial para Mobile
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

EscolaHeroes.MobileButtons = function (scene, charColor) {
    this.scene = scene;
    this.isFiring = false;
    this.specialPressed = false;
    this.charColor = charColor || 0xFF0000;

    var W = EscolaHeroes.GAME_WIDTH;
    var H = EscolaHeroes.GAME_HEIGHT;

    // Botao de tiro (circulo vermelho, canto inferior direito)
    var fireX = W - 70;
    var fireY = H - 80;
    this.fireButton = scene.add.circle(fireX, fireY, 35, 0xFF4444, 0.5);
    this.fireButton.setDepth(200);
    this.fireButton.setScrollFactor(0);
    this.fireButton.setInteractive();

    var fireLabel = scene.add.text(fireX, fireY, 'TIRO', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '12px',
        color: '#FFFFFF'
    }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

    var self = this;

    this.fireButton.on('pointerdown', function () {
        self.isFiring = true;
        self.fireButton.setAlpha(0.8);
    });

    this.fireButton.on('pointerup', function () {
        self.isFiring = false;
        self.fireButton.setAlpha(0.5);
    });

    this.fireButton.on('pointerout', function () {
        self.isFiring = false;
        self.fireButton.setAlpha(0.5);
    });

    // Botao de especial (circulo menor, acima do botao de tiro)
    var specialX = fireX;
    var specialY = fireY - 85;
    this.specialButton = scene.add.circle(specialX, specialY, 25, charColor, 0.4);
    this.specialButton.setDepth(200);
    this.specialButton.setScrollFactor(0);
    this.specialButton.setInteractive();

    this.specialLabel = scene.add.text(specialX, specialY, 'ESP', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '10px',
        color: '#FFFFFF'
    }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

    this.specialButton.on('pointerdown', function () {
        self.specialPressed = true;
        self.specialButton.setAlpha(0.8);
    });

    this.specialButton.on('pointerup', function () {
        self.specialPressed = false;
        self.specialButton.setAlpha(0.4);
    });

    this.specialButton.on('pointerout', function () {
        self.specialPressed = false;
        self.specialButton.setAlpha(0.4);
    });

    this._fireLabel = fireLabel;
};

// Activar/desactivar visual do botao especial
EscolaHeroes.MobileButtons.prototype.setSpecialReady = function (ready) {
    if (ready) {
        this.specialButton.setAlpha(0.7);
        this.specialButton.setFillStyle(this.charColor, 0.7);
    } else {
        this.specialButton.setAlpha(0.3);
        this.specialButton.setFillStyle(this.charColor, 0.3);
    }
};

EscolaHeroes.MobileButtons.prototype.destroy = function () {
    this.fireButton.destroy();
    this.specialButton.destroy();
    this.specialLabel.destroy();
    this._fireLabel.destroy();
};

window.EscolaHeroes = EscolaHeroes;
