import { getImagePath } from './helpers.js';

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

ctx.fillStyle = "black";
ctx.strokeStyle = "black";

let windowHeight = window.innerHeight;
let windowWidth = window.innerWidth;
let navbarHeight = document.getElementById("navbar").offsetHeight;

canvas.width = windowWidth;
canvas.height = windowHeight - navbarHeight - 6;
let area = canvas.width * canvas.height;

let background = new Image();

background.src = getImagePath("blackhole.png");

let widthRatio = canvas.width / background.width    ;
let heightRatio = canvas.height / background.height  ;

background.onload = function(){
    ctx.drawImage(background, 0,0, background.width, background.height, 0, 0,background.width * widthRatio, background.height * heightRatio); 
}

/*
 * The following are used for checking if the objects have gone too far offscreen
 * It is desirable for them to despawn not immediately after they have gone offscreen
 * but a little after that. 
 * If they were to despawn immediately you could quite easily notice by tracking one that
 * should only go offscreen for a moment.
 */
let boundaryLeft = canvas.width * -0.5;
let boundaryRight = canvas.width * 1.5;
let boundaryBottom = canvas.height * 1.5;
let boundaryTop = canvas.height * -0.5;

class Blackhole {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        // This.constant is used to achieve a gravitational pull that is pleasing to the eye.
        this.constant = area / 65;
    }
}

// Create blackhole for objects to be pulled towards and sucked into
let blackhole = new Blackhole(0.508 * canvas.width, 0.54 * canvas.height, 0.07*canvas.width);

class SpaceObject {
    static maxSpeed = area / 81120;
    static minSpeed = area / 648960;
    static maxRadius = Math.round(area / 21632);
    static minRadius = Math.round(area / 54080);

    // Spawnsides is used to make life easier when spawning an object
    static SpawnSides = {
        Top: 0,
        Bottom: 1,
        Left: 2,
        Right: 3
    }
    constructor () {
        this.radius = Math.max(SpaceObject.minRadius, Math.random() * SpaceObject.maxRadius);
        this.diameter = this.radius * 2;
        /*
         * sideOfSpawn determines which side the asteroid will spawn on.

         * The below code then ensures that the asteroid has an appropriate direction 
         * such that it will enter the game rather than despawn instantly.
         * It also determines the initial x and y coordinates.
         * 
         * Math.round(Math.random()) * 2 - 1 is used because it always gives -1 or 1
         * and so is useful for assigning a random direction.
         */
        let sideOfSpawn = Math.round(Math.random() * 4);
        let xDirection;
        let yDirection;
        if (sideOfSpawn == SpaceObject.SpawnSides.Bottom || sideOfSpawn == SpaceObject.SpawnSides.Top) {
            if (sideOfSpawn == SpaceObject.SpawnSides.Bottom) {
                this.y = canvas.height + this.radius;
                yDirection = -1;
            }
            else if (sideOfSpawn == SpaceObject.SpawnSides.Top) {
                this.y = -1 * this.radius;
                yDirection = 1;
            }
            this.x = Math.random() * (canvas.width + this.diameter);
            xDirection = Math.round(Math.random()) * 2 - 1;
        }
        else {
            if (sideOfSpawn == SpaceObject.SpawnSides.Left) {
                this.x = -1 * this.radius;
                xDirection = 1;
            }
            else if (sideOfSpawn == SpaceObject.SpawnSides.Right) {
                this.x = canvas.width + this.radius;
                xDirection = -1;
            }
            this.y = Math.random() * (canvas.height + this.diameter);
            yDirection = Math.round(Math.random()) * 2 - 1;
        }

        this.xVelocity = Math.max(Math.random() * SpaceObject.maxSpeed, SpaceObject.minSpeed) * xDirection;
        this.yVelocity = Math.max(Math.random() * SpaceObject.maxSpeed, SpaceObject.minSpeed) * yDirection;
    }

    draw() {
        // Draws circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    isOffScreen() {
        // Checks if the objects has gone off screen plus a little bit further
        if (this.x - this.radius > boundaryRight || this.x + this.radius < boundaryLeft || this.y - this.radius > boundaryBottom || this.y + this.radius < boundaryTop) {
            return true;
        }
        return false;
    }

    isInsideBlackhole() {
        // Checks if object is inside black hole
        if (this.distanceToBlackHole + this.radius < blackhole.radius) {
            return true;
        }
        return false;
    }

    apply_gravity() {
        // Pulls the object towards the blackhole
        let xDistance = blackhole.x - this.x;
        let yDistance = blackhole.y - this.y;

        this.distanceToBlackHole = Math.sqrt(xDistance ** 2 + yDistance ** 2);
        let force = blackhole.constant / (this.distanceToBlackHole ** 2);

        let xAcceleration = (force * xDistance) / this.distanceToBlackHole;
        let yAcceleration = (force * yDistance) / this.distanceToBlackHole;

        this.xVelocity += xAcceleration;
        this.yVelocity += yAcceleration;
    }

    update_pos() {
        this.x += this.xVelocity;
        this.y += this.yVelocity;
    }

    update() {
        // Updates position, renders object and returns if object should despawn.
        this.update_pos();
        this.apply_gravity();
        this.draw();
        return (this.isOffScreen() || this.isInsideBlackhole());
    }
}

class Program {
    constructor() {
        this.objects = [];
        this.update();
    }

    update_objects() {
        // Updates all objects and removes them if they go inside the black hole or 
        // go too far off screen.
        let remove = false;
        for (let i = this.object_count - 1; i >= 0; i--) {
            remove = this.objects[i].update();
            if (remove) {
                this.objects.splice(i, 1);
                this.object_count -= 1;
            }
        }
    }

    spawn_object() {
        // Has a chance to spawn an object
        if (Math.random() < 0.04) {
            this.objects.push(new SpaceObject());
        }        
    }

    update() {
        this.object_count = this.objects.length;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        this.spawn_object();
        this.update_objects();
        requestAnimationFrame(this.update.bind(this));
    }
}

let P = new Program();