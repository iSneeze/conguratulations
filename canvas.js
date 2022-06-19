const shrimpDimensions = 75; //px

/// Canvas

function createCanvas(id) { // creates a canvas
    let canvas = document.createElement("canvas");
    canvas.id = id;
    document.body.appendChild(canvas);  // add to document
    return canvas;
}

function sizeCanvas(id) {                  // resizes canvas. Will create a canvas if it does not exist
    if (canvas === undefined) {          // if there is no canvas create it
        canvas = createCanvas(id);
        ctx = canvas.getContext("2d");   // get the 2D context
    }
    canvas.width = window.innerWidth;    // set the resolution to fill the page
    canvas.height = window.innerHeight;
}

/// Vector and Ebi class containing the simulation logic

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    setCoords(x, y) {
        this.x = x;
        this.y = y;
    }

    add(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    sub(other) {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    deltaX(other) {
        return this.x - other.x;
    }

    deltaY(other) {
        return this.y - other.y;
    }

    get magnitude() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
    }

    get normal() {
        let magnitude = this.magnitude
        return new Vector(this.x / magnitude, this.y / magnitude);
    }

    limit(magnitude) {
        if (this.magnitude > magnitude) {
            return this.normal * magnitude;
        }
        return this;
    }

    scale(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    toString() {
        return "Vector(" + this.x + ", " + this.y + ")";
    }
}

class Ebi {
    constructor(imageAssetUrl, posX, posY) {
        this.coords = new Vector(posX, posY);
        this.image = new Image(shrimpDimensions, shrimpDimensions);
        this.image.src = imageAssetUrl;
        this.velocity = new Vector(
            //random start velocity
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5
        );
        this.acceleration = new Vector(0, 0);
    }

    update() {
        // let acceleration always point to the mouse cursor.
        this.acceleration = mousePos.sub(this.coords).normal.scale(0.3);
        // every frame the acceleration gets added to the velocity, and scaled by a friction factor
        this.velocity = this.velocity.scale(0.99).add(this.acceleration);
        // update the position depending on the velocity
        this.coords = this.coords.add(this.velocity);
        this.rotation = Math.atan2(this.velocity.y, this.velocity.x) - Math.PI;
    }

    draw() {
        // weird canvas drawing stuff
        ctx.save();
        ctx.translate(this.coords.x, this.coords.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(this.image, -shrimpDimensions / 2, -shrimpDimensions / 2, shrimpDimensions, shrimpDimensions);
        ctx.restore();

        // ctx.rotate(-this.rotationInRads);
        // ctx.translate(-this.coords.x, -this.coords.y);

    }
}

// Setup and update

let running = false;
let canvas;
let ctx;
// the resize listener
window.addEventListener("resize", sizeCanvas("canvasEbi"));
// call sizeCanvas to create and set the canvas resolution
sizeCanvas("canvasEbi");

let mousePos = new Vector(0, 0);
let ebis = [];
document.addEventListener("mousemove", (e) => {
    mousePos.setCoords(e.clientX, e.clientY);
})

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ebis.forEach((ebi) => {
        ebi.update();
        ebi.draw();
    });
    if (running) {
        setTimeout(() => {
            requestAnimationFrame(update);
        }, 1000 / 90);

    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

}

function setupEbis() {
    ebis = [];
    // with a selector, get the ebi image DOM elements
    const ebiSideNav = document.querySelectorAll("div.flexnav > a > img.shrimp");
    ebiSideNav.forEach((ebi) => {
        // save the src and position
        ebis.push(
            new Ebi(
                ebi.getAttribute("src"),
                ebi.offsetLeft + shrimpDimensions / 2,
                ebi.offsetTop + shrimpDimensions / 2)
        );
    });
}

function toggleSideNavEbis() {
    // with a selector, get the ebi image DOM elements
    const ebiSideNav = document.querySelectorAll("div.flexnav > a > img.shrimp");
    // hide the static images when the ebi simulation is running, restore after
    if (running) {
        ebiSideNav.forEach((ebi) => {
            ebi.style.visibility = "hidden";
        });
    } else {
        ebiSideNav.forEach((ebi) => {
            ebi.style.visibility = "visible";
        });
    }

}

// Button click handler

function releaseTheEbis() {
    if (!running) {
        document.getElementById("releaseEbis").textContent = "OH NYO, GO BACK!";
        setupEbis();
        running = true;
        document.body.style.cursor = 'url(https://yt3.ggpht.com/uKixUjXa26VwrLMqbK3UE0-oUY5RqJjrqvawfb7T_WNyGIz5LUU-qNQnhlBtk1324X1ZCBpE=h48-k-nd) 24 24, auto'
        requestAnimationFrame(update);
    } else {
        document.getElementById("releaseEbis").textContent = "RELEASE THE EBIS";
        document.body.style.cursor = "";

        running = false;
    }
    toggleSideNavEbis();
}
