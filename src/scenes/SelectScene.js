// ============================================
// SelectScene — Seleccao de Personagem
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

EscolaHeroes.SelectScene = class SelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SelectScene' });
    }

    create() {
        var W = EscolaHeroes.GAME_WIDTH;
        var H = EscolaHeroes.GAME_HEIGHT;
        var chars = EscolaHeroes.CHARACTERS;

        // Background
        this.cameras.main.setBackgroundColor('#1a1a2e');

        // Estrelas decorativas no fundo
        this.drawStars(W, H);

        // Titulo
        this.add.text(W / 2, 45, 'ESCOLHE A TUA HEROINA', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '36px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#333333',
                blur: 4,
                fill: true
            }
        }).setOrigin(0.5);

        // Grid 2x2 de cards
        var cardW = 170;
        var cardH = 230;
        var spacingX = 30;
        var spacingY = 20;
        var totalW = cardW * 2 + spacingX;
        var startX = (W - totalW) / 2 + cardW / 2;
        var startY = 105 + cardH / 2;

        for (var i = 0; i < chars.length; i++) {
            var col = i % 2;
            var row = Math.floor(i / 2);
            var cx = startX + col * (cardW + spacingX);
            var cy = startY + row * (cardH + spacingY);
            this.createCard(cx, cy, cardW, cardH, chars[i], i);
        }

        // Botao voltar (discreto, canto inferior esquerdo)
        this.createBackLink(80, H - 30);
    }

    drawStars(W, H) {
        var g = this.add.graphics();
        g.fillStyle(0xFFFFFF, 0.3);
        for (var i = 0; i < 40; i++) {
            var sx = Math.random() * W;
            var sy = Math.random() * H;
            var sr = 0.5 + Math.random() * 1.5;
            g.fillCircle(sx, sy, sr);
        }
    }

    createCard(x, y, w, h, charData, index) {
        var self = this;
        var container = this.add.container(x, y);

        // Fundo do card
        var bg = this.add.graphics();
        // Sombra
        bg.fillStyle(0x000000, 0.3);
        bg.fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w, h, 14);
        // Card
        bg.fillStyle(charData.color, 0.2);
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
        // Borda
        bg.lineStyle(3, charData.color, 0.7);
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);

        container.add(bg);

        // Personagem desenhada
        var charGraphics = this.drawCharacter(charData, 0, -40);
        container.add(charGraphics);

        // Nome
        var nameText = this.add.text(0, 40, charData.name, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '22px',
            color: charData.colorHex,
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        container.add(nameText);

        // Especial
        var specialText = this.add.text(0, 65, charData.specialName, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '13px',
            color: '#CCCCCC',
            fontStyle: 'italic'
        }).setOrigin(0.5);
        container.add(specialText);

        // Descricao
        var descText = this.add.text(0, 85, charData.specialDescription, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '11px',
            color: '#999999',
            wordWrap: { width: w - 20 },
            align: 'center'
        }).setOrigin(0.5);
        container.add(descText);

        // Interactividade
        container.setSize(w, h);
        container.setInteractive({ useHandCursor: true });

        // Guardar referencia para a borda brilhar
        var glowBorder = this.add.graphics();
        glowBorder.setAlpha(0);
        container.add(glowBorder);

        // Hover
        container.on('pointerover', function () {
            self.tweens.add({
                targets: container,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 200,
                ease: 'Back.easeOut'
            });
            // Borda brilha
            glowBorder.clear();
            glowBorder.lineStyle(4, charData.color, 1);
            glowBorder.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
            self.tweens.add({
                targets: glowBorder,
                alpha: 1,
                duration: 200
            });
        });

        container.on('pointerout', function () {
            self.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Back.easeOut'
            });
            self.tweens.add({
                targets: glowBorder,
                alpha: 0,
                duration: 200
            });
        });

        // Seleccao
        container.on('pointerup', function () {
            self.selectCharacter(charData, container);
        });

        // Animacao de entrada
        container.setAlpha(0);
        container.setScale(0.8);
        this.tweens.add({
            targets: container,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 400,
            delay: 200 + index * 100,
            ease: 'Back.easeOut'
        });
    }

    drawCharacter(charData, x, y) {
        var g = this.add.graphics();

        // Corpo
        g.fillStyle(charData.color, 1);
        g.fillRoundedRect(x - 16, y + 8, 32, 30, 5);

        // Cabeca
        g.fillStyle(0xFFDEB0, 1);
        g.fillCircle(x, y - 4, 18);

        // Cabelo
        g.fillStyle(charData.color, 1);
        g.fillEllipse(x, y - 16, 38, 16);

        // Olhos
        g.fillStyle(0xFFFFFF, 1);
        g.fillCircle(x - 6, y - 6, 5);
        g.fillCircle(x + 6, y - 6, 5);
        g.fillStyle(0x000000, 1);
        g.fillCircle(x - 5, y - 5, 2.5);
        g.fillCircle(x + 7, y - 5, 2.5);

        // Brilho nos olhos
        g.fillStyle(0xFFFFFF, 0.8);
        g.fillCircle(x - 4, y - 7, 1);
        g.fillCircle(x + 8, y - 7, 1);

        // Sorriso
        g.lineStyle(2, 0x333333, 1);
        g.beginPath();
        g.arc(x, y + 3, 6, 0.1, Math.PI - 0.1, false);
        g.strokePath();

        // Bochechas rosadas
        g.fillStyle(0xFF9999, 0.4);
        g.fillCircle(x - 12, y + 1, 4);
        g.fillCircle(x + 12, y + 1, 4);

        // Pernas
        g.fillStyle(charData.color, 0.8);
        g.fillRect(x - 12, y + 38, 10, 12);
        g.fillRect(x + 2, y + 38, 10, 12);

        return g;
    }

    selectCharacter(charData, container) {
        var self = this;

        // Flash branco de seleccao
        var flash = this.add.graphics();
        flash.fillStyle(0xFFFFFF, 0.8);
        flash.fillRect(0, 0, EscolaHeroes.GAME_WIDTH, EscolaHeroes.GAME_HEIGHT);

        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 300
        });

        // Escalar o card seleccionado
        this.tweens.add({
            targets: container,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 300,
            ease: 'Back.easeOut'
        });

        // Guardar no registry
        this.registry.set('selectedCharacter', charData);

        // Transicao apos feedback visual
        this.time.delayedCall(500, function () {
            self.scene.start('TestScene');
        });
    }

    createBackLink(x, y) {
        var self = this;
        var text = this.add.text(x, y, '← VOLTAR', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            color: '#888888'
        }).setOrigin(0.5);

        text.setInteractive({ useHandCursor: true });

        text.on('pointerover', function () {
            text.setColor('#FFFFFF');
        });

        text.on('pointerout', function () {
            text.setColor('#888888');
        });

        text.on('pointerup', function () {
            self.scene.start('MenuScene');
        });
    }
};

window.EscolaHeroes = EscolaHeroes;
