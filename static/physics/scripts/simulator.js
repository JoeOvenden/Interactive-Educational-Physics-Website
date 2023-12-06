const canvas = document.getElementById("simulator-canvas");

// Smaller version of the simulator are used in the lesson pages
let isFullSimulator = window.location.pathname.split("/").pop() == "simulator";

const Surface = {
    None: -1,
    Floor: 0,
    Ceiling: 1
}

const Sides = {
    Bottom: 0,
    Top: 1,
    Left: 2,
    Right: 3
}

const gravityValues = {
    emptySpace: 0,
    moon: 1.62,
    mercury: 3.71,
    venus: 8.87,
    uranus: 9,
    earth: 9.81,
    saturn: 10.44,
    neptune: 11.15,
    jupiter: 24.79
}

const fluidDensities = {
    /*
     * The planets here are really referring to the planets atmosphere
     * They have been named as such so that the html can match the gravity of say,
     * jupiter, with the atmosphere density In kgm-3
     */
    emptySpace: 0,
    earth: 1.23,
    water: 997,
    moon: 0,
    mercury: 0,
    venus: 67,
    uranus: 0.45,
    earth: 1.23,
    saturn: 0.13,
    neptune: 1.64,
    jupiter: 0.16
}

const waterColour = "#d4f1f9";  // Colour for when water is selected as fluid

const planetAtmosphereDensities = {
    // In kgm-3
    emptySpace: 0,
    earth: 1.23,
    moon: 0,
    mercury: 0,
    venus: 67,
    uranus: 0.45,
    earth: 1.23,
    saturn: 0.13,
    neptune: 1.64,
    jupiter: 0.16
}

const materialDensities = {
    // In kgm-3
    cork: 240,
    ice: 900,
    woodYew: 670,
    water: 997,
    concrete: 2400,
    titanium: 4540,
    steel: 7850,
    iron: 10000,
    gold: 19300
}

// Buttons and zoom slider
pauseButton = document.getElementById("pauseButton");
resetButton = document.getElementById("resetButton");
clearChartButton = document.getElementById("clearChartButton");
setHeightButton = document.getElementById("setHeightButton");
setHeightInput = document.getElementById("setHeightInput");
zoomSlider = document.getElementById("zoomSlider");



/*
 * Links the slider and textbox, and also the selecter element if applicable.
 * Whenevever the slider value is changed, the textbox value is set to the same value
 * and vice verca.
 * Changing the value of the slider or textbox also clears the selecter.
 * Changing the selecter value then (provided it is a valid selection), sets the slider
 * and textbox value appropriately.
 */
function link(slider, textbox, values = null, selecter = null) {
    if (slider != null) {
        slider.addEventListener("change", function() {
            textbox.value = slider.value;
            if (selecter != null) {
                selecter.value = null;
            }
        });
        textbox.addEventListener("change", function() {
            slider.value = textbox.value;
            if (selecter != null) {
                selecter.value = null;
            }
        });
        if (selecter != null) {
            selecter.addEventListener("change", function() {
                if (values[selecter.value] != undefined) {
                    slider.value = values[selecter.value];
                    textbox.value = values[selecter.value];
                }
            })
        }
    }
}

/*
 * These are all of the html elements that the user can use to change the value of
 * physics constants in the program or other settings.
 */
const gravitySlider = document.getElementById("g-slider");
const gravityTextbox = document.getElementById("g-text");
const gravitySelecter = document.getElementById("g-selector");
const fluidSlider = document.getElementById("fluid-density-slider");
const fluidTextbox = document.getElementById("fluid-density-text");
const fluidSelecter = document.getElementById("fluid-density-selecter");
const materialSlider = document.getElementById("material-density-slider");
const materialTextbox = document.getElementById("material-density-text");
const materialSelecter = document.getElementById("material-density-selecter");
const frictionSlider = document.getElementById("friction-slider");
const frictionTextbox = document.getElementById("friction-text");
const energyLostSlider = document.getElementById("energy-lost-slider");
const energyLostTextbox = document.getElementById("energy-lost-text");
const ballRadiusSlider = document.getElementById("ball-radius-slider");
const ballRadiusTextbox = document.getElementById("ball-radius-text");
const ceilingBounceCheckbox = document.getElementById("ceiling-bounce");
const pauseOnSurfaceCheckbox = document.getElementById("pauseOnSurfaceCheckbox");
const resetWhenSetHeightCheckbox = document.getElementById("resetWhenSetHeightCheckbox");

/*
 * All elements pertaining to the same constant are linked together;
 * changing one will change the others.
 */
link(gravitySlider, gravityTextbox, gravityValues, gravitySelecter);
link(fluidSlider, fluidTextbox, fluidDensities, fluidSelecter);
link(materialSlider, materialTextbox, materialDensities, materialSelecter);
link(frictionSlider, frictionTextbox);
link(energyLostSlider, energyLostTextbox);
link(ballRadiusSlider, ballRadiusTextbox);

/*
 * Links the gravity selecter and the fluid selecter so that when a planet is chosen, 
 * the fluid selecter then gets set to the appropriate planet atmosphere
 * i.e. chosing Planet = Jupiter now changes gravity and fluid density accordingly.
 * This is only for the full simulator
 */

