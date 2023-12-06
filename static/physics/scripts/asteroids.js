import { getImagePath } from './helpers.js';

// Stop arrow keys and space from scrolling the page in browser
window.addEventListener("keydown", function(e) {
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

const canvas = document.getElementById("asteroids-canvas");
let ctx = canvas.getContext("2d");

let windowHeight = window.innerHeight;
let windowWidth = window.innerWidth;
let navbarHeight = document.getElementById("navbar").offsetHeight;

let widthToHeightRatio = 2.5;

canvas.width = Math.min(windowWidth, (windowHeight - navbarHeight) * widthToHeightRatio);
canvas.height = Math.min(windowWidth / widthToHeightRatio, windowHeight - navbarHeight - 10);
canvas.style.background = "#888";

let smallFont = Math.round(0.04 * canvas.height).toString() + "px sans-serif";
let mediumFont = Math.round(0.08 * canvas.height).toString() + "px sans-serif";
let bigFont = Math.round(0.1 * canvas.height).toString() + "px sans-serif";
ctx.font = bigFont;

const date = new Date();

class inputHandler {
    constructor(parent) {
        // parent here is an instance of the class that is using the input handler
        // i.e. parent could be an instance of Game or Menu
        this.parent = parent;

        // When a key is pressed it is added to keysPressed of the parent object
        window.addEventListener('keydown', function(e) {
            if (parent.controls.includes(e.key) & !parent.keysPressed.includes(e.key)) {
                parent.keysPressed.push(e.key);
            }
        });

        // When a key is released, the corresponding key is removed from keysPressed of the parent
        window.addEventListener('keyup', function(e) {
            let index = parent.keysPressed.indexOf(e.key);
            if (index != -1) {
                parent.keysPressed.splice(index, 1);
            }
        });
    }
}

class Menu {
    static Options = {
        PLAY: 0,
        TUTORIAL: 1,
    }
    constructor(game) {
        this.game = game;
        // optionKeys contains strings of keys of all of Menu.Options elements
        this.optionKeys = Object.keys(Menu.Options);
        this.optionCount = this.optionKeys.length;
        /*
         * controls contains all the keys to be used by the menu
         * keysPressed contains all keys from controls that currently being pressed
         * this.input handles adding and removing keys upon key press, although
         * this.handleKeysPressed() will remove keys upon use
         */
        this.controls = ["ArrowUp", "ArrowDown", "Enter"];
        this.keysPressed = [];
        this.input = new inputHandler(this);
        this.selectedOption = 0;
        // optionsX is the proportion of the way across the screen that the menu options will be displayed
        // optionsSelecterSize determines how big the option selecter square is
        this.optionsX = 0.4;
        this.optionsSelecterSize = 0.05;
        this.setupMenu();
        this.displayOptionSelecter();
    }

    displayMenuOptions() {
        // Clears canvas, set fill to black to display menu options text
        // Then displays each menu option
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        for (let i = 0; i < this.optionCount; i++) {
            displayText(this.menuOptions[i]);
        }
    }

    setupMenu() {
        this.menuOptions = [];
        // yStart is the y proportion of the canvas height for the first menu option
        // yDifference is the proportion for the difference in y between menu options
        let yStart = 0.35;
        let yDifference = 0.25;

        // For each option in Menu.Options, the string of the key and x and y 
        // proportions for where it is to be displayed are added to menuOptions
        for (let i = 0; i < this.optionCount; i++) {
            let y = yStart + yDifference * i;
            this.menuOptions.push([this.optionKeys[i], this.optionsX, y])
        }

        // Each time the menu is opened, the menu text is displayed just once by this call
        this.displayMenuOptions();
    }

    displayOptionSelecter() {
        // Displays a red square next to the menu option that is currently selected
        // Square size is proportional to canvas height
        let x = (this.optionsX - this.optionsSelecterSize) * canvas.width;
        let y = (this.menuOptions[this.selectedOption][2] - 0.06) * canvas.height;
        let size = this.optionsSelecterSize * canvas.height;
        ctx.fillStyle = "red";
        ctx.fillRect(x, y, size, size);
    }

    changeSelecterOption(change) {
        // change will either be +1 or -1 based on if the down or up arrow key is pressed
        this.selectedOption = (this.selectedOption + change) % this.optionCount;

        // If selectedOption becomes negative (can only go as far as -1 since change = +-1)
        // then it gets looped round to the end of the range
        if (this.selectedOption < 0) {
            this.selectedOption += this.optionCount;
        }
        // Clear just the part of the canvas with the options selecter and then redraw
        ctx.clearRect(0, 0, this.optionsX * canvas.width, canvas.height);
        this.displayOptionSelecter();
    }

    handleKeysPressed() {
        let keyCount = this.keysPressed.length;
        for (let i = keyCount - 1; i >= 0; i--) {
            if (this.controls.includes(this.keysPressed[i])) {
                // If up arrow key is pressed, move up one option
                if (this.keysPressed[i] == 'ArrowUp') {
                    this.changeSelecterOption(-1);
                }
                // If down arrow key is pressed, move down one option
                else if (this.keysPressed[i] == 'ArrowDown') {
                    this.changeSelecterOption(1);
                }
                // If enter is pressed, select current option
                else if (this.keysPressed[i] == 'Enter') {
                    this.selectOption();
                }
                // Key has been processed so it is removed from keysPressed
                this.keysPressed.splice(i, 1);
            }
        }
    }

    selectOption() {
        // Gets the option selected as Menu.Options element and changes game state accordingly
        let option = Menu.Options[this.optionKeys[this.selectedOption]];
        if (option == Menu.Options.PLAY) {
            this.game.changeState(Game.States.PLAY);
        }
        else if (option == Menu.Options.TUTORIAL) {
            this.game.changeState(Game.States.TUTORIAL);
        }
    }

    onStart() {
        this.displayMenuOptions();
        this.displayOptionSelecter();
    }

    main() {
        // Processes actions for any keys that are being pressed by the user
        this.handleKeysPressed();
    }
}

class Star {
    static maxRadius = 2;
    static minRadius = 1;
    constructor() {
        this.x = Math.round(Math.random() * canvas.width);
        this.y = Math.round(Math.random() * canvas.height);
        if (Math.round(Math.random() * 5) > 4) {
            this.radius = 2;
        }
        else {
            this.radius = 1;
        }
    }

    draw() {
        // Draws circle
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
}

class Game {
    static States = {
        MENU: 0,
        PLAY: 1,
        GAME_OVER_SCREEN: 2,
        TUTORIAL: 3
    }

    constructor() {
        this.player = new Spaceship(this);
        this.asteroids = [];
        /*
         * controls contains all the keys to be used in the game
         * keysPressed contains all keys from controls that currently being pressed
         * this.input handles adding and removing keys upon key press
         */
        this.controls = ['ArrowUp', 'ArrowLeft', 'ArrowRight', 'Escape', 'Enter'];
        this.keysPressed = [];
        this.input = new inputHandler(this);
        this.menu = new Menu(this);
        this.setGameSettings();
        this.changeState(Game.States.MENU);
        this.update();
    }

    getBackground() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.starCount = Math.max(1000, Math.round(Math.random() * 2000));
        for (let i = 0; i < this.starCount; i++) {
            new Star().draw();
        }
        this.background = new Image();
        this.background.src = canvas.toDataURL();
    }

    newGame() {
        // Called right before a game starts
        // Resets all relevant variables ready for new game
        this.score = 0;
        this.player = new Spaceship(this);
        this.asteroids = [];
        ctx.fillStyle = "red";
        this.startTime = performance.now();
        this.getBackground();
    }

    setGameSettings() {
        // Asteroid settings
        this.minSpeed = 0.0006 * canvas.height;
        this.maxSpeed = 0.004 * canvas.height;
        this.minRadius = 0.08 * canvas.height;
        this.maxRadius = 0.12 * canvas.height;
        this.maxAngularSpeed = 0.03;
        this.minAsteroidCount = 10;
        this.maxAsteroidCount = 15;
        // Percent chance per frame to spawn an asteroid if number of asteroids is between
        // minimum and maximum allowed.
        // Note: a bit redundant, a better way should be thought of...
        this.asteroidSpawnPercentChance = 5;

        // Player settings
        this.playerTurnAcceleration = 0.05;
        this.playerAcceleration = 0.00008 * canvas.height;
    }

    checkIntersectionInRange(intersectionPoint, point1, point2) {
        // Checks that an intersection point lies on a line segment where
        // point1 and point2 are the start and end points of the line segment
        // Order of point1 and point2 does not matter
        if (between(intersectionPoint[0], point1[0], point2[0])) {
            if (between(intersectionPoint[1], point1[1], point2[1])) {
                return true;
            }
        }
        return false;
    }

    checkPlayerCollide(asteroidIndex) {
        // asteroidIndex is the index of the asteroid to be checked whether or 
        // not it has collided with player.
        let asteroid = this.asteroids[asteroidIndex];
        let asteroidCircleInfo = [asteroid.x, asteroid.y, asteroid.radius];

        // for each side of the player spaceship
        for (let i = 0; i < 3; i++) {
            // Gets the intersection points between the straight line of which the triangle
            // side is a segment of, and the asteroid circle.
            let intersectionPoints = getIntersectionsLineCircle(this.playerEqList[i], asteroidCircleInfo);
            
            // If the line does intersect with the circle
            if (intersectionPoints != false) {
                let point1 = this.player.vertices[i];
                let point2 = this.player.vertices[(i + 1) % 3];

                // For each intersection point, (there will always be two as 
                // determinant = 0 solutions are disregarded, see get getIntersectionsLineCircle)
                // check if the intersection point lies on the side of the spaceship 
                // If so then there is a collision so return true.
                for (let j = 0; j < 2; j++) {
                    // check that the intersection between the equation of the side of the spaceship
                    // and the equation of the asteroid
                    // lies in the range of the side of the spaceship, i.e. did they actually collide
                    if (this.checkIntersectionInRange(intersectionPoints[j], point1, point2)) {
                        return true;
                    }
                }
            }
        }
        // If no collisions return false
        return false;
    }

    endGame() {
        // Upon game ending get the players score and change state to game over screen.
        // Score is the players time lasted in seconds multiplied by 1000 and is an int.
        this.score = Math.round(performance.now() - this.startTime);
        this.changeState(Game.States.GAME_OVER_SCREEN);
    }

    checkCollisions() {
        // Get the equations for each line of the triangle of the player's spaceship
        // Element of the list are [m, c] from the equation of a straight line y = mx + c
        this.playerEqList = this.player.getLineEquations();
        let asteroidCount = this.asteroids.length;

        // For each asteroid, if player collides with it then return true
        for (let i = 0; i < asteroidCount; i++) {
            if (this.checkPlayerCollide(i)) {
                return true;
            }
        }
        // If no collisions return false
        return false;
    }

    changeState(state) {
        // Changes current state and runs appropriate startup function
        this.currentState = state;
        if (this.currentState == Game.States.PLAY) {
            canvas.style.background = "black";
            this.newGame();
        }
        else if (this.currentState == Game.States.MENU) {
            canvas.style.background = "#888";
            ctx.font = bigFont;
            this.menu.onStart();
        }
        else if (this.currentState == Game.States.GAME_OVER_SCREEN) {
            ctx.font = mediumFont;
            this.setupGameOverScreen();
        }
        else if (this.currentState == Game.States.TUTORIAL) {
            ctx.font = smallFont;
            this.player = new Spaceship(this);
        }
    }

    setupGameOverScreen() {
        // Displays a grey rectangle upon which text appropriate game over text is displayed
        // including the player's score and how to play again or go to the main menu
        let x = 0.29;
        let instructionMessage1 = "Press escape to return to menu";
        let instructionMessage2 = "Press enter to play again";
        let textWidth = (ctx.measureText(instructionMessage1).width / canvas.width) + 0.02;
        ctx.fillStyle = "#a8a8a8";
        displayRect(x, 0.24, textWidth, 0.42);
        ctx.fillStyle = "black";
        displayText(["Game Over", x, 0.3]);
        displayText(["Score: " + this.score.toLocaleString(), x, 0.4]);
        displayText([instructionMessage1, x, 0.5])
        displayText([instructionMessage2, x, 0.6])
    }
    
    updateAsteroids() {
        // Updates all asteroids
        // Asteroid.update() returns true if the asteroid has gone out of bounds 
        // and needs to be removed from the asteroid list.
        let remove = false;
        let asteroidCount = this.asteroids.length;
        for (let i = asteroidCount - 1; i >= 0; i--) {
            remove = this.asteroids[i].update();
            if (remove) {
                this.asteroids.splice(i, 1);
            }
        }
    }
    
    spawnAsteroid() {
        // Spawns a new asteroid and appends it to this.asteroids
        let newAsteroid = new Asteroid(this);
        this.asteroids.push(newAsteroid);
    }

    spawnAsteroids() {
        let spawn = false;
        // If the amount of asteroids is below the minimum, spawn an asteroid
        if (this.asteroids.length < this.minAsteroidCount) {
            spawn = true;
        }

        // If the amount of asteroids is below the maximum, give a chance to spawn one
        else if (this.asteroids.length < this.maxAsteroidCount) {
            if (Math.random() * 100 < this.asteroidSpawnPercentChance) {
                spawn = true;
            }
        }

        if (spawn) {
            this.spawnAsteroid();
        }
    }

    checkGameOver() {
        // If player collides with asteroid or goes out of bounds then the game is over
        if (this.checkCollisions() || this.player.checkOutOfBounds()) {
            return true;
        }
    }

    play() {
        // play() is the main game loop that is continuously called from Game.update()
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(this.background, 0, 0, canvas.width, canvas.height);
        this.updateAsteroids();
        this.spawnAsteroids();
        this.player.update();
        if (this.checkGameOver()) {
            this.endGame();
        }
        // Check if escape has been pressed to return to menu
        this.handleKeysPressed();
    }

    handleKeysPressed() {
        /*
         * Called from PLAY, GAME_OVER_SCREEN and TUTORIAL
         * Pressing escape will take the player back to the main menu
         * Pressing enter from the game over screen will start a new game
         */
        let keyCount = this.keysPressed.length;
        for (let i = keyCount - 1; i >= 0; i--) {
            if (this.keysPressed[i] == 'Escape') {
                this.keysPressed.splice(i, 1);
                this.changeState(Game.States.MENU);
            }
            else if (this.keysPressed[i] == 'Enter' && this.currentState == Game.States.GAME_OVER_SCREEN) {
                this.keysPressed.splice(i, 1);
                this.changeState(Game.States.PLAY);
            }
        }
    }

    displayTutorialText() {
        // Displays the tutorial text below in info1-4
        ctx.fillStyle = "black";
        let x = 0.01;
        let y = 0.1;
        let yDifference = 0.07;
        let info1 = "To accelerate the player forwards, press the up arrow key";
        let info2 = "To change the angular velocity, press the left and right arrow keys";
        let info3 = "Advice: try just gently tapping the keys first to see how it works";
        let info4 = "Press escape to exit";
        displayText([info1, x, 0.1])
        displayText([info2, x, y + yDifference])
        displayText([info3, x, y + yDifference * 2])
        displayText([info4, x, 0.9]);
        ctx.fillStyle = "red";
    }

    tutorial() {
        // In the tutorial the player can control the ship on an empty canvas with no
        // asteroids.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.displayTutorialText();
        this.player.update();
        if (this.player.checkOutOfBounds()) {
            this.player = new Spaceship(this);
        }
        this.handleKeysPressed();
    }

    update() {
        if (this.currentState == Game.States.MENU) {
            this.menu.main();
        }
        else if (this.currentState == Game.States.PLAY) {
            this.play();
        }
        else if (this.currentState == Game.States.GAME_OVER_SCREEN) {
            this.handleKeysPressed();
        }
        else if (this.currentState == Game.States.TUTORIAL) {
            this.tutorial();
        }
        requestAnimationFrame(this.update.bind(this));
    }
}

class CircularImage {
    constructor(imagePath, x, y, radius, diameter) {
        this.imagePath = imagePath;
        this.x = x;
        this.y = y;
        this.radius = radius
        this.diameter = diameter
    }
}

function drawCircularImage(circularImage, angle) {
    // Displays an image inside a circle at a rotation of angle
    let img = document.createElement('img');
    img.src = circularImage.imagePath;

    ctx.translate(circularImage.x, circularImage.y);

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, circularImage.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.rotate(angle);

    ctx.drawImage(img, -circularImage.radius, -circularImage.radius, circularImage.diameter, circularImage.diameter);

    ctx.rotate(-angle);
    ctx.beginPath();
    ctx.arc(circularImage.radius, circularImage.radius, circularImage.radius, 0, Math.PI * 2, true);
    ctx.clip();
    ctx.closePath();
    ctx.restore();

    ctx.translate(-circularImage.x, -circularImage.y);
}

class Asteroid {
    // Spawnsides is used to make life easier when spawning an asteroid
    static SpawnSides = {
        Top: 0,
        Bottom: 1,
        Left: 2,
        Right: 3
    }
    static imageLocation = getImagePath("asteroid1.png"); // Save asteroid image loc

    constructor (game) {
        this.game = game;
        this.radius = Math.max(this.game.minRadius, Math.random() * this.game.maxRadius);
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
        if (sideOfSpawn == Asteroid.SpawnSides.Bottom || sideOfSpawn == Asteroid.SpawnSides.Top) {
            if (sideOfSpawn == Asteroid.SpawnSides.Bottom) {
                this.y = canvas.height + this.radius;
                yDirection = -1;
            }
            else if (sideOfSpawn == Asteroid.SpawnSides.Top) {
                this.y = -1 * this.radius;
                yDirection = 1;
            }
            this.x = Math.random() * (canvas.width + this.diameter);
            xDirection = Math.round(Math.random()) * 2 - 1;
        }
        else {
            if (sideOfSpawn == Asteroid.SpawnSides.Left) {
                this.x = -1 * this.radius;
                xDirection = 1;
            }
            else if (sideOfSpawn == Asteroid.SpawnSides.Right) {
                this.x = canvas.width + this.radius;
                xDirection = -1;
            }
            this.y = Math.random() * (canvas.height + this.diameter);
            yDirection = Math.round(Math.random()) * 2 - 1;
        }

        this.xVelocity = Math.max(Math.random() * this.game.maxSpeed, this.game.minSpeed) * xDirection;
        this.yVelocity = Math.max(Math.random() * this.game.maxSpeed, this.game.minSpeed) * yDirection;
        this.angularVelocity = Math.random() * this.game.maxAngularSpeed * ((Math.round(Math.random()) * 2) - 1);
        this.angle = 0;
    }

    isOffScreen() {
        // Checks that the asteroid has gone off screen
        if (this.x - this.radius > canvas.width || this.x + this.radius < 0 || this.y - this.radius > canvas.height || this.y + this.radius < 0) {
            return true;
        }
        return false;
    }

    drawImage() {
        // Renders asteroid
        this.asteroidImage = new CircularImage(Asteroid.imageLocation, this.x, this.y, this.radius, this.diameter);
        drawCircularImage(this.asteroidImage, this.angle);
    }

    update() {
        // Updates position, renders asteroid and returns whether asteroid is off screen or not
        this.x += this.xVelocity;
        this.y += this.yVelocity;
        this.angle += this.angularVelocity;
        this.drawImage();
        return this.isOffScreen();
    }
}

class Spaceship {
    constructor(game) {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        /* 
         * The spaceship is an iscosceles triangle, so baseAngle is the angle
         * of the two base angles.
         * 
         * Note: for an iscosceles triangle with base width a, and height h,
         * and imagining that the bottom left vertex is (0, 0),
         * then the centre of mass is (a/2) * (1, tan (baseAngle / 2)).
         * This is where this.x, this.y is.
         * 
         * Height is determined from canvas height and so width must be then determined
         * from height and the base angle.
         */
        this.game = game;
        this.baseAngle = 70;
        this.height = 0.1 * canvas.height;
        this.xVelocity = 0;
        this.yVelocity = 0;
        // angularVelocity is the rate and direction at which the spaceship is spinning
        this.angularVelocity = 0;
        this.width = (2 * this.height) / Math.tan(radians(this.baseAngle));
        this.rotationAngle = 180;
        this.getVertices();
    }

    checkOutOfBounds() {
        // Checks each vertex to see if it is out of bounds and returns appropriate boolean
        for (let i = 0; i < 3; i++) {
            if (!between(this.vertices[i][0], 0, canvas.width) || !between(this.vertices[i][1], 0, canvas.height)) {
                return true;
            }
        }
        return false;
    }

    getVertices() {
        this.vertices = [];
        /*
         * The following equations for the 3 vertices were derived with the following setup:
         * Representing: baseAngle as theta, rotationAngle as phi, width as a 
         * and height as h.
         * Phi = 180 implies that the spaceship is pointing upwards
         */
        let tanThetaOver2 = Math.tan(radians(this.baseAngle / 2));
        let tanTheta = Math.tan(radians(this.baseAngle));
        let sinPhi = Math.sin(radians(this.rotationAngle));
        let cosPhi = Math.cos(radians(this.rotationAngle));
        let aOver2 = this.width / 2;
        let vertexA = [this.x + aOver2 * (sinPhi * tanThetaOver2 - cosPhi), this.y + aOver2 * (-1 * cosPhi * tanThetaOver2 - sinPhi)];
        let vertexB = [this.x + aOver2 * (cosPhi + sinPhi * tanThetaOver2), this.y + aOver2 * (sinPhi - cosPhi * tanThetaOver2)];
        let vertexC = [this.x + aOver2 * sinPhi * (tanThetaOver2 - tanTheta), this.y + aOver2 * cosPhi * (tanTheta - tanThetaOver2)];
        this.vertices.push(vertexA);
        this.vertices.push(vertexB);
        this.vertices.push(vertexC);
    }

    getLineEquations() {
        /*
         * eqList contains elements in the form [m, c] where m and c are
         * the corresponding values in the equation for a straight line y = mx + c.
         * eqList[0] is line from vertexA -> vertexB
         * eqList[1] is line from vertexB -> vertexC
         * eqList[2] is line from vertexC -> vertexA
         */
        let eqList = [];
        for (let i = 0; i < 3; i++) {
            eqList.push(getLineMC(this.vertices[i], this.vertices[(i + 1) % 3]));
        }
        return eqList;
    }

    handleKeysPressed() {
        // Handles spaceship movement according to arrow keys
        // Left and right change spaceship angular velocity, up changes x and y velocity
        let keyCount = this.game.keysPressed.length;
        for (let i = 0; i < keyCount; i++) {
            if (this.game.keysPressed[i] == 'ArrowLeft') {
                this.angularVelocity -= this.game.playerTurnAcceleration;
            }
            else if (this.game.keysPressed[i] == 'ArrowRight') {
                this.angularVelocity += this.game.playerTurnAcceleration;
            }
            else if (this.game.keysPressed[i] == 'ArrowUp') {
                // Accelerates spaceship in the direction it is pointing
                this.xVelocity += -1 * Math.sin(radians(this.rotationAngle)) * this.game.playerAcceleration;
                this.yVelocity += Math.cos(radians(this.rotationAngle)) * this.game.playerAcceleration;
            }
        }
    }

    move() {
        // Moves and turns spaceship according to current velocities
        this.x += this.xVelocity;
        this.y += this.yVelocity;
        this.rotationAngle += this.angularVelocity;
    }

    draw() {
        // Draws the triangle representing the spaceship.
        ctx.fillStyle = "red";
        this.getVertices();
        let path = new Path2D();
        path.moveTo(this.vertices[0][0], this.vertices[0][1]);
        path.lineTo(this.vertices[1][0], this.vertices[1][1]);
        path.lineTo(this.vertices[2][0], this.vertices[2][1]);
        ctx.fill(path);
    }
    
    update() {
        // Updates spaceship
        this.handleKeysPressed();
        this.move();
        this.draw();
    }
}

function displayRect(x, y, w, h) {
    // x, y, w and h are proportions of the canvas width or height and so
    // displayRect draws a rect accordingly by multiplying each component by respective value
    ctx.fillRect(x * canvas.width, y * canvas.height, w * canvas.width, h * canvas.height);
}

function displayText([text, x, y]) {
    // displays text at a proportion of the way along the canvas according to x, y
    ctx.fillText(text, x * canvas.width, y * canvas.height);
}

function getIntersectionsLineCircle([m, c], [x0, y0, r]) {
    /*
     * Checks if a line with equation:
     *      y = mx + c          (1)
     * 
     * intersects with a circle with equation:
     *      (x - x0)^2 + (y - y0)^2 = r^2     (2)
     * 
     * and returns the intersection point.
     * 
     * a, b and C are the coefficient of quadratic equation formed 
     * from the intersection of (1) and (2):
     *      x^2(1 + m^2) + x(2m(c - y0) - 2x0) + (x0^2 + (c - y0)^2 - r^2) = 0
     * 
     * Capital C is used here as c is already in use.
     */
    let a = (1 + m ** 2);
    let b = (2 * m) * (c - y0) - 2 * x0;
    let C = x0 ** 2 + (c - y0) ** 2 - r ** 2;
    let determinant = (b ** 2) - (4 * a * C);

    // When the determinant of a quadratic is negative, there are no solutions.
    // Determinant of 0 would mean that the circle and the line are touching but not 
    // intersecting and I decided for this that I would not include these solutions as crashes.
    if (determinant <= 0) { 
        return false;
    }
    let x1 = ((-1 * b) + Math.sqrt(determinant)) / (2 * a);
    let x2 = ((-1 * b) - Math.sqrt(determinant)) / (2 * a);
    let y1 = m * x1 + c;
    let y2 = m * x2 + c;
    
    return [[x1, y1], [x2, y2]];

}

function getLineMC(point1, point2) {
    // Gets the gradient and y intercept of a straight line y = mx + c by:
    // m = (y1 - y2) / (x1 - x2)
    // c = y - mx
    let m = (point1[1] - point2[1]) / (point1[0] - point2[0]);
    let c = point1[1] - m * point1[0];
    return [m, c];
}

function between(x, a, b) {
    // Checks if the number x is between a and b.
    // a and b can be in any order. i.e. between(10, 15, 5) is True
    if (x >= Math.min(a, b) && x <= Math.max(a, b)) {
        return true;
    }
    return false;
}

function radians(angle) {
    // Takes an angle in degrees and returns it in radians
    return angle * (Math.PI / 180);
}

let game = new Game();