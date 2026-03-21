// ============================================
// Escola Heroes — Constantes do Jogo
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

EscolaHeroes.GAME_WIDTH = 800;
EscolaHeroes.GAME_HEIGHT = 600;

// --- Stats do Jogador ---
EscolaHeroes.PLAYER_STATS = {
    hp: 100,
    speed: 200,
    fireRate: 300,
    projectileDamage: 10,
    specialDamage: 30
};

// --- Personagens ---
EscolaHeroes.CHARACTERS = [
    {
        name: 'Matilde',
        color: 0xFF69B4,
        colorHex: '#FF69B4',
        projectileColor: 0xFF69B4,
        specialName: 'Estrela Gigante',
        specialDescription: 'Estrela gigante que causa dano em area'
    },
    {
        name: 'Riana',
        color: 0x4A90D9,
        colorHex: '#4A90D9',
        projectileColor: 0x4A90D9,
        specialName: 'Onda Congelante',
        specialDescription: 'Onda que abranda os inimigos'
    },
    {
        name: 'Violeta',
        color: 0x9B59B6,
        colorHex: '#9B59B6',
        projectileColor: 0x9B59B6,
        specialName: 'Escudo Violeta',
        specialDescription: 'Invencibilidade durante 3 segundos'
    },
    {
        name: 'Leonor',
        color: 0x2ECC71,
        colorHex: '#2ECC71',
        projectileColor: 0x2ECC71,
        specialName: 'Chuva de Folhas',
        specialDescription: 'Folhas magicas que causam dano em area'
    }
];

// --- Power-ups ---
EscolaHeroes.POWERUPS = {
    HEART:   { name: 'Coracao',       color: 0xFF0000, effect: 'heal',    value: 25, duration: 0 },
    SHIELD:  { name: 'Escudo',        color: 0x00BFFF, effect: 'shield',  value: 0,  duration: 5000 },
    ATTACK:  { name: 'Ataque Forte',  color: 0xFFD700, effect: 'attack',  value: 3,  duration: 8000 },
    SPEED:   { name: 'Velocidade',    color: 0xFFFFFF, effect: 'speed',   value: 1.5, duration: 6000 }
};

EscolaHeroes.POWERUP_DROP_CHANCE = 0.15;
EscolaHeroes.POWERUP_LIFETIME = 5000;

// --- Niveis ---
EscolaHeroes.LEVELS = [
    { key: 'CantinScene',    name: 'Cantina',            bgColor: '#FFF8DC' },
    { key: 'GymScene',       name: 'Pavilhao Desportivo', bgColor: '#F0F8FF' },
    { key: 'ClassroomScene', name: 'Salas de Aula',      bgColor: '#FFF5EE' },
    { key: 'BossScene',      name: 'Patio da Escola',    bgColor: '#F0FFF0' }
];

// --- Especial ---
EscolaHeroes.SPECIAL_KILLS_NEEDED = 10;

window.EscolaHeroes = EscolaHeroes;