if (isFullSimulator) {
    gravitySelecter.addEventListener("change", function() {
        fluidSelecter.value = gravitySelecter.value;
        fluidTextbox.value = planetAtmosphereDensities[fluidSelecter.value];
        fluidSlider.value = planetAtmosphereDensities[fluidSelecter.value];
    });
}

// Span elements containing data
const zoomSpan = document.getElementById("zoomSpan");
const xCoordSpan = document.getElementById("xCoordinate");
const yCoordSpan = document.getElementById("yCoordinate");
const xVelocitySpan = document.getElementById("xVelocity");
const yVelocitySpan = document.getElementById("yVelocity");
const massSpan = document.getElementById("ballMass");
const densitySpan = document.getElementById("ballDensity");
const volumeSpan = document.getElementById("ballVolume");
const timeSinceResetSpan = document.getElementById("timeSinceReset");

const maxDataPointsTextbox = document.getElementById("chartMaxDataPoints");
const limitChartCheckbox = document.getElementById("limitChartCheckbox");

// Sets up canvas chart
if (isFullSimulator) {
    displayData = true;

    window.onload = function () {
        window.chart = new CanvasJS.Chart("chartContainer",
        {
        title:{
        text: "Ball y velocity over time"
        },
        data: [
        {
            type: "line",

            dataPoints: [
            ]
        }
        ]
        });
        chart.render();
    }
}

let ctx = canvas.getContext("2d");
ctx.lineWidth = 2;                  // Width of the outline of the ball.

let windowHeight = window.innerHeight;
let windowWidth = window.innerWidth;
let navbarHeight = document.getElementById("navbar").offsetHeight;

canvas.width = windowWidth - 20;
canvas.height = windowHeight - navbarHeight - 150;
canvas.style.background = "white";


// Returns mouse position on canvas as a dict
function getMousePos(event) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

// Class for adding event listeners to window and html elements
class inputHandler {
    constructor(sim) {
        this.sim = sim;
        // On mousedown a ball is grabbed if applicable
        window.addEventListener('mousedown', function(e) {
            let mousePos = getMousePos(e);
            this.sim.grabBall(mousePos);           
        });

        // Releases any ball that is being held
        window.addEventListener('mouseup', function(e) {
            this.sim.releaseBall();
        });

        // Stores mousePos in Simulation object
        window.addEventListener('mousemove', function(e) {
            let mousePos = getMousePos(e);
            this.sim.storeMousePos(mousePos);     
        });

        // The following event listeners are for the buttons that occur only in the
        // full simulator.
        if (!isFullSimulator) {
            return;
        }

        // Pause/unpause the simulation the simulation
        pauseButton.addEventListener("click", () => {
            this.sim.togglePause();
        });
        
        // Resets the simulations
        resetButton.addEventListener("click", () => {
            this.sim.reset();
        });

        // Sets the ball to the height the user has chosen
        setHeightButton.addEventListener("click", () => {
            if (resetWhenSetHeightCheckbox.checked) {
                this.sim.reset();
            }
            this.sim.ball.setHeight(setHeightInput.value);
            this.sim.updateData();
        });

        // Clears the chart of all data points
        clearChartButton.addEventListener("click", () => {
            this.sim.resetData();
        });
    }
}

class Ball {
    constructor(x, y, radius, sim) {
        // Radius, mass, density and volume all use SI units, i.e.
        // Radius - metres, mass - kg, density - kg/m3, volume - m3
        this.density = 7850;
        this.sim = sim;
        this.setRadius(radius);
        this.reset();              // Initialises/resets a number of variables
        // When the ball is grabbed by the user, this.previousLocations stores 
        // a number of [x, y] coordinates to then calculate velocity upon release.
        this.previousLocations = [];
        this.previousSurfaces = [];
        this.previousSurfaceCount = 10;
        this.lastUpdate = time();
    }

    reset() {
        this.x = this.sim.metresToPixels(this.sim.pixelsToMetres(canvas.width) / 2);
        this.y = this.sim.metresToPixels(this.sim.pixelsToMetres(canvas.height) / 2);
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.oldXVelocity = 0;
        this.oldYVelocity = 0;
        // accelX and Y are only used to display data to the chart, they are not used
        // in any calculations.
        this.accelX = 0;
        this.accelY = 0;
        this.resultantForceY = 0;
        this.setOnSurface(Surface.None);
        this.grabbed = false;           // True if ball is grabbed by user
    }

    setRadius(radiusMetres, constantProperty = "density") {
        /*
         * radiusPixels and metres is the radius of the ball measures in pixels
         * and metres respectively.
         * volume, crossSectionalArea, mass and density are all in SI units (e.g. metres cubed)
         * 
         * When setting the radius, the default is that the density stays constant
         * and the mass is recalculated, but this can be changed to be the other way
         * round by the user.
         */
        this.radiusPixels = this.sim.metresToPixels(radiusMetres);
        this.radiusMetres = radiusMetres;
        this.volume = ((4/3) * Math.PI * this.radiusMetres ** 3);
        this.crossSectionalArea = (this.radiusMetres ** 2) * Math.PI;
        if (constantProperty == "density") {
            this.calculateMass();
        }
        else if (constantProperty == "mass") {
            this.calculateDensity();
        }
        // Recalculte the mass of displaced fluid used for calculating buoyancy.
        this.calculateDisplacedFluid();
        this.setOnSurface(Surface.None);
    }

