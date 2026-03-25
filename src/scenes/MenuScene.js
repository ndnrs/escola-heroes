// ============================================
// MenuScene — Menu Principal
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

EscolaHeroes.MenuScene = class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        // DEBUG TRAP: Quem iniciou o MenuScene?
        var stack = new Error().stack;
        var activeScenes = this.scene.manager.getScenes(true).map(function(s) { return s.scene.key; });
        console.error('=== MENUSCENE CRIADO ===');
        console.error('Scenes activas:', activeScenes.join(', '));
        console.error('Stack:', stack);

        var W = EscolaHeroes.GAME_WIDTH;
        var H = EscolaHeroes.GAME_HEIGHT;

        this.input.enabled = true;
        this.events.once('shutdown', function () { this.input.enabled = false; }, this);

        this.cameras.main.fadeIn(500);
        EscolaHeroes.AudioManager.startMusic('menu');

        // Versao e creditos (depth alto para ficar acima do background)
        this.add.text(W - 10, H - 10, 'v1.0', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '10px',
            color: '#336633'
        }).setOrigin(1, 1).setDepth(20);

        // Toggle invencibilidade (para teste)
        var godMode = this.registry.get('godMode') || false;
        var godText = this.add.text(10, H - 10, godMode ? 'INVENCIVEL: ON' : 'INVENCIVEL: OFF', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '10px',
            color: godMode ? '#00FF00' : '#666666'
        }).setOrigin(0, 1).setDepth(20).setInteractive({ useHandCursor: true });

        var selfMenu = this;
        godText.on('pointerup', function () {
            if (!selfMenu.sys.isActive()) return;
            var current = selfMenu.registry.get('godMode') || false;
            selfMenu.registry.set('godMode', !current);
            godText.setText(!current ? 'INVENCIVEL: ON' : 'INVENCIVEL: OFF');
            godText.setColor(!current ? '#00FF00' : '#666666');
        });

        // --- Background: gradiente ceu → relva ---
        this.drawBackground(W, H);

        // --- Escola simplificada ---
        this.drawSchool(W, H);

        // --- Monstros a espreitar ---
        this.drawMonsters(W, H);

        // --- Titulo ---
        this.createTitle(W);

        // --- Botoes ---
        this.createButtons(W, H);
    }

    drawBackground(W, H) {
        var bg = this.add.graphics();

        // Ceu (gradiente simulado com faixas)
        var skyColors = [0x87CEEB, 0x98D8F0, 0xA8E0F5, 0xB8E8FA, 0xC8F0FF];
        for (var i = 0; i < skyColors.length; i++) {
            bg.fillStyle(skyColors[i], 1);
            bg.fillRect(0, i * (H * 0.7 / skyColors.length), W, H * 0.7 / skyColors.length + 1);
        }

        // Relva
        bg.fillStyle(0x4CAF50, 1);
        bg.fillRect(0, H * 0.7, W, H * 0.3);

        // Relva mais escura (faixa)
        bg.fillStyle(0x388E3C, 1);
        bg.fillRect(0, H * 0.7, W, 8);

        // Nuvens simples
        this.drawCloud(bg, 100, 60, 1);
        this.drawCloud(bg, 500, 40, 0.8);
        this.drawCloud(bg, 700, 80, 0.6);
    }

    drawCloud(g, x, y, alpha) {
        g.fillStyle(0xFFFFFF, alpha);
        g.fillCircle(x, y, 20);
        g.fillCircle(x + 20, y - 5, 25);
        g.fillCircle(x + 45, y, 20);
        g.fillCircle(x + 22, y + 5, 18);
    }

    drawSchool(W, H) {
        var school = this.add.graphics();
        var sx = W / 2 - 140;
        var sy = H * 0.35;

        // Edificio principal
        school.fillStyle(0xFFE4B5, 1);
        school.fillRect(sx, sy, 280, 180);

        // Telhado
        school.fillStyle(0xCD5C5C, 1);
        school.beginPath();
        school.moveTo(sx - 15, sy);
        school.lineTo(sx + 140, sy - 50);
        school.lineTo(sx + 295, sy);
        school.closePath();
        school.fillPath();

        // Porta
        school.fillStyle(0x8B4513, 1);
        school.fillRoundedRect(sx + 115, sy + 100, 50, 80, { tl: 8, tr: 8, bl: 0, br: 0 });

        // Macaneta
        school.fillStyle(0xFFD700, 1);
        school.fillCircle(sx + 155, sy + 145, 4);

        // Janelas
        school.fillStyle(0x87CEEB, 1);
        var janelas = [
            [sx + 30, sy + 30], [sx + 30, sy + 100],
            [sx + 195, sy + 30], [sx + 195, sy + 100]
        ];
        for (var j = 0; j < janelas.length; j++) {
            school.fillRect(janelas[j][0], janelas[j][1], 55, 40);
            // Moldura
            school.lineStyle(3, 0x8B4513, 1);
            school.strokeRect(janelas[j][0], janelas[j][1], 55, 40);
            // Cruz da janela
            school.lineStyle(2, 0x8B4513, 1);
            school.lineBetween(janelas[j][0] + 27, janelas[j][1], janelas[j][0] + 27, janelas[j][1] + 40);
            school.lineBetween(janelas[j][0], janelas[j][1] + 20, janelas[j][0] + 55, janelas[j][1] + 20);
        }

        // Letrero "ESCOLA"
        this.add.text(W / 2, sy + 15, 'ESCOLA', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '14px',
            color: '#8B4513',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    drawMonsters(W, H) {
        var self = this;

        // Monstro 1 — Gosma verde (espreita pela esquerda)
        var m1 = this.add.graphics();
        m1.fillStyle(0x32CD32, 1);
        m1.fillEllipse(0, 0, 40, 30);
        m1.fillStyle(0xFFFFFF, 1);
        m1.fillCircle(-6, -5, 6);
        m1.fillCircle(6, -5, 6);
        m1.fillStyle(0x000000, 1);
        m1.fillCircle(-5, -4, 3);
        m1.fillCircle(7, -4, 3);
        // Boca
        m1.lineStyle(2, 0x006400, 1);
        m1.beginPath();
        m1.arc(0, 3, 6, 0, Math.PI, false);
        m1.strokePath();
        m1.setPosition(80, H * 0.65);

        // Monstro 2 — Morcego (espreita pela direita)
        var m2 = this.add.graphics();
        m2.fillStyle(0x4B0082, 1);
        m2.fillCircle(0, 0, 12);
        // Asas
        m2.fillTriangle(-25, -5, -8, -15, -8, 5);
        m2.fillTriangle(25, -5, 8, -15, 8, 5);
        // Olhos vermelhos
        m2.fillStyle(0xFF0000, 1);
        m2.fillCircle(-4, -2, 3);
        m2.fillCircle(4, -2, 3);
        m2.setPosition(W - 80, H * 0.38);

        // Monstro 3 — Outra gosma (espreita por baixo)
        var m3 = this.add.graphics();
        m3.fillStyle(0xFF6347, 1);
        m3.fillEllipse(0, 0, 35, 25);
        m3.fillStyle(0xFFFFFF, 1);
        m3.fillCircle(-5, -4, 5);
        m3.fillCircle(5, -4, 5);
        m3.fillStyle(0x000000, 1);
        m3.fillCircle(-4, -3, 2.5);
        m3.fillCircle(6, -3, 2.5);
        m3.setPosition(W - 120, H * 0.68);

        // Animacao bobbing
        var monsters = [m1, m2, m3];
        for (var i = 0; i < monsters.length; i++) {
            this.tweens.add({
                targets: monsters[i],
                y: monsters[i].y + 8,
                duration: 800 + i * 200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createTitle(W) {
        var title = this.add.text(W / 2, -80, 'ESCOLA HEROES', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '64px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#333333',
                blur: 5,
                fill: true
            }
        }).setOrigin(0.5);

        // Animacao: titulo cai de cima com bounce
        this.tweens.add({
            targets: title,
            y: 80,
            duration: 1000,
            ease: 'Bounce.easeOut'
        });
    }

    createButtons(W, H) {
        var self = this;

        // Botao JOGAR
        var btnJogar = this.createButton(W / 2, H - 120, 'JOGAR', 0x2ECC71, function () {
            self.scene.start('SelectScene');
        });

        // Botao COMO JOGAR
        var btnHelp = this.createButton(W / 2, H - 60, 'COMO JOGAR', 0x3498DB, function () {
            self.scene.start('HowToPlayScene');
        });

        // Animacao fade-in dos botoes
        btnJogar.setAlpha(0);
        btnHelp.setAlpha(0);

        this.tweens.add({
            targets: btnJogar,
            alpha: 1,
            duration: 600,
            delay: 800
        });
        this.tweens.add({
            targets: btnHelp,
            alpha: 1,
            duration: 600,
            delay: 1000
        });
    }

    createButton(x, y, label, color, callback) {
        var container = this.add.container(x, y);

        // Fundo do botao
        var bg = this.add.graphics();
        var bw = 220;
        var bh = 50;
        bg.fillStyle(color, 1);
        bg.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 12);
        // Borda
        bg.lineStyle(3, 0xFFFFFF, 0.5);
        bg.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 12);

        // Texto
        var text = this.add.text(0, 0, label, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '24px',
            color: '#FFFFFF',
            shadow: {
                offsetX: 1,
                offsetY: 1,
                color: '#000000',
                blur: 2,
                fill: true
            }
        }).setOrigin(0.5);

        container.add([bg, text]);
        container.setSize(bw, bh);
        container.setInteractive({ useHandCursor: true });

        // Hover feedback (usar closure 'self' em vez de 'this.scene')
        var self = this;
        container.on('pointerover', function () {
            if (!self.sys.isActive()) return;
            self.tweens.add({
                targets: container,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 150,
                ease: 'Back.easeOut'
            });
        });

        container.on('pointerout', function () {
            if (!self.sys.isActive()) return;
            self.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 150,
                ease: 'Back.easeOut'
            });
        });

        // Click
        container.on('pointerdown', function () {
            if (!self.sys.isActive()) return;
            container.setScale(0.95);
        });

        container.on('pointerup', function () {
            if (!self.sys.isActive()) return;
            container.setScale(1);
            callback();
        });

        return container;
    }
};

window.EscolaHeroes = EscolaHeroes;
