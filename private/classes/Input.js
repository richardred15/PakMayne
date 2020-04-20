let DIRECTIONS = {
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
}

let MOUSE_DIRECTIONS = {
    x: 1,
    y: 0
}

class UserInput {
    /**
     * Definitions
     */

    mouseX = 0;
    mouseY = 0;

    mouseXDelta = 0;
    mouseYDelta = 0;

    lastXDelta = 0;
    lastYDelta = 0;

    held = {};
    pressed = {};

    mousePressed = [false, false, false];


    /**
     * @type {Player}
     */
    player = null;
    /** 
     * @param {Player} player 
     */
    constructor(player) {
        this.player = player;
    }

    keyPressed(key) {
        return this.pressed[key] == undefined ? false : this.pressed[key];
    }

    isKeyDown(key) {
        return this.held[key] == undefined ? false : this.held[key];
    }

    update() {
        this.pressed = {};
    }

    /**
     * 
     * @param {KeyboardEvent} e 
     */
    onkeydown(e) {
        this.held[e.key.toUpperCase()] = true;
        this.pressed[e.key.toUpperCase()] = true;
    }

    onkeyup(e) {
        this.held[e.key.toUpperCase()] = false;
    }

    mouseDelta() {
        let x = this.mouseXDelta;
        this.lastXDelta = x;
        this.mouseXDelta = 0;
        let y = this.mouseYDelta;
        this.lastYDelta = y;
        this.mouseYDelta = 0;

        return {
            x: x,
            y: y
        };
    }

    isMouseDown(button) {
        return this.mousePressed[button];
    }

    onmousedown(e) {
        this.mousePressed[e.button] = true;
    }

    onmouseup(e) {
        this.mousePressed[e.button] = false;
    }

    /**
     * 
     * @param {MouseEvent} e 
     */
    onmousemove(e) {
        //return;
        this.mouseXDelta += e.movementX;
        this.mouseYDelta += e.movementY;
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        /* if (e.movementX < 0) {
            this.player.rotateSmooth(DIRECTIONS.LEFT, e.movementX);
        }
        if (e.movementX > 0) {
            this.player.rotateSmooth(DIRECTIONS.RIGHT, e.movementX);
        } */
    }
}