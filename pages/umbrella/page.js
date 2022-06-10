const GREY = 128 + 64 + 32;
const NUM_DROPS = 64;
const MAX_FADE = 1024;
const MAX_RADIUS = 4;

class RainAnimation {
    constructor() {
        this.canvas = document.getElementById("kasa-no-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.resize();
        this.drops = new Array(NUM_DROPS)
            .fill()
            .map(_ => new Raindrop(this.canvas, this.ctx));
    }

    resize = () => {
        const container = document.getElementById("kasa-kanvas-kontainer");
        this.canvas.height = container.clientHeight;
        this.canvas.width = container.clientWidth;
    }

    start = () => {
        this.requestId = window.requestAnimationFrame(this.draw);
    }

    stop = () => {
        if (this.requestId !== undefined) {
            window.cancelAnimationFrame(this.requestId);
        }
        window.requestAnimationFrame(this.fadeOut);
    }

    draw = () => {
        this.clear();
        for (const drop of this.drops) {
            drop.draw();
            drop.tick();
            if (drop.isDead) {
                drop.place();
            }
        }
        this.requestId = window.requestAnimationFrame(this.draw);
    }

    fadeOut = () => {
        this.clear();
        for (const drop of this.drops) {
            drop.draw();
            drop.tick();
        }
        if (this.drops.some(drop => !drop.isDead)) {
            window.requestAnimationFrame(this.fadeOut);
        }
    }

    clear = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

class Raindrop {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.place();
    }

    place = () => {
        this.x = randInt(0, this.canvas.width);
        this.y = randInt(0, this.canvas.height);
        this.radius = randInt(1, MAX_RADIUS);
        this.radius = MAX_RADIUS;
        this.fade = randInt(1, MAX_FADE);
        this.age = 0;
    }

    tick = () => {
        ++this.age;
        this.radius += this.age / 64;
        this.fade -= this.age;
    }

    draw = () => {
        // Draw a solid circle.
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = `rgba(${GREY}, ${GREY}, ${GREY}, ${this.fade/MAX_FADE})`;
        this.ctx.fill();
    }

    get isDead() {
        return this.fade <= 0;
    }
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

window.addEventListener("load", () => {
    const animation = new RainAnimation();
    const player = document.getElementById("kasa-ni-ataru-ame");
    player.addEventListener("play", animation.start);
    player.addEventListener("pause", animation.stop);
    window.addEventListener("resize", animation.resize);
});
