// ============================================
// AudioManager — Audio Sintetizado (Web Audio API)
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

EscolaHeroes.AudioManager = {
    ctx: null,
    initialized: false,
    volume: 0.3,
    musicVolume: 0.1,
    musicOsc: null,
    musicGain: null,

    init: function () {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('AudioManager: Web Audio API nao disponivel');
        }
    },

    resume: function () {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    play: function (soundName) {
        if (!this.initialized || !this.ctx) return;
        try {
            this['_' + soundName] && this['_' + soundName]();
        } catch (e) { /* silencioso */ }
    },

    // --- Sons individuais ---

    _shoot: function () {
        var ctx = this.ctx;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain).connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.05);
    },

    _hit: function () {
        var ctx = this.ctx;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        osc.connect(gain).connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.05);
    },

    _monsterDie: function () {
        var ctx = this.ctx;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.2);
    },

    _playerDamage: function () {
        var ctx = this.ctx;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.setValueAtTime(180, ctx.currentTime + 0.03);
        osc.frequency.setValueAtTime(120, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain).connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.1);
    },

    _powerup: function () {
        var ctx = this.ctx;
        var notes = [523, 659, 784]; // Do-Mi-Sol
        for (var i = 0; i < notes.length; i++) {
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(notes[i], ctx.currentTime + i * 0.1);
            gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
            gain.gain.linearRampToValueAtTime(this.volume * 0.3, ctx.currentTime + i * 0.1 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.1);
            osc.connect(gain).connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.1);
            osc.stop(ctx.currentTime + i * 0.1 + 0.12);
        }
    },

    _special: function () {
        var ctx = this.ctx;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain).connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.5);
    },

    _bossDamage: function () {
        var ctx = this.ctx;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain).connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.15);
    },

    _bossPhase: function () {
        var ctx = this.ctx;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 1);
        gain.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
        osc.connect(gain).connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 1);
    },

    _bossDie: function () {
        var ctx = this.ctx;
        // Tom grave longo
        var o1 = ctx.createOscillator();
        var g1 = ctx.createGain();
        o1.type = 'sine';
        o1.frequency.setValueAtTime(80, ctx.currentTime);
        g1.gain.setValueAtTime(this.volume * 0.5, ctx.currentTime);
        g1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        o1.connect(g1).connect(ctx.destination);
        o1.start(); o1.stop(ctx.currentTime + 0.8);
        // Burst de notas
        var notes = [523, 659, 784, 1047];
        for (var i = 0; i < notes.length; i++) {
            var o2 = ctx.createOscillator();
            var g2 = ctx.createGain();
            o2.type = 'sine';
            var t = ctx.currentTime + 1 + i * 0.1;
            o2.frequency.setValueAtTime(notes[i], t);
            g2.gain.setValueAtTime(this.volume * 0.3, t);
            g2.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            o2.connect(g2).connect(ctx.destination);
            o2.start(t); o2.stop(t + 0.15);
        }
    },

    _levelComplete: function () {
        var ctx = this.ctx;
        var notes = [523, 659, 784, 1047]; // Do-Mi-Sol-Do
        for (var i = 0; i < notes.length; i++) {
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = 'sine';
            var t = ctx.currentTime + i * 0.12;
            osc.frequency.setValueAtTime(notes[i], t);
            gain.gain.setValueAtTime(this.volume * 0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
            osc.connect(gain).connect(ctx.destination);
            osc.start(t); osc.stop(t + 0.2);
        }
    },

    _gameOver: function () {
        var ctx = this.ctx;
        var notes = [784, 659, 523]; // Sol-Mi-Do descendente
        for (var i = 0; i < notes.length; i++) {
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = 'sine';
            var t = ctx.currentTime + i * 0.25;
            osc.frequency.setValueAtTime(notes[i], t);
            gain.gain.setValueAtTime(this.volume * 0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            osc.connect(gain).connect(ctx.destination);
            osc.start(t); osc.stop(t + 0.35);
        }
    },

    _click: function () {
        var ctx = this.ctx;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        gain.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.01);
        osc.connect(gain).connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.015);
    },

    // --- Musica simples ---
    startMusic: function (type) {
        this.stopMusic();
        if (!this.initialized || !this.ctx) return;

        try {
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
            this.musicGain.connect(this.ctx.destination);

            this.musicOsc = this.ctx.createOscillator();
            this.musicOsc.type = 'sine';

            var bpm = type === 'boss' ? 140 : (type === 'victory' ? 100 : 110);
            var beatDur = 60 / bpm;

            // Notas base por tipo
            var baseFreq = type === 'boss' ? 110 : (type === 'menu' ? 220 : (type === 'victory' ? 330 : 165));
            this.musicOsc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

            // Padrão rítmico simples com variação de frequência
            var notes = type === 'victory' ? [330, 392, 440, 523] :
                type === 'boss' ? [110, 131, 110, 98] :
                    type === 'menu' ? [220, 262, 294, 262] :
                        [165, 196, 220, 196];

            var now = this.ctx.currentTime;
            for (var rep = 0; rep < 100; rep++) {
                for (var n = 0; n < notes.length; n++) {
                    var t = now + (rep * 4 + n) * beatDur;
                    this.musicOsc.frequency.setValueAtTime(notes[n], t);
                }
            }

            this.musicOsc.connect(this.musicGain);
            this.musicOsc.start();
        } catch (e) { /* silencioso */ }
    },

    stopMusic: function () {
        try {
            if (this.musicOsc) { this.musicOsc.stop(); this.musicOsc = null; }
            if (this.musicGain) { this.musicGain.disconnect(); this.musicGain = null; }
        } catch (e) { /* silencioso */ }
    }
};

// Inicializar automaticamente
EscolaHeroes.AudioManager.init();

window.EscolaHeroes = EscolaHeroes;
