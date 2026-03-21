// ============================================
// Escola Heroes — Main (Phaser Config)
// ============================================

(function () {
    var config = {
        type: Phaser.AUTO,
        width: EscolaHeroes.GAME_WIDTH,
        height: EscolaHeroes.GAME_HEIGHT,
        backgroundColor: '#87CEEB',
        parent: 'game-container',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: [
            EscolaHeroes.BootScene,
            EscolaHeroes.MenuScene,
            EscolaHeroes.HowToPlayScene,
            EscolaHeroes.SelectScene,
            EscolaHeroes.TestScene,
            EscolaHeroes.HUDScene
        ]
    };

    var game = new Phaser.Game(config);
    window.EscolaHeroes.game = game;
})();