    calculateDensity() {
        // Calculate density and then also change the information displayed to match
        this.density = this.mass / this.volume;
        let rounded = Number(this.density.toPrecision(4));
        materialTextbox.value = rounded;
        materialSlider.value = rounded;
        materialSelecter.value = null;
        this.setOnSurface(Surface.None);
    }

    setDensity(value) {
        // Setting the density requires recalculating mass so it calls calculateMass
        this.density = parseFloat(value);
        this.calculateMass();
    }

    setHeight(value) {
        if (isNaN(value)) {
            return;
        }
        this.y = this.getCanvasY(value);    // Converts displayed value to canvas value
        this.yVelocity = 0;
        this.xVelocity = 0;
        this.setOnSurface(Surface.None);
        clearCanvas();
        this.draw();
    }

    calculateMass() {
        this.mass = this.density * this.volume;
    }

    calculateDisplacedFluid() {
        // Calculates mass of displaced fluid used for calculating buoyancy
        this.massOfDisplacedFluid = this.volume * this.sim.fluidDensity;
    }

    getDisplayX() {
        // Returns the balls distance from the left wall in metres
        return Math.round(this.sim.pixelsToMetres(this.x - this.radiusPixels) * 1000) / 1000;
    }

    getHeightAboveFloor() {
        // Returns the ball's height above the floor in metres
        return this.sim.pixelsToMetres(canvas.height - this.radiusPixels - this.y);
    }

    getDisplayY() {
        // Returns the ball's rounded height above the floor in metres
        return Math.round(this.getHeightAboveFloor() * 1000) / 1000;
    }

    getCanvasY(value) {
        // Takes a value measuring the the ball's height above the ground in metres and returns a value 
        // measuring the distance from the top of the canvas to the centre of the ball in pixels.
        return this.sim.metresToPixels(-value) - this.radiusPixels + canvas.height;
    }

    getDisplayVelocityX() {
        // Returns the ball's rounded x velocity in metres
        return Math.round(this.xVelocity * 1000) / 1000;
    }

    getDisplayVelocityY() {
        // Returns the balls rounded y velocity in metres
        return -Math.round(this.yVelocity * 1000) / 1000;
    }

    getDisplayAccelerationX() {
        // returns the balls rounded x acceleration in metres per second squared.
        return Math.round(this.accelX * 1000) / 1000;
    }

    getDisplayAccelerationY() {
        // Returns the balls rounded y acceleration in metres per second squared.
        return -Math.round(this.accelY * 1000) / 1000;
    }

    getEnergy() {
        // Returns the balls energy in joules
        return this.getKineticEnergy() + this.getGravitationalEnergy();
    }

    getKineticEnergy() {
        // Returns the ball's kinetic energy in joules
        let speed = Math.sqrt((this.yVelocity ** 2) + (this.xVelocity ** 2));
        return 0.5 * this.mass * (speed ** 2);
    }

    getGravitationalEnergy() {
        // Returns the ball's gravitational potential energy in joules
        return this.mass * this.sim.g * this.getHeightAboveFloor();
    }

    getSurfacePositionedAt() {
        // If the ball's distance from a surface is smaller than a certain vcalue
        // then that surface will be returned. Otherwise Surface.None

        // If the ball is positioned on the floor
        if (this.sim.pixelsToMetres(Math.abs(this.y - canvas.height + this.radiusPixels)) < 0.01) {
            return Surface.Floor;
        }
        // If the ball is positioned on the ceiling and the ceiling is a boundary
        if (this.sim.pixelsToMetres(Math.abs(this.y - this.radiusPixels)) < 0.01 && this.sim.bounceOnCeiling == true) {
            return Surface.Ceiling;
        }
        return Surface.None;
    }

    setZoom(zoomMultiplier) {
        // Recalculates radius, and position of the ball in pixels after zoom has been changed
        let heightAboveFloor = (canvas.height - this.y - this.radiusPixels) * zoomMultiplier;
        let distanceFromWall = (this.x - this.radiusPixels) * zoomMultiplier;
        this.radiusPixels = this.sim.metresToPixels(this.radiusMetres);
        this.y = canvas.height - heightAboveFloor - this.radiusPixels;
        this.x = distanceFromWall + this.radiusPixels;
        // If the ball is at rest on the ceiling, zooming out should cause the ball to float up.
        // Therefore the ball cannot be attached to a surface.
        this.setOnSurface(Surface.None);
    }

    release() {
        // Releases ball from being held by user
        this.grabbed = false;
        /*
         * Sets ball velocity based on how far the ball has been dragged in the last
         * {count} frames
         * The distance needs to be divided ideally by the framerate so we use
         * 60 as that is the default rate at which requestAnimationFrame runs at.
         */
        let count = this.previousLocations.length;
        let FPS = 60;
        if (count == 0) {
            this.xVelocity = 0;
            this.yVelocity = 0;
            return;
        }
        let xDistance = this.previousLocations[count - 1][0] - this.previousLocations[0][0];
        let yDistance = this.previousLocations[count - 1][1] - this.previousLocations[0][1];
        this.xVelocity = this.sim.pixelsToMetres(xDistance * FPS / count);
        this.yVelocity = this.sim.pixelsToMetres(yDistance * FPS / count);
        this.previousLocations = [];
    }

