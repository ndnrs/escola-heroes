// ============================================
// VirtualJoystick — Joystick Virtual para Mobile
// ============================================

var EscolaHeroes = window.EscolaHeroes || {};

EscolaHeroes.VirtualJoystick = function (scene, x, y) {
    this.scene = scene;
    this.baseX = x;
    this.baseY = y;
    this.baseRadius = 50;
    this.thumbRadius = 20;
    this.deadzone = 10;
    this.active = false;
    this.pointerId = null;

    // Output normalizado (-1 a 1)
    this.outputX = 0;
    this.outputY = 0;

    // Base (circulo cinza semi-transparente)
    this.base = scene.add.circle(x, y, this.baseRadius, 0x888888, 0.3);
    this.base.setDepth(200);
    this.base.setScrollFactor(0);

    // Thumb (circulo branco)
    this.thumb = scene.add.circle(x, y, this.thumbRadius, 0xFFFFFF, 0.6);
    this.thumb.setDepth(201);
    this.thumb.setScrollFactor(0);

    // Zona interactiva (maior que a base para facilitar)
    this.hitZone = scene.add.zone(x, y, this.baseRadius * 3, this.baseRadius * 3);
    this.hitZone.setDepth(202);
    this.hitZone.setScrollFactor(0);
    this.hitZone.setInteractive();

    var self = this;

    this.hitZone.on('pointerdown', function (pointer) {
        self.active = true;
        self.pointerId = pointer.id;
        self.updateThumb(pointer.x, pointer.y);
    });

    scene.input.on('pointermove', function (pointer) {
        if (self.active && pointer.id === self.pointerId) {
            self.updateThumb(pointer.x, pointer.y);
        }
    });

    scene.input.on('pointerup', function (pointer) {
        if (pointer.id === self.pointerId) {
            self.active = false;
            self.pointerId = null;
            self.outputX = 0;
            self.outputY = 0;
            self.thumb.setPosition(self.baseX, self.baseY);
        }
    });
};

EscolaHeroes.VirtualJoystick.prototype.updateThumb = function (px, py) {
    var dx = px - this.baseX;
    var dy = py - this.baseY;
    var dist = Math.sqrt(dx * dx + dy * dy);

    // Limitar ao raio da base
    if (dist > this.baseRadius) {
        dx = (dx / dist) * this.baseRadius;
        dy = (dy / dist) * this.baseRadius;
        dist = this.baseRadius;
    }

    this.thumb.setPosition(this.baseX + dx, this.baseY + dy);

    // Zona morta
    if (dist < this.deadzone) {
        this.outputX = 0;
        this.outputY = 0;
    } else {
        this.outputX = dx / this.baseRadius;
        this.outputY = dy / this.baseRadius;
    }
};

EscolaHeroes.VirtualJoystick.prototype.getDirection = function () {
    return { x: this.outputX, y: this.outputY };
};

EscolaHeroes.VirtualJoystick.prototype.destroy = function () {
    this.base.destroy();
    this.thumb.destroy();
    this.hitZone.destroy();
};

window.EscolaHeroes = EscolaHeroes;
