// ============================================
// HowToPlayScene — Instrucoes de Jogo
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

EscolaHeroes.HowToPlayScene = class HowToPlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HowToPlayScene' });
    }

    create() {
        var W = EscolaHeroes.GAME_WIDTH;
        var H = EscolaHeroes.GAME_HEIGHT;

        // Fundo semi-transparente
        var overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, W, H);

        // Caixa central
        var boxW = 500;
        var boxH = 420;
        var boxX = (W - boxW) / 2;
        var boxY = (H - boxH) / 2;

        var box = this.add.graphics();
        box.fillStyle(0x2C3E50, 0.95);
        box.fillRoundedRect(boxX, boxY, boxW, boxH, 16);
        box.lineStyle(3, 0x3498DB, 1);
        box.strokeRoundedRect(boxX, boxY, boxW, boxH, 16);

        // Titulo
        this.add.text(W / 2, boxY + 35, 'COMO JOGAR', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '32px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Instrucoes
        var instructions = [
            { icon: 'arrows', text: 'WASD ou Setas: Mover' },
            { icon: 'space',  text: 'Espaco: Disparar' },
            { icon: 'q',      text: 'Q: Ataque Especial' },
            { icon: 'mobile', text: 'Mobile: Joystick + Botoes' },
            { icon: 'star',   text: 'Derrota os monstros e salva a escola!' }
        ];

        var startY = boxY + 85;
        for (var i = 0; i < instructions.length; i++) {
            var iy = startY + i * 55;
            this.drawIcon(boxX + 40, iy, instructions[i].icon);
            this.add.text(boxX + 80, iy, instructions[i].text, {
                fontFamily: 'Arial, sans-serif',
                fontSize: '20px',
                color: '#ECF0F1'
            }).setOrigin(0, 0.5);
        }

        // Botao VOLTAR
        this.createBackButton(W / 2, boxY + boxH - 45);
    }

    drawIcon(x, y, type) {
        var g = this.add.graphics();

        switch (type) {
            case 'arrows':
                // Setas cruzadas
                g.fillStyle(0x3498DB, 1);
                g.fillTriangle(x, y - 10, x - 6, y - 2, x + 6, y - 2); // cima
                g.fillTriangle(x, y + 10, x - 6, y + 2, x + 6, y + 2); // baixo
                g.fillTriangle(x - 10, y, x - 2, y - 6, x - 2, y + 6); // esquerda
                g.fillTriangle(x + 10, y, x + 2, y - 6, x + 2, y + 6); // direita
                break;

            case 'space':
                // Tecla espaco
                g.fillStyle(0x3498DB, 1);
                g.fillRoundedRect(x - 14, y - 8, 28, 16, 3);
                g.fillStyle(0x2C3E50, 1);
                g.fillRoundedRect(x - 12, y - 6, 24, 12, 2);
                break;

            case 'q':
                // Tecla Q
                g.fillStyle(0xE74C3C, 1);
                g.fillRoundedRect(x - 10, y - 10, 20, 20, 4);
                this.add.text(x, y, 'Q', {
                    fontFamily: 'Arial Black, Arial',
                    fontSize: '14px',
                    color: '#FFFFFF'
                }).setOrigin(0.5);
                break;

            case 'mobile':
                // Telemovel
                g.lineStyle(2, 0x3498DB, 1);
                g.strokeRoundedRect(x - 8, y - 12, 16, 24, 3);
                g.fillStyle(0x3498DB, 1);
                g.fillCircle(x, y + 8, 2);
                break;

            case 'star':
                // Estrela
                g.fillStyle(0xF1C40F, 1);
                this.drawStar(g, x, y, 5, 10, 5);
                break;
        }
    }

    drawStar(g, cx, cy, points, outerR, innerR) {
        var path = [];
        for (var i = 0; i < points * 2; i++) {
            var r = i % 2 === 0 ? outerR : innerR;
            var angle = (Math.PI / points) * i - Math.PI / 2;
            path.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
        }
        g.beginPath();
        g.moveTo(path[0].x, path[0].y);
        for (var j = 1; j < path.length; j++) {
            g.lineTo(path[j].x, path[j].y);
        }
        g.closePath();
        g.fillPath();
    }

    createBackButton(x, y) {
        var self = this;
        var container = this.add.container(x, y);
        var bw = 180;
        var bh = 44;

        var bg = this.add.graphics();
        bg.fillStyle(0xE74C3C, 1);
        bg.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 10);
        bg.lineStyle(2, 0xFFFFFF, 0.4);
        bg.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 10);

        var text = this.add.text(0, 0, 'VOLTAR', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '22px',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        container.add([bg, text]);
        container.setSize(bw, bh);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerover', function () {
            self.tweens.add({
                targets: container,
                scaleX: 1.08,
                scaleY: 1.08,
                duration: 150,
                ease: 'Back.easeOut'
            });
        });

        container.on('pointerout', function () {
            self.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 150,
                ease: 'Back.easeOut'
            });
        });

        container.on('pointerup', function () {
            self.scene.start('MenuScene');
        });
    }
};

window.EscolaHeroes = EscolaHeroes;
