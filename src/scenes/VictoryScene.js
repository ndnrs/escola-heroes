// ============================================
// VictoryScene — Ecra de Vitoria Final
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

EscolaHeroes.VictoryScene = class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    create(data) {
        var W = EscolaHeroes.GAME_WIDTH;
        var H = EscolaHeroes.GAME_HEIGHT;
        var self = this;

        var stats = (data && data.stats) || {};
        var charData = (data && data.charData) || this.registry.get('selectedCharacter');

        EscolaHeroes.AudioManager.stopMusic();
        EscolaHeroes.AudioManager.play('bossDie');
        EscolaHeroes.AudioManager.startMusic('victory');
        this.cameras.main.fadeIn(500);

        // Fundo: ceu azul brilhante
        this.cameras.main.setBackgroundColor('#4AAEF0');

        // Sol
        var sun = this.add.circle(W - 80, 60, 35, 0xFFDD00, 1);
        this.tweens.add({
            targets: sun,
            scaleX: 1.1, scaleY: 1.1,
            duration: 1000, yoyo: true, repeat: -1
        });

        // Nuvens
        for (var c = 0; c < 3; c++) {
            var cloud = this.add.ellipse(100 + c * 250, 50 + c * 20, 80, 30, 0xFFFFFF, 0.8);
            this.tweens.add({
                targets: cloud,
                x: cloud.x + 20, duration: 3000, yoyo: true, repeat: -1, delay: c * 500
            });
        }

        // Chao (relva verde)
        var ground = this.add.graphics();
        ground.fillStyle(0x2ECC71, 1);
        ground.fillRect(0, H - 120, W, 120);
        ground.fillStyle(0x27AE60, 1);
        ground.fillRect(0, H - 120, W, 5);

        // Escola ao fundo (simplificada)
        var school = this.add.graphics();
        school.fillStyle(0xFAD6A5, 1);
        school.fillRect(W / 2 - 100, H - 220, 200, 100);
        school.fillStyle(0xCC4444, 1);
        school.fillTriangle(W / 2 - 110, H - 220, W / 2, H - 260, W / 2 + 110, H - 220);
        school.fillStyle(0x8B4513, 1);
        school.fillRect(W / 2 - 15, H - 170, 30, 50);

        // --- 4 personagens juntas ---
        var chars = EscolaHeroes.CHARACTERS;
        var charStartX = W / 2 - 90;
        for (var i = 0; i < chars.length; i++) {
            var cx = charStartX + i * 60;
            var cy = H - 160;
            var charKey = 'char_' + chars[i].name.toLowerCase();

            if (this.textures.exists(charKey)) {
                var charSprite = this.add.image(cx, cy, charKey).setScale(2);
                // Saltar alternadamente
                this.tweens.add({
                    targets: charSprite,
                    y: cy - 15,
                    duration: 400,
                    yoyo: true,
                    repeat: -1,
                    delay: i * 200,
                    ease: 'Sine.easeOut'
                });

                // Destaque na personagem seleccionada
                if (charData && chars[i].name === charData.name) {
                    var highlight = this.add.circle(cx, cy - 35, 8, chars[i].color, 0.8);
                    this.tweens.add({
                        targets: highlight,
                        scaleX: 1.3, scaleY: 1.3, alpha: 0.4,
                        duration: 500, yoyo: true, repeat: -1
                    });
                }
            }
        }

        // --- CONFETTI ---
        this.confettiTimer = this.time.addEvent({
            delay: 50,
            callback: function () {
                var confettiColors = [0xFF69B4, 0x4A90D9, 0x9B59B6, 0x2ECC71, 0xFFD700, 0xFF4444, 0xFFFF00];
                var color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
                var size = 3 + Math.random() * 5;
                var x = Math.random() * W;

                var piece = self.add.rectangle(x, -10, size, size * 1.5, color, 1).setDepth(30);
                piece.setRotation(Math.random() * Math.PI);

                self.tweens.add({
                    targets: piece,
                    y: H + 20,
                    x: x + (Math.random() - 0.5) * 100,
                    angle: Math.random() * 720,
                    duration: 2000 + Math.random() * 2000,
                    onComplete: function () { piece.destroy(); }
                });
            },
            loop: true
        });

        // --- TITULO ---
        var title = this.add.text(W / 2, 70, 'ESCOLA SALVA!', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '52px',
            color: '#FFD700',
            stroke: '#8B4513',
            strokeThickness: 6,
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 5, fill: true }
        }).setOrigin(0.5).setScale(0).setDepth(40);

        this.tweens.add({
            targets: title,
            scaleX: 1, scaleY: 1,
            duration: 800,
            ease: 'Bounce.easeOut',
            delay: 500
        });

        // Titulo pulsa
        this.tweens.add({
            targets: title,
            scaleX: 1.05, scaleY: 1.05,
            duration: 800,
            yoyo: true, repeat: -1,
            delay: 1500
        });

        // --- STATS ---
        var statsY = 140;

        if (charData) {
            this.add.text(W / 2, statsY, 'Heroina: ' + charData.name, {
                fontFamily: 'Arial, sans-serif',
                fontSize: '18px',
                color: charData.colorHex || '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5).setDepth(40);
            statsY += 28;
        }

        if (stats.monstersKilled !== undefined) {
            this.add.text(W / 2, statsY, 'Monstros derrotados: ' + stats.monstersKilled, {
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5).setDepth(40);
            statsY += 24;
        }

        if (stats.time !== undefined) {
            var mins = Math.floor(stats.time / 60);
            var secs = Math.floor(stats.time % 60);
            this.add.text(W / 2, statsY, 'Tempo total: ' + mins + ':' + (secs < 10 ? '0' : '') + secs, {
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5).setDepth(40);
        }

        // --- BOTAO "JOGAR OUTRA VEZ" ---
        var btn = this.add.container(W / 2, H - 35).setDepth(40);
        var btnBg = this.add.graphics();
        btnBg.fillStyle(0x00AA00, 1);
        btnBg.fillRoundedRect(-110, -22, 220, 44, 10);
        btnBg.lineStyle(2, 0xFFFFFF, 0.4);
        btnBg.strokeRoundedRect(-110, -22, 220, 44, 10);
        btn.add(btnBg);
        btn.add(this.add.text(0, 0, 'JOGAR OUTRA VEZ', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '18px',
            color: '#FFFFFF'
        }).setOrigin(0.5));
        btn.setSize(220, 44);
        btn.setInteractive({ useHandCursor: true });
        btn.setAlpha(0);

        this.tweens.add({ targets: btn, alpha: 1, duration: 300, delay: 2000 });

        btn.on('pointerover', function () {
            self.tweens.add({ targets: btn, scaleX: 1.05, scaleY: 1.05, duration: 100 });
        });
        btn.on('pointerout', function () {
            self.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 100 });
        });
        btn.on('pointerup', function () {
            // Reset stats
            self.registry.set('totalStats', { monstersKilled: 0, time: 0 });
            self.scene.start('SelectScene');
        });
    }
};

window.EscolaHeroes = EscolaHeroes;
