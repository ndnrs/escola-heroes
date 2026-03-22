// ============================================
// GameOverScene — Ecra de Game Over
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

EscolaHeroes.GameOverScene = class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create(data) {
        var W = EscolaHeroes.GAME_WIDTH;
        var H = EscolaHeroes.GAME_HEIGHT;
        var self = this;

        var levelKey = (data && data.levelKey) || 'CantinScene';
        var stats = (data && data.stats) || {};

        EscolaHeroes.AudioManager.stopMusic();
        EscolaHeroes.AudioManager.play('gameOver');
        this.cameras.main.fadeIn(300);

        // Fundo escuro com tom vermelho
        this.cameras.main.setBackgroundColor('#1a0a0a');

        // Overlay com gradiente vermelho
        var overlay = this.add.graphics();
        overlay.fillStyle(0x330000, 0.5);
        overlay.fillRect(0, 0, W, H);

        // Texto "OH NAO!"
        var title = this.add.text(W / 2, H / 2 - 100, 'OH NAO!', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '56px',
            color: '#FF4444',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 5, fill: true }
        }).setOrigin(0.5);

        // Animacao shake do titulo
        title.setScale(0);
        this.tweens.add({
            targets: title,
            scaleX: 1,
            scaleY: 1,
            duration: 500,
            ease: 'Bounce.easeOut'
        });
        this.tweens.add({
            targets: title,
            x: title.x - 3,
            duration: 100,
            yoyo: true,
            repeat: -1
        });

        // Stats
        var statsY = H / 2 - 20;
        if (stats.monstersKilled !== undefined) {
            this.add.text(W / 2, statsY, 'Monstros derrotados: ' + stats.monstersKilled, {
                fontFamily: 'Arial, sans-serif',
                fontSize: '18px',
                color: '#CCCCCC'
            }).setOrigin(0.5);
            statsY += 28;
        }
        if (stats.time !== undefined) {
            var mins = Math.floor(stats.time / 60);
            var secs = Math.floor(stats.time % 60);
            var timeStr = mins + ':' + (secs < 10 ? '0' : '') + secs;
            this.add.text(W / 2, statsY, 'Tempo: ' + timeStr, {
                fontFamily: 'Arial, sans-serif',
                fontSize: '18px',
                color: '#CCCCCC'
            }).setOrigin(0.5);
        }

        // Botao "TENTAR OUTRA VEZ"
        var retryBtn = this.createButton(W / 2, H / 2 + 60, 'TENTAR OUTRA VEZ', 0x00AA00, 220, 44);
        retryBtn.on('pointerup', function () {
            self.scene.start(levelKey);
        });

        // Botao "MENU"
        var menuBtn = this.createButton(W / 2, H / 2 + 120, 'MENU', 0x4A90D9, 160, 40);
        menuBtn.on('pointerup', function () {
            self.scene.start('MenuScene');
        });

        // Animacao de entrada dos botoes
        retryBtn.setAlpha(0);
        menuBtn.setAlpha(0);
        this.tweens.add({ targets: retryBtn, alpha: 1, duration: 300, delay: 600 });
        this.tweens.add({ targets: menuBtn, alpha: 1, duration: 300, delay: 800 });
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
