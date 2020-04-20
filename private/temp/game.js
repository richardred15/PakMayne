/**
 * Definitions
 */

/**
 * @type {Game}
 */
let game;


/**
 * Functions
 */

function init() {
    game = new Game();
    game.start();
}
class Bot extends Player {
    /**
     * Definitions
     */
    /**
     * @type {Player}
     */
    target = null;

    constructor() {
        super();
    }

    /**
     * Functions
     */
}
class Game {
    /**
     * Definitions
     */
    /**
     * @type {Player}
     */
    player = null;
    /**
     * @type {Player[]}
     */
    players = [];
    /**
     * @type {Bot[]}
     */
    bots = [];
    /**
     * @type {World}
     */
    map = null;
    /**
     * @type {THREE.Scene}
     */
    scene = null;
    paused = false;
    lost = false;
    gameOver = false;
    frameRate = 30;

    constructor() {
        this.player = new Player();
        this.player.health = 10000000;
        this.players.push(this.player);

        // Create a directional light
        const light = new THREE.AmbientLight(0xffffff, 5.0);
        const dirLight = new THREE.DirectionalLight(0xffffff, 5.0);
        console.log("Game loaded");
        // move the light back and up a bit
        /* light.position.set(0, 0, 0);
        dirLight.position.set(10, 10, 10);
        // remember to add the light to the scene
        scene.add(light);
        scene.add(dirLight);


        for (let player of players) {
            scene.add(player.mesh);
        }
        camera.position.z = 5;
        player.mesh.translateZ(15);
        player.mesh.translateX(-5);
        player.mesh.lookAt(new THREE.Vector3());
        scene.add(reticle);
        var deltaX = 10;
        var deltaY = 5;
        this.cameraAngle = Math.atan2(deltaY, deltaX); */
    }

    /**
     * Functions
     */

    start() {

    }

    render() {}
}
class World {
    /**
     * Definitions
     */
    size = new THREE.Vector3();

    constructor(_size) {
        if (_size) this.size = _size;

    }

    /**
     * Functions
     */
}
class Network {
    /**
     * Definitions
     */

    constructor() {

    }

    /**
     * Functions
     */

    connect() {

    }

    disconnect() {

    }

    emit() {

    }
}
class Player {
    /**
     * Definitions
     */
    name = "";
    health = 100;
    /**
     * @type {Weapon}
     */
    weapon = null;
    speed = 2;

    constructor() {

    }

    /**
     * Functions
     */
}
class Weapon {
    /**
     * Definitions
     */
    ammo = 100;
    magazineSize = 20;
    magazine = magazineSize;
    fireRate = 0.1;
    automatic = false;

    constructor() {

    }

    /**
     * Functions
     */
}