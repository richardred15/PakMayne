class Game {
    /**
     * Definitions
     */
    CAMERAMODES = {
        FirstPerson: 1,
        ThirdPerson: 2
    }
    scale = 5;
    /**
     * @type {Worker}
     */
    worker = null;
    gameInterval = null;
    /**
     * @type {THREE.Clock}
     */
    clock = new THREE.Clock();
    playClock = new THREE.Clock();
    deathTime = 0;
    physicsClock = new THREE.Clock();
    /**
     * @type {UserInput}
     */
    input = null;
    ready = false;
    next = true;
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
     * @type {Drop[]}
     */
    drops = [];
    /**
     * @type {World}
     */
    map = null;
    /**
     * @type {THREE.Scene}
     */
    scene = null;
    _paused = true;
    renderOnce = true;
    focused = false;
    lost = false;
    gameOver = false;
    frameRate = 30;
    frameCount = 0;
    /**
     * @type {THREE.Mesh}
     */
    playerModel = null;
    botModel = null;
    /**
     * @type {THREE.Mesh}
     */
    crossModel = null;
    ammoModel = null;
    ammoModelLoaded = false;
    crossModelLoaded = false;
    playerModelLoaded = false;
    botModelLoaded = false;
    /**
     * @type {THREE.Camera}
     */
    camera = null;
    cameraOffset = {
        x: 0,
        y: 3,
        z: -5
    }
    cameraMode = this.CAMERAMODES.ThirdPerson;
    /**
     * @type {THREE.Renderer}
     */
    renderer = null;
    totalProjectiles = 0;
    totalEProjectiles = 0;
    diagnosticsElement = document.getElementById("diagnostics");
    fpsDisplay = document.getElementById("framerate");
    physicsFPSDisplay = document.getElementById("physicsFrameRate");
    objectCountDisplay = document.getElementById("objectCount");
    eObjectCountDisplay = document.getElementById("engineObjects");

    healthDisplay = document.getElementById("health");
    botsLeftDisplay = document.getElementById("bots_left");
    timeSurvivedDisplay = document.getElementById("time_survived");
    roundDisplay = document.getElementById("round");
    qualitySelector = document.getElementById("quality_selector");
    ammoDisplay = document.getElementById("ammo");
    pausedDisplay = document.getElementById("paused");
    menuDisplay = document.getElementById("menu");

    playButton = document.getElementById("play");

    botCount = 2;
    currentBotCount = 0;
    botsAlive = 0;
    respawnTime = 5;
    respawnCounter = 0;
    round = 0;
    customSize = null;
    healthModel = null;

    shadowsEnabled = false;
    shadowMapSize = 512;
    screenSize = {
        width: window.innerWidth,
        height: window.innerHeight
    }
    antialias = true;
    resolutionScale = 1;

    /**
     * @type {SoundManager}
     */
    sm = null;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 10 * this.scale, 30 * this.scale);
        this.camera.lookAt(0, 10, 0);
        this.setupRenderer();

        this.map = new World();
        this.scene.add(this.map.mesh);
        // Create a directional light
        const light = new THREE.HemisphereLight(0xffffff, 0.75);

        //light.castShadow = true;
        console.log("Game loaded");
        // move the light back and up a bit
        light.position.set(0, 20, 5);
        // remember to add the light to the scene
        this.scene.add(light);
        //this.scene.add(this.dirLight);

        var deltaX = 10;
        var deltaY = 5;
        this.cameraAngle = Math.atan2(deltaY, deltaX);
        // @ts-ignore
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        /* const loader = new THREE.CubeTextureLoader();
        const t = loader.load([
            'textures/bkg1_right.png',
            'textures/bkg1_left.png',
            'textures/bkg1_top.png',
            'textures/bkg1_bot.png',
            'textures/bkg1_front.png',
            'textures/bkg1_back.png',
        ]);
        this.scene.background = t; */

        this.sm = new SoundManager();

        this.sm.loadSound("audio/shoot.mp3");
        this.sm.loadSound("audio/pickup.mp3");
        this.sm.loadSound("audio/full_ammo.mp3", 1);
        this.sm.loadSound("audio/max_health.mp3", 1);
    }

    /**
     * Functions
     */

    toggleCameraMode() {
        if (this.cameraMode == this.CAMERAMODES.ThirdPerson) {
            this.cameraOffset = {
                x: 0,
                y: 0,
                z: 2
            }
            this.cameraMode = this.CAMERAMODES.FirstPerson;
        } else if (this.cameraMode == this.CAMERAMODES.FirstPerson) {
            this.cameraOffset = {
                x: 0,
                y: 3,
                z: -5
            }
            this.cameraMode = this.CAMERAMODES.ThirdPerson;
        }
    }

    setupRenderer() {
        let quality = this.getQuality();
        let qi = 2;
        switch (quality) {
            case "ultra":
                this.shadowsEnabled = true;
                this.shadowMapSize = 4069;
                this.antialias = true;
                qi = 0;
                break;
            case "high":
                this.resolutionScale = 1;
                this.shadowsEnabled = true;
                this.antialias = true;
                qi = 1;
                break;
            case "medium":
                this.resolutionScale = 0.6;
                this.shadowsEnabled = false;
                this.antialias = true;
                qi = 2;
                break;
            case "low":
                this.resolutionScale = 0.5;
                this.shadowsEnabled = false;
                this.antialias = false;
                qi = 3;
                break;
            case "ultra-low":
                this.resolutionScale = 0.5;
                this.shadowsEnabled = false;
                this.antialias = false;
                qi = 4;
                this.screenSize = {
                    width: 1280,
                    height: 720
                }
                break;
            default:
                break;
        }
        this.qualitySelector.children[qi].style.backgroundColor = "#444";
        let reload = false;
        if (this.renderer != null) reload = true;
        else {
            this.renderer = new THREE.WebGLRenderer({
                antialias: this.antialias
            });
        }
        this.renderer.setClearColor(0x333333);
        this.renderer.shadowMap.enabled = this.shadowsEnabled;
        this.renderer.setSize(this.screenSize.width, this.screenSize.height);
        this.renderer.setPixelRatio(this.resolutionScale);
        if (reload) {
            let go = confirm("Restart required to apply all settings. Restart Now?");
            if (go) {
                window.location.reload();
            }
        }
    }

    getQuality() {
        let set = localStorage.getItem("quality");
        if (set == "custom") {
            let opts = localStorage.getItem("quality-options");
            if (opts) {
                let obj = JSON.parse(opts);
                this.shadowsEnabled = obj.shadowsEnabled;
                this.resolutionScale = obj.resolutionScale;
                if (obj.screenSize.width != -1) this.screenSize.width = obj.screenSize.width;
                if (obj.screenSize.height != -1) this.screenSize.height = obj.screenSize.height;
                this.antialias = obj.antialias;
            }
        } else {
            if (set == null) {
                set = "medium";
                localStorage.setItem("quality", "medium");
            }
            return set;
        }
    }

    setQuality(quality) {
        localStorage.setItem("quality", quality);
        this.setupRenderer();
    }

    setShadows(state) {
        this.renderer.shadowMap.enabled = state;
    }

    lowRes(state) {
        if (state) {
            this.renderer.setPixelRatio(0.5);
            this.customSize = {
                w: 1280,
                h: 720
            }
        } else {
            this.renderer.setPixelRatio(1);
            this.customSize = null;
        }
        this.resize();
    }

    resize() {
        if (this.customSize == null) {
            game.renderer.setSize(window.innerWidth, window.innerHeight);
        } else {
            game.renderer.setSize(Math.min(this.customSize.w, window.innerWidth), Math.min(this.customSize.h, window.innerHeight));
        }
    }

    initializePhysics() {
        let players = [];
        for (let p in this.players) {
            let player = this.players[p];
            let pData = {
                id: player.id,
                position: this.vectorQuatToObject(player.mesh.position),
                quaternion: this.vectorQuatToObject(player.mesh.quaternion),
                velocity: this.vectorQuatToObject(player.velocity)
            }

            players.push(pData);
        }
        /* let bots = [];
                for (let b in this.bots) {
                    let bot = this.bots[b];
                    let bData = {
                        id: bot.id,
                        position: this.vectorQuatToObject(bot.mesh.position),
                        quaternion: this.vectorQuatToObject(bot.mesh.quaternion),
                        velocity: this.vectorQuatToObject(bot.velocity)
                    }
        
                    bots.push(bData);
                } */
        let message = {
            type: "init",
            players: players,
            /* bots: bots, */
            scale: this.scale
        }
        this.worker.postMessage(message);
    }

    /**
     * 
     * @param {THREE.Vector3|THREE.Quaternion} vectorQuat 
     */
    vectorQuatToObject(vectorQuat) {
        let arr = vectorQuat.toArray();
        let obj = {};
        if (arr.length == 4) {
            obj.w = arr[3];
        }
        obj.x = arr[0];
        obj.y = arr[1];
        obj.z = arr[2];
        return obj;
    }

    /**
     * 
     * @param {number} delta 
     */
    // @ts-ignore
    updateCamera(delta) {
        if (!this.player.dead) {
            var relativeCameraOffset = new THREE.Vector3(this.cameraOffset.x, this.cameraOffset.y * this.scale, this.cameraOffset.z * this.scale);
            var cameraOffset = relativeCameraOffset.applyMatrix4(this.player.mesh.matrixWorld);
            this.camera.position.lerp(cameraOffset, 1);
            this.camera.lookAt(this.player.mesh.position);
            if (this.cameraMode == this.CAMERAMODES.FirstPerson) this.camera.rotateY(Math.PI);
            //this.dirLight.lookAt(this.player.mesh.position);
        } else {
            this.camera.position.lerp(new THREE.Vector3(0, 120, 0), 0.05);
            this.camera.lookAt(new THREE.Vector3(0, -10, 0));
            this.camera.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
        }
    }

    lockChangeAlert() {
        if (document.pointerLockElement === this.renderer.domElement) {
            this.focused = true;
            this.resume();
            //statusElement.innerHTML = "";
            // Do something useful in response
        } else {
            this.focused = false;
            //this._paused = true;
            if (!this.player.dead) this.pause();
            //if (!player.remove) statusElement.innerHTML = "_PAUSED";
            // Do something useful in response
        }
    }

    load() {
        let gltfLoader = new THREE.GLTFLoader();

        this.playerModel = null;
        this.botModel = null;
        // @ts-ignore
        gltfLoader.load("models/Bro2.glb",
            function (gltf) {
                /**
                 * @type {THREE.Mesh}
                 */
                let model = gltf.scene.children[0];
                model.rotateY(Math.PI);
                model.scale.set(10, 10, 10);
                var box = new THREE.Box3().setFromObject(model);
                var center = new THREE.Vector3();
                box.getCenter(center);
                model.position.sub(center);
                game.playerModel = model;
                game.playerModelLoaded = true;
            },
            // @ts-ignore
            function (progress) {},
            function (err) {
                console.log(err);
            });

        let objLoader = new THREE.OBJLoader();

        // @ts-ignore
        objLoader.load("models/GHOST.obj",
            function (obj) {
                console.log(obj);
                /**
                 * @type {THREE.Mesh}
                 */
                let model = obj;
                //model.rotateY(Math.PI);

                model.scale.set(2, game.scale / 2.71, game.scale / 2.04);
                var box = new THREE.Box3().setFromObject(model);
                var center = new THREE.Vector3();
                box.getCenter(center);
                model.position.sub(center);
                game.botModel = model;
                game.botModelLoaded = true;
            },
            // @ts-ignore
            function (progress) {},
            function (err) {
                console.log(err);
            });

        /**
         * @type {THREE.MTLLoader}
         */
        let mtl = new THREE.MTLLoader();

        mtl.load("models/bullet.mtl",
            /**
             * 
             * @param {THREE.MTLLoader.MaterialCreator} matCreator 
             */
            function (matCreator) {
                matCreator.preload();
                //console.log(matCreator.materials["Material.013"].emmisive = new THREE.Color(255, 255, 255));
                //console.log(matCreator.materials["Material.001"].color.setRGB(1, 0.5, 0));
                var objLoader = new THREE.OBJLoader();
                objLoader.setMaterials(matCreator);
                objLoader.load("models/bullet.obj",
                    function (obj) {
                        console.log(obj);
                        /**
                         * @type {THREE.Mesh}
                         */
                        let model = obj;
                        //model.rotateY(Math.PI);
                        model.scale.setScalar(0.5);

                        /* model.scale.set(2, game.scale / 2.71, game.scale / 2.04);*/
                        var box = new THREE.Box3().setFromObject(model);
                        var center = new THREE.Vector3();
                        box.getCenter(center);
                        model.position.sub(center);
                        game.ammoModel = model;
                        game.ammoModelLoaded = true;
                        /* model.position.setY(1);
                        model.scale.setScalar(2);
                        game.scene.add(model.clone()); */
                    },
                    // @ts-ignore
                    function (progress) {},
                    function (err) {
                        console.log(err);
                    });
            });
        objLoader.load("models/cross.obj",
            function (obj) {
                obj.scale.setScalar(0.3);
                game.crossModel = obj;
                game.crossModelLoaded = true;
            },
            // @ts-ignore
            function (progress) {},
            function (err) {
                console.log(err);
            });



    }

    init() {
        document.body.appendChild(this.renderer.domElement);
        let self = this;
        document.addEventListener('pointerlockchange', function () {
            self.lockChangeAlert()
        }, false);

        this.player = new Player(this.scale, this.playerModel.clone());
        this.player.weapon.addFlashlight();
        //this.player.health = 500;
        //this.player.maxHealth = 500;
        this.player.mesh.position.set(0, 10, 0);
        this.player.mesh.castShadow = true;
        this.players[this.player.id] = this.player;

        this.input = new UserInput(this.player);


        for (let p in this.players) {
            this.scene.add(this.players[p].mesh);
        }

        /* for (let p in this.bots) {
            this.scene.add(this.bots[p].mesh);
        } */
        this.worker = new Worker('worker.js');
        this.worker.onmessage = this.workerMessage;
        this.initializePhysics();
        this.newRound();
        this.playClock.start();
    }

    spawnBots() {
        for (let i = 0; i < this.botCount; i++) {
            let p = new Bot(this.player, this.scale, this.botModel.clone());
            if (this.player.dead) p.weapon.damage = 50;
            let pos = new THREE.Vector3(randInt(-10 * this.scale, 10 * this.scale), -this.scale, randInt(-10 * this.scale, 10 * this.scale));
            while (pos.distanceTo(this.player.mesh.position) < 5 * this.scale) {
                pos = new THREE.Vector3(randInt(-10 * this.scale, 10 * this.scale), -this.scale, randInt(-10 * this.scale, 10 * this.scale));
            }
            p.mesh.position.set(pos.x, pos.y, pos.z);
            this.bots[p.id] = p;
            this.scene.add(p.mesh);
            let bData = {
                id: p.id,
                position: this.vectorQuatToObject(p.mesh.position),
                quaternion: this.vectorQuatToObject(p.mesh.quaternion),
                velocity: this.vectorQuatToObject(p.velocity)
            }
            this.worker.postMessage({
                type: 'init',
                bots: [bData]
            })
        }
    }

    nextRound() {
        this.spawnBots()
        if (this.botCount < 20) {
            if (this.round % 5 == 0) this.botCount++;
        }
        if (!this.player.dead) {
            this.round++;
            //if (this.botCount > 20) this.botCount = 20;
        }
    }

    newRound() {
        for (let b in this.bots) this.bots[b].die();
        this.nextRound();
    }

    start() {
        //this.gameTimeout = setTimeout(this.render, 0);        
    }

    pause() {
        this._paused = true;
        this.playClock.stop();
        this.openMenu();
        this.playButton.innerHTML = "RESUME";
        //this.pausedDisplay.style.bottom = "0";
    }

    resume() {
        if (this._paused) this.playClock.start();
        this._paused = false;
        this.closeMenu();
        this.playButton.innerHTML = "PLAY";
        ///this.pausedDisplay.style.bottom = "100vh";
        this.renderer.domElement.requestPointerLock();
    }

    update(delta) {
        if (this.input.isKeyDown('W')) {
            this.player.move(DIRECTIONS.UP);
        }
        if (this.input.isKeyDown('A')) {
            this.player.move(DIRECTIONS.LEFT);
        }
        if (this.input.isKeyDown('S')) {
            this.player.move(DIRECTIONS.DOWN);
        }
        if (this.input.isKeyDown('D')) {
            this.player.move(DIRECTIONS.RIGHT);
        }
        if (this.input.isKeyDown(' ')) {
            this.player.jump();
        }
        if (this.input.isKeyDown('G')) {
            if (!game.player.weapon.autoFire) {
                setInterval(function () {
                    game.player.rotateSmooth(DIRECTIONS.RIGHT, 1)
                }, 1000 / 60);
                this.player.toggleAuto();
            }
        }
        if (this.input.isKeyDown('R')) {
            this.player.weapon.reload();
        }
        if (this.input.isKeyDown('P')) {
            game.pause();
        }
        if (this.input.keyPressed('C')) {
            game.toggleCameraMode();
        }
        let mouseDelta = this.input.mouseDelta();
        if (mouseDelta.x < 0) {
            this.player.rotateSmooth(DIRECTIONS.LEFT, mouseDelta.x / 6);
        }
        if (mouseDelta.x > 0) {
            this.player.rotateSmooth(DIRECTIONS.RIGHT, mouseDelta.x / 6);
        }

        if (mouseDelta.y < 0) {
            this.player.rotateSmooth(DIRECTIONS.UP, mouseDelta.y / 6);
        }
        if (mouseDelta.y > 0) {
            this.player.rotateSmooth(DIRECTIONS.DOWN, mouseDelta.y / 6);
        }
        if (this.input.isMouseDown(0)) {
            this.player.fire();
        }
        for (let i = this.drops.length - 1; i >= 0; i--) {
            let drop = this.drops[i];
            drop.update(delta);
            if (drop.pickedUp) {
                this.scene.remove(drop.mesh);
                this.drops.splice(i, 1);
            }
        }
        for (let p in this.players) {
            let player = this.players[p];

            if (!this._paused) player.update(delta);
            if (player.dead && !player.ghost) {
                for (let b in this.bots) this.bots[b].weapon.damage = 50;
                if (player.id == game.player.id) {
                    game.deathTime = game.playClock.getElapsedTime();
                }
                this.worker.postMessage({
                    type: "killPlayer",
                    id: player.id
                });
                player.setGhost();
            } else if (!player.dead && this.drops.length > 0) {
                for (let i = this.drops.length - 1; i >= 0; i--) {
                    let drop = this.drops[i];
                    if (drop) {
                        if (drop.isPickup(player.mesh.position)) {
                            drop.pickup(player);
                            //this.sm.sounds.pickup.play();
                        }
                    }
                }
            }
            /* if (player.newProjectile != null) {
                let vel = player.newProjectile.velocity;
                //player.newProjectile.mesh.rotateY(-Math.PI / 2);
                this.worker.postMessage({
                    type: "projectile",
                    id: player.newProjectile.id,
                    ownerid: player.id,
                    position: this.vectorQuatToObject(player.newProjectile.mesh.position),
                    quaternion: this.vectorQuatToObject(player.newProjectile.mesh.quaternion),
                    velocity: vel,
                    damage: player.newProjectile.damage
                });
                player.newProjectile = null;
            }
            if (player.deadProjectiles.length > 0) {
                for (let proj of player.deadProjectiles) {
                    this.worker.postMessage({
                        type: "killProjectile",
                        id: proj.id,
                        ownerid: player.id
                    });
                }
                player.deadProjectiles = [];
            } */
        }
        this.botsAlive = 0;
        this.currentBotCount = 0;
        for (let b in this.bots) {
            let bot = this.bots[b];
            this.currentBotCount++;
            if (!this._paused) bot.update(delta);
            if (bot.dead && !bot.ghost) {
                this.worker.postMessage({
                    type: "killBot",
                    id: bot.id
                });
                bot.setGhost();
                if (randInt(0, 100) < 50) {
                    //let type = 0xFFFF00;
                    let type = randInt(0, 10) < 5 ? 0xFFFF00 : 0xFF0000
                    let drop; // = new Drop(bot.mesh.position, type);
                    if (type == 0xFF0000) {
                        drop = new HealthDrop(bot.mesh.position, type);
                    } else {
                        drop = new AmmoDrop(bot.mesh.position, type);
                    }
                    this.scene.add(drop.mesh);
                    this.drops.push(drop);
                }
            } else if (!bot.dead) {
                this.botsAlive++;
                if (!this.map.inMap(bot.mesh.position)) {
                    bot.mesh.position.set(0, 10, 0);
                }
            }
            /* if (bot.newProjectile != null) {
                let vel = bot.newProjectile.velocity;
                //bot.newProjectile.mesh.rotateY(-Math.PI / 2);
                this.worker.postMessage({
                    type: "projectile",
                    id: bot.newProjectile.id,
                    ownerid: bot.id,
                    position: this.vectorQuatToObject(bot.newProjectile.mesh.position),
                    quaternion: this.vectorQuatToObject(bot.newProjectile.mesh.quaternion),
                    velocity: vel,
                    damage: bot.newProjectile.damage
                });
                bot.newProjectile = null;
            }
            if (bot.deadProjectiles.length > 0) {
                for (let proj of bot.deadProjectiles) {
                    this.worker.postMessage({
                        type: "killProjectile",
                        id: proj.id,
                        ownerid: bot.id
                    });
                }
                bot.deadProjectiles = [];
            } */
        }
        //this.controls.update();
        //this.physicsClock.getDelta();
        this.updateCamera(delta);
        if (this.currentBotCount == 0) {
            if (this.respawnCounter < this.respawnTime) {
                this.respawnCounter += delta;
            } else {
                this.newRound();
            }
        }

        this.input.update();
    }

    workerMessage(e) {
        let data = e.data;

        if (data.type == "update") {
            let time = game.physicsClock.getDelta();
            game.physicsFPSDisplay.innerHTML = `Physics: ${(1/time).toFixed(2)} fps`;

            for (let player of data.players) {
                if (game.players[player.id] != undefined) {
                    let p = game.players[player.id];
                    /* if (player.position.y > 15) {
                        if (player.velocity.y > 0) player.velocity.y = 0;
                        player.position.y = 15;
                    } */
                    p.mesh.position.set(player.position.x, player.position.y, player.position.z);
                    //p.mesh.quaternion.set(player.quaternion.x, player.quaternion.y, player.quaternion.z, player.quaternion.w);
                    //let newRot = p.mesh.rotation.toVector3().multiply(new THREE.Vector3(0, 1, 0));
                    //p.mesh.rotation.setFromVector3(newRot);
                    p.velocity.set(player.velocity.x, player.velocity.y, player.velocity.z);

                    /* if (data.projectiles[player.id] != undefined) {
                            for (let pr of data.projectiles[player.id]) {
                                let p = player.projectiles[pr.id];
    
                                p.mesh.position.set(pr.position.x, pr.position.y, pr.position.z);
                                p.mesh.quaternion.set(pr.quaternion.x, pr.quaternion.y, pr.quaternion.z, pr.quaternion.w);
                                //p.mesh.rotation.set(0, p.mesh.rotation.y, 0);
                                p.velocity.set(pr.velocity.x, pr.velocity.y, pr.velocity.z);
                            }
                        } */
                }
            }

            for (let bot of data.bots) {
                if (game.bots[bot.id] != undefined) {
                    let p = game.bots[bot.id];
                    if (bot.position.y > 15) bot.position.y = 15;
                    p.mesh.position.set(bot.position.x, bot.position.y, bot.position.z);
                    p.mesh.quaternion.set(bot.quaternion.x, bot.quaternion.y, bot.quaternion.z, bot.quaternion.w);
                    p.velocity.set(bot.velocity.x, bot.velocity.y, bot.velocity.z);

                    /* if (data.projectiles[bot.id] != undefined) {
                            for (let pr of data.projectiles[bot.id]) {
                                let b = bot.projectiles[pr.id];
    
                                b.mesh.position.set(pr.position.x, pr.position.y, pr.position.z);
                                b.mesh.quaternion.set(pr.quaternion.x, pr.quaternion.y, pr.quaternion.z, pr.quaternion.w);
                                //p.mesh.rotation.set(0, p.mesh.rotation.y, 0);
                                b.velocity.set(pr.velocity.x, pr.velocity.y, pr.velocity.z);
                            }
                        } */
                }
            }
            game.totalEProjectiles = 0;
            for (let proj of data.projectiles) {
                let p = game.players[proj.ownerid];
                if (p == undefined) p = game.bots[proj.ownerid];
                //console.log(proj.ownerid);
                if (p != undefined) {
                    let projectile = p.weapon.projectiles[proj.id];
                    if (projectile != undefined) {
                        if (proj.dead) projectile.die()
                        else {
                            game.totalEProjectiles++;
                            if (projectile != undefined) {
                                projectile.mesh.position.set(proj.position.x, proj.position.y, proj.position.z);
                                projectile.mesh.quaternion.set(proj.quaternion.x, proj.quaternion.y, proj.quaternion.z, proj.quaternion.w);
                            }
                        }
                    }
                }
            }
            this.next = true;
        } else if (data.type == "hit") {
            let player = game.players[data.id] || game.bots[data.id];
            if (player != undefined) {
                player.hit(data.damage);
                let owner = game.players[data.ownerid] || game.bots[data.ownerid];
                if (owner.weapon.projectiles[data.projectileid]) owner.weapon.projectiles[data.projectileid].die();
            }
        }

        //console.log(data.projectiles);

        /* for (let projectile of data.projectiles) {
                    let player = game.players[projectile.ownerid];
                    let pr = player.projectiles[projectile.id];
        
        
                } */

        //console.log(data);

        /* game.player.mesh.position.set(data.position.x, data.position.y, data.position.z);
                game.player.mesh.rotation.setFromQuaternion(new THREE.Quaternion(data.rotation.x, data.rotation.y, data.rotation.z, data.rotation.w));
                game.player.velocity.set(data.velocity.x, data.velocity.y, data.velocity.z); */
    }

    simulate(delta) {
        let pData = [];
        for (let id in this.players) {
            let player = this.players[id];
            if (player.dead) continue;
            pData.push({
                id: id,
                position: this.vectorQuatToObject(player.mesh.position),
                quaternion: this.vectorQuatToObject(player.mesh.quaternion),
                velocity: this.vectorQuatToObject(player.velocity)
            });
        }
        let bData = [];
        for (let id in this.bots) {
            let bot = this.bots[id];
            if (bot.dead) continue;
            bData.push({
                id: id,
                position: this.vectorQuatToObject(bot.mesh.position),
                quaternion: this.vectorQuatToObject(bot.mesh.quaternion),
                velocity: this.vectorQuatToObject(bot.velocity)
            });
        }

        let data = {
            type: "simulate",
            delta: delta,
            players: pData,
            bots: bData
        };


        // @ts-ignore
        this.worker.postMessage(data);

        /* let pos = game.player.mesh.position.toArray();
        let rot = (new THREE.Quaternion()).setFromEuler(game.player.mesh.rotation).toArray();
        let vel = game.player.velocity.toArray();
        game.worker.postMessage({
            delta: delta,
            player: {
                position: {
                    x: pos[0],
                    y: pos[1],
                    z: pos[2]
                },
                rotation: {
                    x: rot[0],
                    y: rot[1],
                    z: rot[2],
                    w: rot[3]
                },
                velocity: {
                    x: vel[0],
                    y: vel[1],
                    z: vel[2]
                }
            }
        }); */
    }

    render() {
        if (!this.ready && this.next) return;
        if (this._paused && !this.renderOnce) return;
        this.renderOnce = false;
        this.next = false;
        let delta = this.clock.getDelta();
        this.update(delta);

        this.simulate(delta);
        this.renderer.render(this.scene, this.camera);
        this.fpsDisplay.innerHTML = `Render: ${(1/delta).toFixed(2)} fps`;
        this.objectCountDisplay.innerHTML = `Projectiles: ${this.totalProjectiles} | Physics: ${this.totalEProjectiles}`;
        this.healthDisplay.innerHTML = `HP: ${this.player.health}`;
        this.roundDisplay.innerHTML = `Round: ${this.round}`;
        this.botsLeftDisplay.innerHTML = `Bots Left: ${this.botsAlive}`;
        let fullSeconds = Math.floor(this.player.dead ? this.deathTime : this.playClock.getElapsedTime());
        let seconds = ("0" + (fullSeconds % 60)).slice(-2);
        let minutes = ("0" + Math.floor(fullSeconds / 60)).slice(-2);
        this.timeSurvivedDisplay.innerHTML = `Time Survived: ${minutes}:${seconds}`;
        this.ammoDisplay.innerHTML = `${game.player.weapon.magazine}/${game.player.weapon.currentAmmo}`;
        this.frameCount++;
    }

    openMenu() {
        this.menuDisplay.style.bottom = "0px";
    }

    closeMenu() {
        this.menuDisplay.style.bottom = "100vh";
    }
}