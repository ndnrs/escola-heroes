// ============================================
// BootScene — Loading + Geracao de Texturas
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

EscolaHeroes.BootScene = class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    create() {
        var self = this;
        var W = EscolaHeroes.GAME_WIDTH;
        var H = EscolaHeroes.GAME_HEIGHT;

        // Fundo
        this.cameras.main.setBackgroundColor('#1a1a2e');

        // Texto de loading
        var loadingText = this.add.text(W / 2, H / 2 - 50, 'A carregar...', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Barra de progresso - fundo
        var barBg = this.add.graphics();
        barBg.fillStyle(0x333333, 1);
        barBg.fillRoundedRect(W / 2 - 150, H / 2, 300, 30, 8);

        // Barra de progresso - preenchimento
        var barFill = this.add.graphics();
        var progress = 0;

        // Simular loading progressivo
        var loadTimer = this.time.addEvent({
            delay: 50,
            callback: function () {
                progress += 0.05;
                if (progress > 1) progress = 1;

                barFill.clear();
                barFill.fillStyle(0x4A90D9, 1);
                barFill.fillRoundedRect(W / 2 - 148, H / 2 + 2, 296 * progress, 26, 6);

                if (progress >= 1) {
                    loadTimer.remove(false);
                    // Gerar todas as texturas
                    self.generateTextures();
                    // Transicao para menu
                    self.time.delayedCall(300, function () {
                        self.scene.start('MenuScene');
                    });
                }
            },
            repeat: 20
        });
    }

    generateTextures() {
        var chars = EscolaHeroes.CHARACTERS;
        for (var i = 0; i < chars.length; i++) {
            this.generateCharacterTexture(chars[i]);
            this.generateProjectileTexture(chars[i]);
        }
    }

    generateCharacterTexture(charData) {
        var g = this.make.graphics({ x: 0, y: 0, add: false });
        var size = 48;

        // Corpo (rectangulo)
        g.fillStyle(charData.color, 1);
        g.fillRoundedRect(size / 2 - 12, 20, 24, 22, 4);

        // Cabeca (circulo)
        g.fillStyle(0xFFDEB0, 1);
        g.fillCircle(size / 2, 14, 12);

        // Cabelo
        g.fillStyle(charData.color, 1);
        g.fillEllipse(size / 2, 6, 26, 12);

        // Olhos
        g.fillStyle(0xFFFFFF, 1);
        g.fillCircle(size / 2 - 4, 12, 3);
        g.fillCircle(size / 2 + 4, 12, 3);
        g.fillStyle(0x000000, 1);
        g.fillCircle(size / 2 - 4, 12, 1.5);
        g.fillCircle(size / 2 + 4, 12, 1.5);

        // Sorriso
        g.lineStyle(1.5, 0x333333, 1);
        g.beginPath();
        g.arc(size / 2, 17, 4, 0, Math.PI, false);
        g.strokePath();

        g.generateTexture('char_' + charData.name.toLowerCase(), size, size);
        g.destroy();
    }

    generateProjectileTexture(charData) {
        var g = this.make.graphics({ x: 0, y: 0, add: false });

        // Projectil — circulo brilhante
        g.fillStyle(charData.color, 0.5);
        g.fillCircle(8, 8, 8);
        g.fillStyle(charData.color, 1);
        g.fillCircle(8, 8, 5);
        g.fillStyle(0xFFFFFF, 0.8);
        g.fillCircle(7, 6, 2);

        g.generateTexture('proj_' + charData.name.toLowerCase(), 16, 16);
        g.destroy();
    }
};

window.EscolaHeroes = EscolaHeroes;