    checkGrab(mousePos) {
        // If the mouse is inside the ball, the ball is grabbed and follows the mouse position.
        if (distance([this.x, this.y], [mousePos.x, mousePos.y]) < this.radiusPixels) {
            this.grabbed = true;
            this.xVelocity = 0;
            this.yVelocity = 0;
            this.setOnSurface(Surface.None);
        }
        return this.grabbed;
    }

    applyBounce(velocity) {
        /*
         * Leaves the ball with a fraction of the kinetic energy according to the value
         * of this.sim.energyRemainingOnBounce
         * Direction fo velocity is reversed.
         */
        let direction = Math.sign(velocity);
        let energy = 0.5 * (velocity ** 2) * this.mass;
        energy *= this.sim.energyRemainingOnBounce
        velocity = Math.sqrt((2 * energy) / this.mass) * direction * -1;
        return velocity;
    }

    bounceX() {
        // If ball hits a vertical wall then the x coordinate is set so the ball doesn't
        // actually enter the wall, and it then bounces in the opposite direction
        // according to applyBounce()
        if (this.x + this.radiusPixels > canvas.width) {
            if (this.xVelocity > 0) {
                this.xVelocity = this.applyBounce(this.xVelocity);
            }
            this.setSide(Sides.Right);
        }
        else if (this.x - this.radiusPixels < 0) {
            if (this.xVelocity < 0) {
                this.xVelocity = this.applyBounce(this.xVelocity);
            }
            this.setSide(Sides.Left);
        }
    }

    removeFromSurface(surface) {
        /*
         * Removes the ball from a surface, placing it just touching the surface
         * and takes away the appropriate amount of energy
         * I.e. We gave the ball gravitational energy so we must take away the same amount
         * as kinetic energy
        */
        if (surface == Surface.None) {
            return;
        }

        let height = 0;
        if (surface == Surface.Floor && this.y > canvas.height - this.radiusPixels) {
            height = this.sim.pixelsToMetres(this.y - canvas.height + this.radiusPixels);
            this.setSide(Sides.Bottom);
        }

        else if (surface == Surface.Ceiling && this.y < this.radiusPixels) {
            height = this.sim.pixelsToMetres(Math.abs(this.y - this.radiusPixels));
            this.setSide(Sides.Top);
        }

        // Remove the added graviational energy from the balls kinetic energy
        // Recalculate velocity again and if the ball has no (or negative) energy, 
        // set velocity to 0.
        let energyToRemove = this.mass * height * this.sim.g;
        let direction = Math.sign(this.yVelocity);
        let energy = 0.5 * this.mass * (this.yVelocity ** 2);
        energy -= energyToRemove;
        if (energy <= 0) {
            energy = 0;
        }
        this.yVelocity = Math.sqrt((2 * energy) / this.mass) * direction;
    }

    bounceY() {
        // If the ball is at rest on a surface, then it should not bounce
        if (this.surfaceAtRestOn != Surface.None) {
            return;
        }

        let surface = Surface.None;
        let signMultiplier = 1;

        // If bounce on floor
        if (this.y + this.radiusPixels > canvas.height) {
            surface = Surface.Floor;
        }

        // If bounce on ceiling
        if (this.sim.bounceOnCeiling && this.y - this.radiusPixels < 0) {
            surface = Surface.Ceiling;
            signMultiplier = -1
        }

        // If bounce on either floor or ceiling
        if (surface != Surface.None) {
            // If the ball should pause when it hits a surface, then pause
            if (isFullSimulator && pauseOnSurfaceCheckbox.checked) {
                this.sim.togglePause();
            }

            if (this.yVelocity * signMultiplier > 0) {
                this.yVelocity = this.applyBounce(this.yVelocity);
            }
            // Ensure that the ball is not embedded in a surface
            this.removeFromSurface(surface);
        }
    }

    applyDrag(velocity, oldVelocity) {
        // Applies drag force to ball assuming turbulent flow
        let direction = Math.sign(velocity);
        let force = 0.5 * this.sim.dragCoefficient * this.sim.fluidDensity * (oldVelocity ** 2) * this.crossSectionalArea;
        velocity -= (force / this.mass) * direction * this.sim.timePassed;
        if (Math.sign(velocity) != direction) {
            velocity = 0;
        }
        return velocity;
    }

    applyDragX() {
        // Applies drag in the x direction
        this.xVelocity = this.applyDrag(this.xVelocity, this.oldXVelocity);
    }

    applyDragY() {
        // Applies drag in the y direction
        this.yVelocity = this.applyDrag(this.yVelocity, this.oldYVelocity);
    }

    applyBuoyancy() {
        // If ball is not at rest, then apply buoyancy
        if (this.surfaceAtRestOn != Surface.None) {
            return;
        }
        let force = -this.massOfDisplacedFluid * this.sim.g;
        this.yVelocity += (force / this.mass) * this.sim.timePassed;
    }

