const AUDIO_FADE_DURATION = 4096;
const FPS = 60;
const GREY = 128 + 64 + 32;
const MAX_FADE = 1024;
const MAX_RADIUS = 4;
const NUM_DROPS = 64;
const RADIUS_GROWTH = 1 / 64;
const RAINFALL_GROWTH = 1 / 128;
const VOLUME_DELTA = 1 / 128;

class RainAnimation {
    constructor() {
        this.canvas = document.getElementById("kasa-no-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.resize();
        this.drops = new Array(NUM_DROPS)
            .fill()
            .map(_ => new Raindrop(this.canvas, this.ctx));
        this.age = 0;
        this.numDrops = 0;
        this.prevTime = null;
        this.requestId = null;
        // Selectively bind methods that would be bound multiple times.
        this.fadeIn = this.fadeIn.bind(this);
        this.mainLoop = this.mainLoop.bind(this);
        this.fadeOut = this.fadeOut.bind(this);
    }

    start() {
        this.age = 0;
        this.numDrops = 0;
        this.requestId = window.requestAnimationFrame(now => {
            this.prevTime = now;
            this.fadeIn(now);
        });
    }

    stop() {
        window.cancelAnimationFrame(this.requestId);
        window.requestAnimationFrame(this.fadeOut);
    }

    resize() {
        const container = document.getElementById("kasa-kanvas-kontainer");
        this.canvas.height = container.clientHeight;
        this.canvas.width = container.clientWidth;
    }

    fadeIn(now) {
        const elapsed = this.frameDelta(now);
        this.age += elapsed;
        this.numDrops += this.age * RAINFALL_GROWTH;
        this.clear();
        for (const drop of this.drops.slice(0, this.numDrops + 1)) {
            drop.draw();
            drop.tick(elapsed);
            if (drop.isDead) {
                drop.replace();
            }
        }
        if (this.numDrops < this.drops.length) {
            this.requestId = window.requestAnimationFrame(this.fadeIn);
        } else {
            this.requestId = window.requestAnimationFrame(this.mainLoop);
        }
    }

    mainLoop(now) {
        const elapsed = this.frameDelta(now);
        this.clear();
        for (const drop of this.drops) {
            drop.draw();
            drop.tick(elapsed);
            if (drop.isDead) {
                drop.replace();
            }
        }
        this.requestId = window.requestAnimationFrame(this.mainLoop);
    }

    fadeOut(now) {
        const elapsed = this.frameDelta(now);
        this.clear();
        for (const drop of this.drops) {
            drop.draw();
            drop.tick(elapsed);
        }
        if (this.drops.some(drop => !drop.isDead)) {
            window.requestAnimationFrame(this.fadeOut);
        }
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    frameDelta(now) {
        const result = (now - this.prevTime) / 1000 * FPS;
        this.prevTime = now;
        return result;
    }
}

class Raindrop {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.replace();
    }

    replace() {
        this.x = randInt(0, this.canvas.width);
        this.y = randInt(0, this.canvas.height);
        this.radius = MAX_RADIUS;
        this.fade = randInt(1, MAX_FADE);
        this.age = 0;
    }

    tick(elapsed) {
        this.age += elapsed;
        this.radius += this.age * RADIUS_GROWTH;
        this.fade -= this.age;
    }

    draw() {
        // Draw a solid circle.
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        const alpha = this.fade / MAX_FADE;
        this.ctx.fillStyle = `rgba(${GREY}, ${GREY}, ${GREY}, ${alpha})`;
        this.ctx.fill();
    }

    get isDead() {
        return this.fade <= 0;
    }
}

class FadeIn {
    constructor(player, duration) {
        this.player = player;
        this.duration = duration;
        this.targetVolume = 1;
        this.delay = null;
        this.timeoutId = null;
        this.fadeIn = this.fadeIn.bind(this);
    }

    start() {
        this.targetVolume = this.player.volume;
        this.player.volume = 0;
        const steps = this.targetVolume / VOLUME_DELTA;
        this.delay = this.duration / steps;
        this.timeoutId = setTimeout(this.fadeIn, this.delay);
    }

    reset() {
        this.player.volume = this.targetVolume;
        clearTimeout(this.timeoutId);
    }

    fadeIn() {
        this.player.volume += VOLUME_DELTA;
        if (this.player.volume < this.targetVolume) {
            this.timeoutId = setTimeout(this.fadeIn, this.delay);
        }
    }
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

window.addEventListener("load", () => {
    const animation = new RainAnimation();
    const player = document.getElementById("kasa-ni-ataru-ame");
    const fader = new FadeIn(player, AUDIO_FADE_DURATION);
    player.addEventListener("play", animation.start.bind(animation));
    player.addEventListener("pause", animation.stop.bind(animation));
    player.addEventListener("play", fader.start.bind(fader));
    player.addEventListener("pause", fader.reset.bind(fader));
    window.addEventListener("resize", animation.resize.bind(animation));
});
