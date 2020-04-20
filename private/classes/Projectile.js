class Projectile {
    /**
     * Definitions
     */
    damage = 25;
    /**
     * @type {THREE.Group}
     */
    mesh = null;
    /**
     * @type {THREE.BufferGeometry}
     */
    geometry = null;
    /**
     * @type {THREE.Material}
     */
    material = null;
    materialColor = 0xff0000;
    /**
     * @type {THREE.Mesh}
     */
    body = null;
    /**
     * @type {THREE.Light}
     */
    light = null;
    /**
     * Length of projectile's life in seconds
     * @type {number}
     */
    lifetime = 2;
    dead = false;
    speed = 100;
    velocity = this.speed;
    id = "";
    ownerid = "";

    constructor(scale = 1, materialColor, damage = 5, ownerid) {
        this.ownerid = ownerid;
        this.damage = damage;
        this.materialColor = materialColor;
        this.mesh = new THREE.Group();
        this.geometry = new THREE.SphereBufferGeometry(0.1 * scale);
        this.material = new THREE.MeshPhongMaterial({
            color: this.materialColor,
            emissive: this.materialColor,
            emissiveIntensity: 10
        });
        /* this.light = new THREE.PointLight(this.materialColor, 1, 10, 0.5);
        this.mesh.add(this.light); */
        this.body = new THREE.Mesh(this.geometry, this.material);
        this.mesh.add(this.body);
        let frame = new THREE.Mesh(new THREE.SphereBufferGeometry(0.3 * scale), new THREE.MeshBasicMaterial({
            wireframe: true,
            color: this.materialColor
        }));
        this.mesh.add(frame);
        this.id = Math.random().toString();
        this.speed *= scale;
        this.velocity = this.speed; //new THREE.Vector3(0, 0, -this.speed);
        game.totalProjectiles++;
    }

    /**
     * Functions
     */

    update(delta) {
        if (this.dead) return;
        /* this.checkCollision();
        this.move(delta); */

        this.lifetime -= delta;
        if (this.lifetime <= 0) {
            this.die();
        }
    }

    die() {
        if (!this.dead) game.totalProjectiles--;
        game.scene.remove(this.mesh);
        game.worker.postMessage({
            type: "killProjectile",
            id: this.id,
            ownerid: this.ownerid
        });
        this.dead = true;
    }

    move(delta) {
        //this.mesh.translateZ(-this.speed * delta);
    }

    checkCollision() {}
}