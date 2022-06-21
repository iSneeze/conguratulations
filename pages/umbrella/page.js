const ANIMATION_OPTIONS = {
    fps: 60,
    numDrops: 64,
    rainfallGrowth: 1 / 128,
}
const GREY = 128 + 64 + 32;
const DROP_OPTIONS = {
    colour: `${GREY}, ${GREY}, ${GREY}`,
    maxFade: 1024,
    radius: 4,
    radiusGrowth: 1 / 64,
};
const FADER_OPTIONS = {
    duration: 4096,
    volumeDelta: 1 / 128,
};

/** Configurable canvas animation of rain falling onto the page. */
class RainAnimation {
    /**
     * Constructor.
     *
     * @param {HTMLCanvasElement} canvas
     *     Canvas to animate onto.
     * @param {number} options.fps
     *     Number of frame updates per second; this adjusts speed.
     * @param {number} options.numDrops
     *     Number of raindrops on screen.
     * @param {number} options.rainfallGrowth
     *     Multiplicative factor to scale the quadratic growth in the number of
     *     drops during fade in.
     * @param {object} raindropOptions
     *     Options for each raindrop.
     *     @see Raindrop
     */
    constructor(canvas, options, raindropOptions) {
        this.canvas = canvas;
        this.options = options;
        this.ctx = this.canvas.getContext("2d");
        this.drops = new Array(this.options.numDrops)
            .fill()
            .map(_ => new Raindrop(this.canvas, raindropOptions));
        this.age = 0;
        this.numDrops = 0;
        this.prevTime = null;
        this.requestId = null;
        // Selectively bind methods that would be bound multiple times.
        this.fadeIn = this.fadeIn.bind(this);
        this.mainLoop = this.mainLoop.bind(this);
        this.fadeOut = this.fadeOut.bind(this);
    }

    /** Starts the animation with a fade-in. */
    start() {
        this.age = 0;
        this.numDrops = 0;
        this.requestId = window.requestAnimationFrame(now => {
            this.prevTime = now;
            this.fadeIn(now);
        });
    }

    /** Stops the animation with a fade-out. */
    stop() {
        window.cancelAnimationFrame(this.requestId);
        window.requestAnimationFrame(this.fadeOut);
    }

    /** @private Fade-in animation callback. */
    fadeIn(now) {
        const elapsed = this.frameDelta(now);
        this.age += elapsed;
        this.numDrops += this.age * this.options.rainfallGrowth;
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

    /** @private Main animation loop callback. */
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

    /** @private Fade-out animation callback. */
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

    /** @private Clears the canvas. */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /** @private Updates latest frame time and returns number of frames since. */
    frameDelta(now) {
        const result = (now - this.prevTime) / 1000 * this.options.fps;
        this.prevTime = now;
        return result;
    }
}

/**
 * Canvas raindrop to be drawn.
 *
 * @see RainAnimation
 */
class Raindrop {
    /**
     * Constructor.
     *
     * @param {HTMLCanvasElement} canvas
     *     Canvas to draw onto.
     * @param {string} options.colour
     *     Raindrop colour as a comma-separated string of RGB decimal values,
     *     e.g. white is expressed as "255, 255, 255".
     * @param {number} options.maxFade
     *     Alpha resolution; a raindrop can have an alpha value in increments
     *     of 1/maxFade, with 1/maxFade being the minimum opacity.
     * @param {number} options.radius
     *     Initial drop radius in pixels.
     * @param {number} options.radiusGrowth
     *     Multiplicative factor to scale the quadratic growth in radius over
     *     time.
     */
    constructor(canvas, options) {
        this.canvas = canvas;
        this.options = options;
        this.ctx = this.canvas.getContext("2d");
        this.replace();
    }

    /** Resets the raindrop, replacing it elsewhere anew. */
    replace() {
        this.x = randInt(0, this.canvas.width);
        this.y = randInt(0, this.canvas.height);
        this.radius = this.options.radius;
        this.fade = randInt(1, this.options.maxFade);
        this.age = 0;
    }

    /**
      * Updates state.
      *
      * @param {number} elapsed
      *     Number of frames that have elapsed since last update.
      */
    tick(elapsed) {
        this.age += elapsed;
        this.radius += this.age * this.options.radiusGrowth;
        this.fade -= this.age;
    }

    /** Draws the raindrop onto the canvas. */
    draw() {
        // Draw a solid circle.
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        const alpha = this.fade / this.options.maxFade;
        this.ctx.fillStyle = `rgba(${this.options.colour}, ${alpha})`;
        this.ctx.fill();
    }

    /** @returns {boolean} Whether the raindrop has fully faded out. */
    get isDead() {
        return this.fade <= 0;
    }
}

/** Volume fader. */
class FadeIn {
    /**
     * Constructor.
     *
     * @param {HTMLMediaElement} player
     *     Media player to fade in.
     * @param {number} options.duration
     *     Fade duration in seconds.
     * @param {number} options.volumeDelta
     *     Flat percentage of maximum volume to increase by per step;
     *     decreasing this improves smoothness at a potential performance cost.
     */
    constructor(player, options) {
        this.player = player;
        this.options = options;
        this.targetVolume = 1;
        this.delay = null;
        this.timeoutId = null;
        this.fadeIn = this.fadeIn.bind(this);
    }

    /** Starts the fade-in. */
    start() {
        this.targetVolume = this.player.volume;
        this.player.volume = 0;
        const steps = this.targetVolume / this.options.volumeDelta;
        this.delay = this.options.duration / steps;
        this.timeoutId = setTimeout(this.fadeIn, this.delay);
    }

    /** Resets volume. */
    reset() {
        this.player.volume = this.targetVolume;
        clearTimeout(this.timeoutId);
    }

    /** @private Fade-in timeout callback. */
    fadeIn() {
        this.player.volume += this.options.volumeDelta;
        if (this.player.volume < this.targetVolume) {
            this.timeoutId = setTimeout(this.fadeIn, this.delay);
        }
    }
}

/** Resizes canvas to fit container. */
function resize(canvas, container) {
    canvas.height = container.clientHeight;
    canvas.width = container.clientWidth;
}

/** @returns {number} A random integer between [min, max). */
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

window.addEventListener("load", () => {
    const canvas = document.getElementById("kasa-no-canvas");
    const container = document.getElementById("kasa-kanvas-kontainer");
    resize(canvas, container);
    const animation = new RainAnimation(
        canvas, ANIMATION_OPTIONS, DROP_OPTIONS
    );
    const player = document.getElementById("kasa-ni-ataru-ame");
    const fader = new FadeIn(player, FADER_OPTIONS);
    player.addEventListener("play", animation.start.bind(animation));
    player.addEventListener("pause", animation.stop.bind(animation));
    player.addEventListener("play", fader.start.bind(fader));
    player.addEventListener("pause", fader.reset.bind(fader));
    window.addEventListener("resize", resize.bind(null, canvas, container));
});
