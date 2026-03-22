// ============================================
// HUDScene — Overlay de Interface (HP, Especial, Mobile Controls)
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

EscolaHeroes.HUDScene = class HUDScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HUDScene' });
    }

    create(data) {
        var W = EscolaHeroes.GAME_WIDTH;
        var H = EscolaHeroes.GAME_HEIGHT;
        var charData = this.registry.get('selectedCharacter');

        // Configuracao dinamica
        this.gameSceneKey = (data && data.gameSceneKey) || 'TestScene';
        var levelName = (data && data.levelName) || 'TESTE';

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
        this.levelText = this.add.text(W - 15, 14, levelName, {
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
        var gameScene = this.scene.get(this.gameSceneKey);
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