    applyFriction() {
        // Applies friction if resting on or touching the floor
        if (Math.abs(this.y + this.radiusPixels - canvas.height) < 1) {
            let xDirection = Math.sign(this.oldXVelocity);
            let normalForce = this.mass * this.sim.g;
            let frictionalForce = this.sim.frictionCoefficient * normalForce;
            this.xVelocity -= (frictionalForce / this.mass) * xDirection * this.sim.timePassed;
            // If the velocity changes sign, then the ball should have stopped, so the 
            // balls velocity is set to 0.
            if (Math.sign(this.xVelocity) != xDirection) {
                this.xVelocity = 0;
            }
        }
    }

    applyGravity() {
        // If the ball is not at rest, then apply gravity
        if (this.surfaceAtRestOn != Surface.None) {
            return;
        }

        this.yVelocity += this.sim.g * this.sim.timePassed;

    }

    setOnSurface(surface) {
        /*
         * Set the ball to be at rest upon a surface.
         * This means that the ball will not bounce or experience gravity, buoyancy
         * or drag in the y direction.
         * 
         * Setting surfaceAtRestOn to Surface.None means that the ball is not at rest
        */
        this.surfaceAtRestOn = surface;
        if (surface == Surface.None) {
            return;
        }

        if (surface == Surface.Floor) {
            this.setSide(Sides.Floor);
        }
        else if (surface == Surface.Ceiling) {
            this.setSide(Sides.Top);
        }

        this.yVelocity = 0;
        this.oldYVelocity = 0;
        this.previousSurfaces = [];
    }

    updatePos() {
        /*
         * Updates ball position
         * The balls velocities are in metres per second but we want to move the ball
         * in pixels so we convert metres/sec to pixels/sec
         * 
         * Displacement = velocity * time passed
         */
        this.x += this.sim.metresToPixels(this.xVelocity * this.sim.timePassed);
        this.y += this.sim.metresToPixels(this.yVelocity * this.sim.timePassed);
    }

    checkOnSurface() {
        /*
         * If on the current and last two frames, the ball has been in a close proximity
         * to a surface, then it is set to be at rest upon that surface.
         */
        let surface = this.getSurfacePositionedAt();
        this.previousSurfaces.push(surface);
        if (this.previousSurfaces.length > this.previousSurfaceCount) {
            this.previousSurfaces.shift();
        }
        if (surface != Surface.None && this.previousSurfaces.length == this.previousSurfaceCount) {
            let atRest = true;
            for (let i = 0; i < this.previousSurfaceCount - 1; i++) {
                if (this.previousSurfaces[i] != surface) {
                    atRest = false;
                }
            }
            if (atRest) {
                this.setOnSurface(surface);
            }
        }
    }

    updateVelocity() {
        // If the ball is not at rest on a surface then apply changes to Y velocity
        if (this.surfaceAtRestOn == Surface.None) {

            // On a moment when the ball bounces on the floor/ceiling, don't apply gravity.
            this.applyGravity();
            this.bounceY();
            this.applyBuoyancy();
            this.applyDragY();
        }
        console.log(this.surfaceAtRestOn);
        this.applyDragX();
        this.applyFriction();
        this.bounceX();

        // Set acceleration values to be displayed in the chart.
        this.accelX = (this.xVelocity - this.oldXVelocity) / this.sim.timePassed;
        this.accelY = (this.yVelocity - this.oldYVelocity) / this.sim.timePassed;
        this.oldXVelocity = this.xVelocity;
        this.oldYVelocity = this.yVelocity;
    }

    getOutOfBoundsList() {
        // Returns a list of all of the sides for which the balls is out of bounds on
        // Elements of the list are from the enum dict Sides
        let outOfBoundsList = []
        if (this.y + this.radiusPixels > canvas.height) {
            outOfBoundsList.push(Sides.Bottom);
        }
        else if (this.y - this.radiusPixels < 0 && this.sim.bounceOnCeiling == true) {
            outOfBoundsList.push(Sides.Top);
        }
        if (this.x + this.radiusPixels > canvas.width) {
            outOfBoundsList.push(Sides.Right);
        }
        else if (this.x - this.radiusPixels < 0) {
            outOfBoundsList.push(Sides.Left);
        }
        return outOfBoundsList;
    }

    setSide(side) {
        // Sets the position of the ball to be touching the side, side
        if (side == Sides.Bottom) {
            this.y = canvas.height - this.radiusPixels;
        }
        else if (side == Sides.Top) {
            this.y = this.radiusPixels;
        }
        else if (side == Sides.Right) {
            this.x = canvas.width - this.radiusPixels;
        }
        else if (side == Sides.Left) {
            this.x = this.radiusPixels;
        }
    }

    handleOutOfBounds() {
        // If the ball has gone inside a wall then the coordinates are set so that it 
        // is just touching the wall instead
        let outOfBoundsList = this.getOutOfBoundsList();
        let length = outOfBoundsList.length;
        for (let i = 0; i < length; i++) {
            this.setSide(outOfBoundsList[i]);
        }
    }

