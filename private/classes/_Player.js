class Player {
    /**
     * Definitions
     */
    name = "";
    maxHealth = 100;
    health = 100;
    dead = false;
    ghost = false;
    /**
     * @type {THREE.Mesh}
     */
    healthBar = null;
    healthBarColor = new THREE.Color(0x00FF00);
    /**
     * @type {Weapon}
     */
    weapon = null;
    speed = 10;
    maxSpeed = 10;
    /**
     * @type {THREE.Mesh}
     */
    model = null;
    /**
     * @type {THREE.Group}
     */
    mesh = null;
    rotationVector = new THREE.Vector3();
    rotationDirection = null;
    rotationAxis = null;
    weaponRotation = null
    weaponRotationDirection = null;
    jumping = false;
    jumpVelocity = 3;

    /**
     * @type {THREE.Vector3}
     */
    targetLookLocation = null;
    damage = 0;
    colors = [];
    despawnTimer = 3;
    /**
     * Speed of rotation in radians - rads/sec
     * @type {number}
     */
    rotationSpeed = Math.PI;

    /**
     * @type {THREE.Quaternion}
     */
    targetSmoothRotation = null;

    /**
     * @type {THREE.Vector3}
     */
    targetLocation = new THREE.Vector3();
    hasTargetLocation = false;
    targetLocationCounter = new THREE.Vector3();
    /**
     * @type {THREE.Vector3}
     */
    originalLocation = null;

    /**
     * @type {THREE.Vector3}
     */
    velocity = new THREE.Vector3();
    id = "";

    /**
     * @type {Projectile}
     */
    newProjectile = null;
    /**
     * @type {Projectile[]}
     */
    deadProjectiles = [];
    size = 1;
    isBot = false;
    projectileColor = 0xffff00;
    accuracy = 0.01;
    /**
     * @type {THREE.Mesh}
     */
    frame = null;
    /**
     * @type {SoundManager}
     */
    sm = null;
    /**
     * 
     * @param {number} scale 
     * @param {THREE.Mesh} model
     */
    constructor(scale = 1, model) {
        this.mesh = new THREE.Group();
        this.mesh.position.set(0, 0, 0);
        let geometry = new THREE.BoxBufferGeometry(1 * scale, 1 * scale, 1 * scale);
        this.frame = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
            wireframe: true
        }));
        this.mesh.castShadow = true;
        this.id = Math.random().toString();
        this.scale = scale;
        this.speed *= scale;
        this.jumpVelocity *= scale;
        this.model = model;
        this.mesh.add(this.model);
        //this.mesh.add(this.frame);
        var material = new THREE.LineBasicMaterial({
            color: 0x0000ff,
            opacity: 0.1
        });

        this.healthBar = new THREE.Mesh(new THREE.PlaneBufferGeometry(this.scale, 1), new THREE.MeshBasicMaterial({
            color: this.healthBarColor,
            side: THREE.DoubleSide
        }));
        this.healthBar.position.setY(this.scale / 1.5);
        this.mesh.add(this.healthBar);

        /* var geo = new THREE.Geometry();
        geo.vertices.push(
            new THREE.Vector3(0, 0, 5 * scale),
            new THREE.Vector3(0, 0, 0)
        );

        var line = new THREE.Line(geo, material) */
        ;
        //this.mesh.add(line);
        this.sm = new SoundManager();

        this.sm.loadSound("audio/shoot.mp3");
        this.sm.loadSound("audio/pew.mp3");
        this.sm.loadSound("audio/reload.mp3");
        this.sm.loadSound("audio/laser.mp3");
        //this.sm.sounds.laser.volume = 0.2;
        this.sm.sounds.reload.volume = 0.8;
        //s.log(this.model);
        this.init();
        this.material.emissive = this.material.color;
        this.material.emissiveIntensity = 0.3;
    }

    /**
     * Functions
     */

    init() {
        this.material = new THREE.MeshPhongMaterial({
            color: 0xffff00,
            shininess: 100,
            transparent: true,
            reflectivity: 10,
            emissiveIntensity: 1,
            emissive: 0xFFFF00
        });
        this.frame.material.color = new THREE.Color(0xffff00);
        this.model.traverse((o) => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
            }
        });
        this.model.children[0].children[2].material = this.material;

        this.weapon = new Weapon({
            scale: this.scale,
            ownerid: this.id,
            projectileColor: this.projectileColor,
            accuracyMultiplier: 1,
            damage: 25
        }, this);
        this.mesh.add(this.weapon.mesh);
    }

    setGhost() {
        this.material.transparent = true;
        this.ghost = true;
    }

    update(delta) {
        this.weapon.update(delta);

        if (this.jumping) {
            if (Math.abs(this.velocity.y) <= 0.0001) {
                this.jumping = false;
            }
        }
        if (this.hasTargetLocation) {
            this.mesh.translateX(this.targetLocation.x * delta * this.speed); //position.lerp(this.targetLocation, delta);
            //this.mesh.translateY(this.targetLocation.y * delta * this.speed);

            this.mesh.translateZ(this.targetLocation.z * delta * this.speed);
            this.targetLocation.set(0, 0, 0);
            this.hasTargetLocation = false;
        }
        if (this.rotationAxis != null) {
            let dir = 1;
            switch (this.rotationDirection) {
                case DIRECTIONS.LEFT:
                    break;
                case DIRECTIONS.RIGHT:
                    dir = -1;
                    break;
                default:
                    break;
            }
            this.mesh.rotateY((dir * (this.rotationFactor / 8)) * this.rotationSpeed * delta);
            this.rotationAxis = null;
        }
        if (this.weaponRotation != null) {
            let dir = 1;
            /* switch (this.weaponRotationDirection) {
                case DIRECTIONS.UP:
                    dir = -1;
                    break;
                case DIRECTIONS.DOWN:
                    break;
                default:
                    break;
            } */
            this.weapon.mesh.rotateX((dir * (this.weaponRotation / 8)) * this.rotationSpeed * delta)
            if (Math.abs(this.weapon.mesh.rotation.x) > Math.PI / 8) this.weapon.mesh.rotateX((-dir * (this.weaponRotation / 12)) * this.rotationSpeed * delta)
            this.weaponRotation = null;

        }
        if (this.targetLookLocation != null) {
            this.turnTowardTarget(delta);

        }
        if (this.targetSmoothRotation != null) {
            let r = this.turnTowardQuaternion(this.targetSmoothRotation, delta);
            if (r) {
                this.targetSmoothRotation = null;
            }
        }
        if (this.health <= 0) {
            this.die();
        }
        if (this.healthBar) {
            this.healthBar.scale.setX(this.health / this.maxHealth);
            this.healthBar.material.color.set(this.healthBarColor.clone().lerp(new THREE.Color('red'), 1 - (this.health / this.maxHealth)));
            this.healthBar.lookAt(game.camera.position);
        }
    }

    lookAt(target) {
        this.targetLookLocation = target;
        let currentEuler = this.mesh.rotation.clone();
        this.mesh.lookAt(target);
        this.targetRotation = this.mesh.rotation.clone();
        this.mesh.rotation.set(currentEuler.x, currentEuler.y, currentEuler.z);
    }

    /**
     * 
     * @param {THREE.Vector3} target 
     */
    lookAtLevel(target) {
        this.targetLookLocation = target.clone();
        this.targetLookLocation.setY(this.mesh.position.y);
        let currentEuler = this.mesh.rotation.clone();
        this.mesh.lookAt(this.targetLookLocation);
        //this.mesh.rotation.set(currentEuler.x, currentEuler.y, this.mesh.rotation.z);
        this.targetRotation = this.mesh.rotation.clone();
        this.mesh.rotation.set(currentEuler.x, currentEuler.y, currentEuler.z);
    }

    turnTowardTarget(delta) {
        let targetRotationQuaternion = (new THREE.Quaternion()).setFromEuler(this.targetRotation);
        let r = this.turnTowardQuaternion(targetRotationQuaternion, delta);
        if (r) this.target = null;
    }

    turnTowardQuaternion(target, delta) {
        let start = (new THREE.Quaternion()).setFromEuler(this.mesh.rotation);
        start.rotateTowards(target, this.rotationSpeed * delta);
        this.mesh.rotation.setFromQuaternion(start);
        let amtCompleted = (start.clone()).dot(target);
        if (amtCompleted > 0.999) {
            return true;
        } else {
            return false;
        }
    }

    rotateSmooth(direction, movement) {
        //if (this.rotationSpeed < Math.PI * 1.5) this.rotationSpeed += 0.005
        let axis = new THREE.Vector3();
        switch (direction) {
            case DIRECTIONS.RIGHT:
                this.rotateOnAxis(new THREE.Vector3(0, 1, 0), DIRECTIONS.RIGHT, movement);
                break;
            case DIRECTIONS.LEFT:
                this.rotateOnAxis(new THREE.Vector3(0, 1, 0), DIRECTIONS.LEFT, movement);
                break;
                /* case DIRECTIONS.UP:
                    //this.rotateOnAxis(new THREE.Vector3(1, 0, 0), DIRECTIONS.UP, movement);
                    this.rotateWeapon(DIRECTIONS.UP, movement);
                    break;
                case DIRECTIONS.DOWN:
                    this.rotateWeapon(DIRECTIONS.DOWN, movement);
                    //this.rotateOnAxis(new THREE.Vector3(1, 0, 0), DIRECTIONS.DOWN, movement);
                    break; */
            default:
                break;
        }
    }

    rotateWeapon(direction, movement) {
        this.weaponRotation = movement;
        this.weaponRotationDirection = direction;
    }

    rotateOnAxis(axis, direction, movement) {
        this.rotationAxis = axis;
        this.rotationFactor = Math.abs(movement);
        this.rotationDirection = direction;
    }

    move(direction) {
        let forward = new THREE.Vector3();
        let mesh = this.mesh.clone();

        switch (direction) {
            case DIRECTIONS.UP:
                //forward.add(new THREE.Vector3(0, Math.PI / 2, 0));
                break;
            case DIRECTIONS.DOWN:
                mesh.rotateY(Math.PI);
                //forward.add(new THREE.Vector3(0, -0, 0));
                break;
            case DIRECTIONS.LEFT:
                mesh.rotateY(Math.PI / 2);
                break;
            case DIRECTIONS.RIGHT:
                mesh.rotateY(-Math.PI / 2);
                break;
            default:
                break;
        }
        mesh.getWorldDirection(forward);
        //forward.normalize();

        let speed = this.speed;
        let dir = new THREE.Vector3(speed, speed, speed);
        forward.multiply(dir);
        forward.setY(0);
        this.velocity.add(forward);
        if (Math.abs(this.velocity.x) > speed) {
            this.velocity.setX(speed * (this.velocity.x / Math.abs(this.velocity.x)))
        }
        if (Math.abs(this.velocity.z) > speed) {
            this.velocity.setZ(speed * (this.velocity.z / Math.abs(this.velocity.z)))
        }
        if (Math.abs(this.velocity.y) > speed) {
            this.velocity.setY(speed * (this.velocity.y / Math.abs(this.velocity.y)))
        }
        /* this.velocity.setX(forward.x);
        this.velocity.setZ(forward.z); */

        /* this.targetLocationCounter = this.targetLocation.clone();
        this.hasTargetLocation = true; */
    }

    jump() {
        if (!this.jumping && this.velocity.y < this.jumpVelocity) {
            this.jumping = true;
            this.velocity.y += this.jumpVelocity;
        }
    }

    hit(damage) {
        if (this.dead) return;
        this.health -= damage;
        this.damage = damage;
    }

    die() {
        this.dead = true;
        this.mesh.remove(this.healthBar);
        delete this.healthBar;
        this.weapon.die();
    }

    /**
     * 
     * @param {THREE.Vector3} rotationVector 
     */
    rotateToVector(rotationVector) {
        this.rotationVector.add(rotationVector);
    }

    toggleAuto() {
        this.weapon.autoFire = !this.weapon.autoFire;
    }

    fire() {
        if (this.dead) return false;
        this.weapon.fire();
        return true;
    }
}