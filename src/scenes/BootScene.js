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

                    loadingText.setText('Toca para comecar');
                    loadingText.setFontSize('28px');

                    // Esperar por interaccao do utilizador (necessario para AudioContext)
                    self.input.once('pointerdown', function () {
                        EscolaHeroes.AudioManager.resume();
                        EscolaHeroes.AudioManager.play('click');
                        self.cameras.main.fadeOut(300, 0, 0, 0);
                        self.cameras.main.once('camerafadeoutcomplete', function () {
                            self.scene.start('MenuScene');
                        });
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
        // Gerar texturas de monstros
        this.generateMonsterTextures();
        // Gerar texturas de power-ups
        this.generatePowerUpTextures();
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

    generateMonsterTextures() {
        // Gosma Verde — blob verde com olhos
        var g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x00AA00, 1);
        g.fillEllipse(20, 22, 36, 30);
        g.fillStyle(0x008800, 1);
        g.fillEllipse(20, 28, 30, 14);
        g.fillStyle(0xFFFFFF, 1);
        g.fillCircle(13, 16, 5);
        g.fillCircle(27, 16, 5);
        g.fillStyle(0x000000, 1);
        g.fillCircle(14, 16, 2.5);
        g.fillCircle(28, 16, 2.5);
        g.fillStyle(0x006600, 1);
        g.fillEllipse(20, 26, 10, 4);
        g.generateTexture('monster_gosmaverde', 40, 40);
        g.destroy();

        // Morcego — triangulos cinza (asas) + corpo + olhos vermelhos
        g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x666666, 1);
        g.fillTriangle(0, 12, 14, 18, 8, 28);
        g.fillTriangle(40, 12, 26, 18, 32, 28);
        g.fillStyle(0x555555, 1);
        g.fillCircle(20, 20, 10);
        g.fillStyle(0xFF0000, 1);
        g.fillCircle(16, 18, 3);
        g.fillCircle(24, 18, 3);
        g.fillStyle(0xFFFF00, 1);
        g.fillCircle(16, 18, 1.5);
        g.fillCircle(24, 18, 1.5);
        g.generateTexture('monster_morcego', 40, 40);
        g.destroy();

        // Aranha Saltitona — corpo arredondado + patas
        g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x8B4513, 1);
        g.fillCircle(20, 20, 12);
        g.fillStyle(0x6B3410, 1);
        g.fillCircle(20, 16, 7);
        g.lineStyle(2, 0x8B4513, 1);
        g.lineBetween(8, 14, 2, 6);
        g.lineBetween(32, 14, 38, 6);
        g.lineBetween(8, 20, 2, 20);
        g.lineBetween(32, 20, 38, 20);
        g.lineBetween(8, 26, 2, 32);
        g.lineBetween(32, 26, 38, 32);
        g.fillStyle(0xFF0000, 1);
        g.fillCircle(17, 14, 2);
        g.fillCircle(23, 14, 2);
        g.generateTexture('monster_aranhasaltitona', 40, 40);
        g.destroy();

        // Fantasma — forma branca semi-transparente
        g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xCCCCFF, 0.8);
        g.fillCircle(20, 14, 12);
        g.fillRect(8, 14, 24, 16);
        g.fillStyle(0xCCCCFF, 0.6);
        g.fillTriangle(8, 30, 14, 38, 8, 38);
        g.fillTriangle(14, 30, 20, 38, 14, 38);
        g.fillTriangle(20, 30, 26, 38, 20, 38);
        g.fillTriangle(26, 30, 32, 38, 26, 38);
        g.fillStyle(0x000000, 1);
        g.fillCircle(15, 16, 3);
        g.fillCircle(25, 16, 3);
        g.fillStyle(0x000000, 0.5);
        g.fillEllipse(20, 24, 6, 4);
        g.generateTexture('monster_fantasma', 40, 40);
        g.destroy();

        // Livro Voador — rectangulo castanho com paginas
        g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xA0522D, 1);
        g.fillRect(6, 8, 28, 24);
        g.fillStyle(0xFFF8DC, 1);
        g.fillRect(10, 10, 20, 20);
        g.lineStyle(1, 0x8B4513, 1);
        g.lineBetween(14, 12, 14, 28);
        g.lineBetween(18, 12, 18, 28);
        g.lineBetween(22, 12, 22, 28);
        g.fillStyle(0x000000, 1);
        g.fillCircle(14, 18, 2);
        g.fillCircle(22, 18, 2);
        g.lineStyle(1, 0x000000, 1);
        g.beginPath();
        g.arc(18, 23, 3, 0, Math.PI, false);
        g.strokePath();
        g.generateTexture('monster_librovoador', 40, 40);
        g.destroy();

        // Sombra — forma escura
        g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x333333, 0.9);
        g.fillEllipse(20, 20, 32, 36);
        g.fillStyle(0x222222, 1);
        g.fillEllipse(20, 18, 26, 28);
        g.fillStyle(0xFF0000, 0.8);
        g.fillCircle(14, 16, 3);
        g.fillCircle(26, 16, 3);
        g.fillStyle(0xFF0000, 0.4);
        g.fillEllipse(20, 26, 8, 3);
        g.generateTexture('monster_sombra', 40, 40);
        g.destroy();

        // Projectil de monstro (generico)
        g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xFF4444, 0.6);
        g.fillCircle(6, 6, 6);
        g.fillStyle(0xFF0000, 1);
        g.fillCircle(6, 6, 3);
        g.generateTexture('proj_monster', 12, 12);
        g.destroy();
    }

    generatePowerUpTextures() {
        // Coracao — vermelho
        var g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xFF0000, 1);
        g.fillCircle(10, 10, 6);
        g.fillCircle(18, 10, 6);
        g.fillTriangle(4, 12, 24, 12, 14, 24);
        g.fillStyle(0xFFFFFF, 0.5);
        g.fillCircle(10, 8, 2);
        g.generateTexture('powerup_heart', 28, 28);
        g.destroy();

        // Escudo — bolha azul
        g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x00BFFF, 0.4);
        g.fillCircle(14, 14, 14);
        g.fillStyle(0x00BFFF, 0.8);
        g.fillCircle(14, 14, 10);
        g.fillStyle(0xFFFFFF, 0.6);
        g.fillCircle(10, 10, 4);
        g.generateTexture('powerup_shield', 28, 28);
        g.destroy();

        // Ataque Forte — estrela dourada
        g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xFFD700, 1);
        g.fillTriangle(14, 2, 10, 12, 18, 12);
        g.fillTriangle(14, 24, 10, 14, 18, 14);
        g.fillTriangle(2, 12, 12, 10, 12, 16);
        g.fillTriangle(26, 12, 16, 10, 16, 16);
        g.fillStyle(0xFFFFFF, 0.5);
        g.fillCircle(12, 10, 2);
        g.generateTexture('powerup_attack', 28, 28);
        g.destroy();

        // Velocidade — bota alada verde
        g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x00FF88, 1);
        g.fillRoundedRect(4, 10, 18, 14, 3);
        g.fillRoundedRect(14, 18, 10, 6, 2);
        g.fillStyle(0xFFFFFF, 0.8);
        g.fillTriangle(6, 8, 2, 14, 10, 12);
        g.fillTriangle(10, 4, 6, 10, 14, 10);
        g.generateTexture('powerup_speed', 28, 28);
        g.destroy();
    }
};

window.EscolaHeroes = EscolaHeroes;