    addPreviousLocation() {
        // Adds location of the ball to previous locations list and deletes oldest element
        // if the list goes over the maximum locations allowed
        let maximumLocationsHeld = 5;
        if (this.previousLocations.length == maximumLocationsHeld) {
            this.previousLocations.splice(0, 1);
        }
        this.previousLocations.push([this.x, this.y]);
    }

    updateConstants() {
        // If the user has changed the ball radius of material via the html, then 
        // update the constants accordingly.

        let updateInfo = updateTextboxConstant(this.density, materialTextbox, 100, 20000, this);
        if (updateInfo[1]) {
            this.setDensity(updateInfo[0]);
        }
        
        updateInfo = updateTextboxConstant(this.radiusMetres, ballRadiusTextbox, 0.1, 1);
        if (updateInfo[1]) {
            let constantProperty = document.querySelector('input[name="changeRadiusKeepConstant"]:checked').value;
            this.setRadius(updateInfo[0], constantProperty);
            this.removeFromSurface();
            this.handleOutOfBounds();
        }
    }

    grab() {
        /*
         * While the ball is being grabbed by the user, the position is set to the 
         * mouse position, unless the ball would go out of bounds in which case it is set
         * to touch the boundary.
         * Locations are stored so that upon release the ball can have a velocity like it
         * has been thrown.
         */
        this.x = this.sim.mousePos.x;
        this.y = this.sim.mousePos.y;
        this.handleOutOfBounds();
        this.addPreviousLocation();
    }

    draw() {
        // Draws the ball
        ctx.fillStyle = "red";
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radiusPixels, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    update() {
        // Updates everything about the ball
        if (this.grabbed) {
            this.grab();
        }
        else if (!this.sim.isPaused) {
            this.updatePos();
            this.updateVelocity();
        }
        if (this.surfaceAtRestOn == Surface.None) {
            this.checkOnSurface();
        }
        this.updateConstants();
        this.draw();           // Draw the ball
    }
}

class Simulation {
    constructor() {
        this.setSettings();                     // Initialises settings
        this.spawnBall();                       // Spawns the ball
        this.reset();                           // Resets/initialises various things
        this.input = new inputHandler(this);    // Adds event handlers
        this.mousePos = {x: 0, y: 0};
        this.isBallGrabbed = false;
        this.prevUpdate = time();               // Time of previous update
        this.latestUpdate = this.prevUpdate;    // Time of latest update
        this.startTime = this.prevUpdate;       // Start time
        this.timePassed = 0;                    // Time passed since last prev update
        this.timePaused = 0;                    // Amount of time sim has been paused  
        this.timeSinceReset = 0;                // Time since last reset
        this.isPaused = false;
        this.plotType = "Y_VELOCITY";     // What to plot on the y axis
        this.limitChart = false;          // Limit the number of chart datapoints
        this.update();                    // Update is the main loop which calls itself
    }

    resetData() {
        // Reset/initialise data points for position, velocity and accelerations,
        // all in the y direction and clear chart data.
        if (window.chart != undefined) {
            window.chart.options.data[0].dataPoints = [];
        }
        this.posDataPoints = [[], []];
        this.velDataPoints = [[], []];
        this.accelDataPoints = [[], []];
        // this.energyDataPoints = [];
    }

    reset(setPos = true) {
        // Sets ball velocities to 0, clears the chart and resets data
        // Sets the balls position to the middle of the canvas if using the reset button
        this.ball.reset(setPos);
        this.updateConstants();
        this.resetData();
        this.lastReset = time();
        this.timeSinceReset = 0;
    }

    spawnBall() {
        // Spawns the ball
        let x = canvas.width / 2, y = canvas.height / 2;
        this.ball = new Ball(x, y, this.ballRadius, this);
    }

    setSettings() {
        /*
         * g is the strength of gravity, by default set to Earth's Gravity
         * fluidDensity is the density of the fluid that the ball is in, by default air
         * scale is designed to set a real world distance to each pixel
         * scale = 0.01 means each pixel represents 0.01 metres
         * Zoom is how far in or out the sim is zoomed from the default scale.
         * This means that the ball has a real word radius of 30cm since it's pixel radius
         * is 30 pixels.
         * energyRemainingOnBounce is the proportion of kinetic energy that will remain
         * (in a given direction) after bouncing with a wall.
         */
        this.g = 9.81;
        this.fluidDensity = 1.23;
        this.fluidName = "air";
        this.dragCoefficient = 0.47;
        this.frictionCoefficient = 0.2;
        this.ballRadius = 0.3;              // In metres
        this.scale = 0.01;
        this.zoom = 1;
        this.energyRemainingOnBounce = 0.5;
        this.energyLostPercent = 50;
        this.chartMaxDataPoints = 10;
    }

    pixelsToMetres(value) {
        // Converts values measured in pixels to metres
        return value * this.scale / this.zoom;
    }

    metresToPixels(value) {
        // Converts values measured in metres to pixels
        return value * this.zoom / this.scale;
    }

    togglePause() {
        // Toggles pause on the sim and correspondingly changes the pause button text
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            pauseButton.innerHTML = "Unpause";
        }
        else {
            pauseButton.innerHTML = "Pause";
        }
    }

