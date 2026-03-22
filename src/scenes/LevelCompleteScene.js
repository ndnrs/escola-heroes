// ============================================
// LevelCompleteScene — Ecra de Nivel Completo
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

EscolaHeroes.LevelCompleteScene = class LevelCompleteScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelCompleteScene' });
    }

    create(data) {
        var W = EscolaHeroes.GAME_WIDTH;
        var H = EscolaHeroes.GAME_HEIGHT;
        var self = this;

        var nextLevelKey = (data && data.nextLevelKey) || null;
        var stats = (data && data.stats) || {};
        var levelName = (data && data.levelName) || 'NIVEL';

        // Fundo escuro festivo
        this.cameras.main.setBackgroundColor('#0a0a2e');

        // Estrelas decorativas animadas
        for (var s = 0; s < 30; s++) {
            var sx = Math.random() * W;
            var sy = Math.random() * H;
            var star = this.add.circle(sx, sy, 1 + Math.random() * 2, 0xFFFFFF, 0.5);
            this.tweens.add({
                targets: star,
                alpha: 0.1,
                duration: 500 + Math.random() * 1000,
                yoyo: true,
                repeat: -1,
                delay: Math.random() * 500
            });
        }

        // 3 estrelas grandes rotativas
        var starColors = [0xFFD700, 0xFFAA00, 0xFFD700];
        for (var i = 0; i < 3; i++) {
            var starX = W / 2 + (i - 1) * 80;
            var starY = 80;
            var bigStar = this.drawStar(starX, starY, 20, starColors[i]);
            bigStar.setScale(0);
            this.tweens.add({
                targets: bigStar,
                scaleX: 1,
                scaleY: 1,
                angle: 360,
                duration: 800,
                delay: 300 + i * 200,
                ease: 'Back.easeOut'
            });
            this.tweens.add({
                targets: bigStar,
                angle: '+=360',
                duration: 4000,
                repeat: -1,
                delay: 1100 + i * 200
            });
        }

        // Texto "NIVEL COMPLETO!"
        var title = this.add.text(W / 2, 140, 'NIVEL COMPLETO!', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '42px',
            color: '#FFDD00',
            stroke: '#000000',
            strokeThickness: 5,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
        }).setOrigin(0.5).setScale(0);

        this.tweens.add({
            targets: title,
            scaleX: 1,
            scaleY: 1,
            duration: 500,
            ease: 'Bounce.easeOut',
            delay: 200
        });

        // Nome do nivel
        this.add.text(W / 2, 185, levelName, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            color: '#AAAAAA',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Stats
        var statsY = 230;
        var totalMonsters = stats.totalMonsters || 15;

        this.add.text(W / 2, statsY, 'Monstros derrotados: ' + (stats.monstersKilled || 0) + '/' + totalMonsters, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '20px',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        this.add.text(W / 2, statsY + 32, 'HP restante: ' + (stats.hp || 0) + '/100', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '20px',
            color: stats.hp > 50 ? '#00CC00' : (stats.hp > 25 ? '#FFCC00' : '#FF4444')
        }).setOrigin(0.5);

        if (stats.time !== undefined) {
            var mins = Math.floor(stats.time / 60);
            var secs = Math.floor(stats.time % 60);
            var timeStr = mins + ':' + (secs < 10 ? '0' : '') + secs;
            this.add.text(W / 2, statsY + 64, 'Tempo: ' + timeStr, {
                fontFamily: 'Arial, sans-serif',
                fontSize: '20px',
                color: '#FFFFFF'
            }).setOrigin(0.5);
        }

        // Pontuacao
        if (stats.score !== undefined) {
            this.add.text(W / 2, statsY + 96, 'Pontos: ' + stats.score, {
                fontFamily: 'Arial Black, Arial',
                fontSize: '24px',
                color: '#FFD700'
            }).setOrigin(0.5);
        }

        // Restaurar HP para proximo nivel
        this.registry.set('playerHP', 100);

        // Botao "PROXIMO NIVEL"
        if (nextLevelKey) {
            var nextBtn = this.createButton(W / 2, H - 130, 'PROXIMO NIVEL', 0x00AA00, 220, 48);
            nextBtn.setAlpha(0);
            this.tweens.add({ targets: nextBtn, alpha: 1, duration: 300, delay: 1200 });
            nextBtn.on('pointerup', function () {
                self.scene.start(nextLevelKey);
            });
        } else {
            var soonText = this.add.text(W / 2, H - 130, 'MAIS NIVEIS EM BREVE...', {
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',
                color: '#888888',
                fontStyle: 'italic'
            }).setOrigin(0.5);
            this.tweens.add({
                targets: soonText,
                alpha: 0.5,
                duration: 800,
                yoyo: true,
                repeat: -1
            });
        }

        // Botao "MENU"
        var menuBtn = this.createButton(W / 2, H - 70, 'MENU', 0x4A90D9, 160, 40);
        menuBtn.setAlpha(0);
        this.tweens.add({ targets: menuBtn, alpha: 1, duration: 300, delay: 1400 });
        menuBtn.on('pointerup', function () {
            self.scene.start('MenuScene');
        });
    }

    drawStar(x, y, radius, color) {
        var g = this.add.graphics();
        g.fillStyle(color, 1);
        g.beginPath();
        for (var i = 0; i < 5; i++) {
            var angle = (i * 4 * Math.PI / 5) - Math.PI / 2;
            var px = x + Math.cos(angle) * radius;
            var py = y + Math.sin(angle) * radius;
            if (i === 0) g.moveTo(px, py);
            else g.lineTo(px, py);
        }
        g.closePath();
        g.fillPath();
        return g;
    }

    createButton(x, y, text, color, w, h) {
        var container = this.add.container(x, y);
        var bg = this.add.graphics();
        bg.fillStyle(color, 1);
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
        bg.lineStyle(2, 0xFFFFFF, 0.3);
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
        container.add(bg);
        container.add(this.add.text(0, 0, text, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '16px',
            color: '#FFFFFF'
        }).setOrigin(0.5));
        container.setSize(w, h);
        container.setInteractive({ useHandCursor: true });

        var self = this;
        container.on('pointerover', function () {
            self.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 100 });
        });
        container.on('pointerout', function () {
            self.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
        });

        return container;
    }
};

window.EscolaHeroes = EscolaHeroes;
