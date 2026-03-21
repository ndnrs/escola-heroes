// ============================================
// HUDScene — Overlay de Interface (HP, Especial, Mobile Controls)
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

EscolaHeroes.HUDScene = class HUDScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HUDScene' });
    }

    create() {
        var W = EscolaHeroes.GAME_WIDTH;
        var H = EscolaHeroes.GAME_HEIGHT;
        var charData = this.registry.get('selectedCharacter');

        // --- Topo esquerda: Avatar + Nome ---
        var avatarKey = 'char_' + charData.name.toLowerCase();
        if (this.textures.exists(avatarKey)) {
            this.add.image(30, 22, avatarKey).setScale(0.8).setDepth(100);
        }
        this.add.text(55, 14, charData.name, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '14px',
            color: charData.colorHex,
            stroke: '#000000',
            strokeThickness: 2
        }).setDepth(100);

        // --- Topo centro: Barra de HP ---
        this.healthBar = new EscolaHeroes.HealthBar(this, W / 2 - 100, 8, 200, 20);
        this.healthBar.setValue(100, 100);

        // --- Topo direita: Nome do nivel ---
        this.levelText = this.add.text(W - 15, 14, 'TESTE', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '14px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(1, 0).setDepth(100);

        // --- Baixo centro: Barra de especial ---
        this.specialBar = new EscolaHeroes.SpecialBar(
            this,
            W / 2 - 75, H - 28,
            150, 12,
            charData.color
        );
        this.specialBar.setCharge(0, EscolaHeroes.SPECIAL_KILLS_NEEDED);

        // --- Score ---
        this.score = 0;
        this.scoreText = this.add.text(W / 2, 35, 'Pontos: 0', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px',
            color: '#DDDDDD'
        }).setOrigin(0.5).setDepth(100);

        // --- Mobile controls ---
        this.joystick = null;
        this.mobileButtons = null;
        this.isMobile = !this.sys.game.device.os.desktop;

        if (this.isMobile) {
            this.joystick = new EscolaHeroes.VirtualJoystick(this, 80, H - 100);
            this.mobileButtons = new EscolaHeroes.MobileButtons(this, charData.color);
        }

        // --- Escutar eventos da game scene ---
        var gameScene = this.scene.get('TestScene');
        if (gameScene) {
            var self = this;

            gameScene.events.on('playerDamaged', function (hp, maxHp) {
                self.updateHP(hp, maxHp);
            });

            gameScene.events.on('specialChargeChanged', function (current, max) {
                self.updateSpecial(current, max);
            });

            gameScene.events.on('monsterKilled', function (x, y, scoreValue) {
                self.addScore(scoreValue);
            });

            gameScene.events.on('playerDied', function () {
                self.showGameOver();
            });
        }
    }

    updateHP(current, max) {
        this.healthBar.setValue(current, max);
    }

    updateSpecial(current, max) {
        this.specialBar.setCharge(current, max);
        if (this.mobileButtons) {
            this.mobileButtons.setSpecialReady(current >= max);
        }
    }

    setLevel(name) {
        this.levelText.setText(name);
    }

    addScore(value) {
        this.score += value;
        this.scoreText.setText('Pontos: ' + this.score);
    }

    showGameOver() {
        var W = EscolaHeroes.GAME_WIDTH;
        var H = EscolaHeroes.GAME_HEIGHT;
        var self = this;

        // Overlay escuro
        var overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, W, H);
        overlay.setDepth(300);

        // Texto "OH NAO!"
        var title = this.add.text(W / 2, H / 2 - 60, 'OH NAO!', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '48px',
            color: '#FF4444',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(301);

        // Animacao do titulo
        this.tweens.add({
            targets: title,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Stats
        this.add.text(W / 2, H / 2 - 5, 'Pontos: ' + this.score, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '20px',
            color: '#FFFFFF'
        }).setOrigin(0.5).setDepth(301);

        // Botao "TENTAR OUTRA VEZ"
        var retryBtn = this.add.container(W / 2, H / 2 + 50);
        var retryBg = this.add.graphics();
        retryBg.fillStyle(0x00AA00, 1);
        retryBg.fillRoundedRect(-100, -20, 200, 40, 8);
        retryBtn.add(retryBg);
        retryBtn.add(this.add.text(0, 0, 'TENTAR OUTRA VEZ', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '16px',
            color: '#FFFFFF'
        }).setOrigin(0.5));
        retryBtn.setSize(200, 40);
        retryBtn.setInteractive({ useHandCursor: true });
        retryBtn.setDepth(301);

        retryBtn.on('pointerup', function () {
            self.scene.stop('HUDScene');
            self.scene.stop('TestScene');
            self.scene.start('TestScene');
        });

        // Botao "MENU"
        var menuBtn = this.add.container(W / 2, H / 2 + 105);
        var menuBg = this.add.graphics();
        menuBg.fillStyle(0x4A90D9, 1);
        menuBg.fillRoundedRect(-80, -18, 160, 36, 8);
        menuBtn.add(menuBg);
        menuBtn.add(this.add.text(0, 0, 'MENU', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '16px',
            color: '#FFFFFF'
        }).setOrigin(0.5));
        menuBtn.setSize(160, 36);
        menuBtn.setInteractive({ useHandCursor: true });
        menuBtn.setDepth(301);

        menuBtn.on('pointerup', function () {
            self.scene.stop('HUDScene');
            self.scene.stop('TestScene');
            self.scene.start('MenuScene');
        });
    }

    getJoystickData() {
        if (this.joystick) {
            return this.joystick.getDirection();
        }
        return { x: 0, y: 0 };
    }

    isMobileFiring() {
        return this.mobileButtons ? this.mobileButtons.isFiring : false;
    }

    isMobileSpecialPressed() {
        if (this.mobileButtons && this.mobileButtons.specialPressed) {
            this.mobileButtons.specialPressed = false;
            return true;
        }
        return false;
    }
};

window.EscolaHeroes = EscolaHeroes;