    grabBall(mousePos) {
        // If the mouse is inside the ball, the ball is grabbed
        if (this.ball.checkGrab(mousePos)) {
            this.isBallGrabbed = true;
        }
    }

    storeMousePos(mousePos) {
        // Stores mouse position for use by Ball.grab()
        this.mousePos = mousePos;
    }

    releaseBall() {
        // If the ball is being held then it is released.
        if (this.isBallGrabbed) {
            this.ball.release();
            this.isBallGrabbed = false;
        }
    }

    setUpdateTime() {
        /*
         * Updates the time to which the ball will update to
         * timePassed is the time passed since the last simulation update.
         * Balls will use timePassed to update themselves.
         */
        this.prevUpdate = this.latestUpdate;
        this.latestUpdate = time();
        this.timePassed = this.latestUpdate - this.prevUpdate;

        /*
         * If the sim is paused then update the amount of time the sim has been paused
         * for. (So the graph has no continuity errors in it's time line)
         * Also update the time of the last reset (so the time since last reset does
         * not increase while the sim is paused.)
        */
        if (this.isPaused) {
            this.timePaused += this.timePassed;
            this.lastReset = this.latestUpdate - this.timeSinceReset;
        }
    }

    getRuntime() {
        // Returns how long the sim has been running for.
        return this.latestUpdate - this.startTime - this.timePaused;
    }

    updatePlotType() {
        // According to plotType plot either the position, velocity or acceleration
        // for either the x or y.
        this.plotType = document.querySelector('input[name="chartDisplayType"]:checked').value;
        this.plotXY = document.querySelector('input[name="chartDisplayXY"]:checked').value;
        let index = (this.plotXY == "X") ? (0) : 1;

        if (this.plotType == "Position") {
            chart.options.data[0].dataPoints = this.posDataPoints[index];
            chart.title.set("text", this.plotXY + " position over time (m)");
        }
        else if (this.plotType == "Velocity") {
            chart.options.data[0].dataPoints = this.velDataPoints[index];
            chart.title.set("text", this.plotXY + " velocity over time (ms-1)");
        }
        else if (this.plotType == "Acceleration") {
            chart.options.data[0].dataPoints = this.accelDataPoints[index];
            chart.title.set("text", this.plotXY + " acceleration over time (ms-2)");
        }
        /*
        else if (this.plotType == "Energy") {
            chart.options.data[0].dataPoints = this.energyDataPoints;
            chart.title.set("text", "Energy over time (J)");
        }
        */
    }

    updateChart() {
        // The chart takes a moment to load so at the start window.chart will be undefined
        if (window.chart == undefined) {
            return;
        }

        if (limitChartCheckbox != null) {
            this.limitChart = limitChartCheckbox.checked;
        }

        // If the chart should limit the number of data points and there are more data
        // points than are to be allowed, then remove data points to fit the max amount.
        this.chartMaxDataPoints = updateTextboxConstant(this.chartMaxDataPoints, maxDataPointsTextbox, 1, 100000)[0];
        let deleteCount = chart.options.data[0].dataPoints.length - this.chartMaxDataPoints;
        if (this.limitChart && deleteCount > 0) {
            let deleteCount = chart.options.data[0].dataPoints.length - this.chartMaxDataPoints;
            for (let i = 0; i < 2; i++) {
                this.posDataPoints[i].splice(0, deleteCount)
                this.velDataPoints[i].splice(0, deleteCount)
                this.accelDataPoints[i].splice(0, deleteCount)
            }
            // this.energyDataPoints.splice(0, deleteCount);
        }
    }

    addDataPoints() {
        // Store the data for the balls position, velocity and acceleration for x and y
        let runtime = this.getRuntime();
        this.posDataPoints[0].push({x: runtime, y: this.ball.getDisplayX()});
        this.velDataPoints[0].push({x: runtime, y: this.ball.getDisplayVelocityX()});
        this.accelDataPoints[0].push({x: runtime, y: this.ball.getDisplayAccelerationX()});
        this.posDataPoints[1].push({x: runtime, y: this.ball.getDisplayY()});
        this.velDataPoints[1].push({x: runtime, y: this.ball.getDisplayVelocityY()});
        this.accelDataPoints[1].push({x: runtime, y: this.ball.getDisplayAccelerationY()});
        // this.energyDataPoints.push({x: runtime, y: this.ball.getEnergy()});
    }

    updateData() {
        if (!isFullSimulator) {
            return;
        }
        this.addDataPoints();
        this.updateChart();
    }

    setZoom() {
        /*
         * Sets the simulations zoom according to the html zoom slider. 
         *
         * Suppose we zoom from 1x to 0.1x,
         * Real world values shouldnt change, i.e. ball.radius is in meters, which should
         * be unaffected by zoom.
         * However ball.radiusPixels would become 10 times smaller.
         * Along with that, the balls location in pixels with change.
         * If it was 100 pixels above the ground, post-zoom it should be 10 pixels 
         * above the ground.
         * Essentially the pixels per metre scale would be multiplied by new zoom / old zoom
         */
        let zoomMultiplier = parseFloat(zoomSlider.value) / this.zoom;
        this.zoom = parseFloat(zoomSlider.value);
        this.ball.setZoom(zoomMultiplier);
        zoomSpan.innerHTML = this.zoom.toFixed(2).toString() + "x";
    }

    updateConstants() {
        // Get updates on constants from the html elements.

        // updateTextboxConstant returns an array [value, valueHasChanged].
        // It also bounds the inputs and NaN inputs.
        let updateInfo = []

        this.g = updateTextboxConstant(this.g, gravityTextbox, 0, 100, this.ball)[0];
        this.frictionCoefficient = updateTextboxConstant(this.frictionCoefficient, frictionTextbox, 0, 1.5)[0];
        
        // If fluid density changes, recalculate mass of displaced fluid
        updateInfo = updateTextboxConstant(this.fluidDensity, fluidTextbox, 0, 5000, this.ball);
        this.fluidDensity = updateInfo[0];
        if (updateInfo[1] == true) {
            this.ball.calculateDisplacedFluid();
        }

        // If energy lost percent changes, recalculate energy remaining on bounce
        updateInfo = updateTextboxConstant(this.energyLostPercent, energyLostTextbox, 0, 100);
        this.energyLostPercent = updateInfo[0];
        if (updateInfo[1]) {
            this.energyRemainingOnBounce = 1 - (this.energyLostPercent / 100);
        }

        // Update zoom from slider
        if (zoomSlider != null && zoomSlider.value != this.zoom) {
            this.setZoom(zoomSlider.value);
        }

        // If the bounce on ceiling checkbox changes, set the ball to not be at rest.
        // (Since the ball could be at rest on the ceiling and then have to float upwards)
        if (ceilingBounceCheckbox != null && this.bounceOnCeiling != ceilingBounceCheckbox.checked) {
            this.bounceOnCeiling = ceilingBounceCheckbox.checked;
            this.ball.setOnSurface(Surface.None);
        }

        // Change the background colour if the fluid is water or the moons atmosphere.
        if (fluidSelecter != null && this.fluidName != fluidSelecter.value) {
            if (fluidSelecter.value == "water") {
                canvas.style.background = waterColour;
            }
            else if (fluidSelecter.value == "moon") {
                canvas.style.background = "#888";
            }
            else {
                canvas.style.background = "white";
            }
        }
    }

    updateDisplayedBallProperties() {
        if (!isFullSimulator) {
            return;
        }
        // Update displayed proprties of the ball and also the time since the last reset.
        xCoordSpan.innerHTML = this.ball.getDisplayX();
        yCoordSpan.innerHTML = this.ball.getDisplayY();
        xVelocitySpan.innerHTML = this.ball.getDisplayVelocityX();
        yVelocitySpan.innerHTML = this.ball.getDisplayVelocityY();
        massSpan.innerHTML = Number(this.ball.mass.toPrecision(4));
        densitySpan.innerHTML = Number(this.ball.density.toPrecision(4));
        volumeSpan.innerHTML = Number(this.ball.volume.toPrecision(4));
        this.timeSinceReset = this.latestUpdate - this.lastReset;
        timeSinceResetSpan.innerHTML = (Math.round((this.timeSinceReset) * 100) / 100).toFixed(2);
    }

    update() {
        clearCanvas();              // Clear the canvas
        this.setUpdateTime();       // Updates the time to which the simulation will update to
        this.ball.update()          // Updates the ball
        if (!this.isPaused) {
            this.updateData();      // When the sim is paused, no data points are to be added
        }
        this.updateConstants();     // Updates physics constants such as gravity according to user input.
        if (window.chart != null) {
            this.updatePlotType();  // Update the chart plotType
            window.chart.render();  // Render the chart
        }
        this.updateDisplayedBallProperties();           // Update the displayed properties
        requestAnimationFrame(this.update.bind(this));  // Calls update again
    }
}

function updateTextboxConstant(currentValue, textbox, lowerBound, upperBound, ball = null) {
    /*
     * Update should only happen when the value has been changed and the user has
     * clicked out of the textbox
     * 
     * Validates that the input is NaN and is between the upper and lower bounds
     * 
     * Optionally pass in the ball and set it to not be at rest.
     */
    if (textbox != null && currentValue != textbox.value && textbox != document.activeElement) {
        let info = ensureFloatAndBounded(textbox.value, currentValue, lowerBound, upperBound);
        let inputIsOk = info[0];
        let newValue = info[1];
        textbox.value = newValue;
        if (inputIsOk && ball != null) {
            ball.setOnSurface(Surface.None);
        }
        return [newValue, true];
    }
    return [currentValue, false];
}

function ensureFloatAndBounded(value, originalValue, lowerBound, upperBound) {
    // Returns [boolean isValidInput, float boundedValue]
    if (isNaN(value)) {
        return [false, originalValue];
    }
    if (value <= lowerBound) {
        return [true, lowerBound];
    }
    if (value >= upperBound) {
        return [true, upperBound];
    }
    return [true, value];
}

function clearCanvas() {
    // clears canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function distance(point1, point2) {
    // Returns distance from point1 to point2.
    return Math.sqrt((point1[0] - point2[0]) ** 2 + (point1[1] - point2[1]) ** 2);
}

function time() {
    // Returns time in seconds
    return Date.now() / 1000
}

// Create and run simulation
sim = new Simulation();