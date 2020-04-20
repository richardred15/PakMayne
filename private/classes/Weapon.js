class Weapon {
    damage = 5;
    defaultAmmo = 100;
    defaultMagazine = 20;
    currentAmmo = 100;
    magazine = 20;
    autoFire = false;
    autoFireDelay = 0.1;
    autoFireCount = 0;
    soundDelay = 0.15;
    soundDelayCount = 0;
    pointer = null;
    /**
     * @type {Projectile[]}
     */
    projectiles = [];
    deadProjectiles = [];
    accuracy = 0.01;
    dead = false;
    reloading = false;
    reloadTime = 0.5;
    reloadTimeCounter = 0;
    defaultOptions = {
        scale: 1,
        ownerid: 0,
        projectileColor: 0x000000,
        weaponColor: 0xf0f0f0,
        accuracyMultiplier: 1,
        damage: 5
    }
    options = this.defaultOptions;

    /**
     * @type {Player}
     */
    owner = null;
    /**
     * @type {THREE.SpotLight}
     */
    dirLight = null;
    /**
     * 
     * @param {object} options 
     */
    constructor(options, owner) {
        for (let opt in options) {
            this.options[opt] = options[opt];
        }
        this.owner = owner;
        this.scale = this.options.scale;
        this.damage = this.options.damage;
        this.projectileColor = this.options.projectileColor;
        this.accuracy = this.accuracy * this.options.accuracyMultiplier;
        this.ownerid = this.options.ownerid;
        this.mesh = new THREE.Group();
        this.mesh.position.set(2, 0, 2);
        this.geometry = new THREE.BoxBufferGeometry(this.scale / 5, this.scale / 5, this.scale);
        this.mesh.castShadow = game.shadowsEnabled;

        this.body = new THREE.Mesh(this.geometry, new THREE.MeshPhongMaterial({
            color: 0x000000
        }));

        this.mesh.add(this.body);
        var material = new THREE.LineBasicMaterial({
            color: 0xff0000,
            transparent: true
        });

        var geo = new THREE.Geometry();
        geo.vertices.push(
            new THREE.Vector3(0, 0, 5 * this.scale),
            new THREE.Vector3(0, 0, 0)
        );

        this.pointer = new THREE.Line(geo, material);
        this.mesh.add(this.pointer);

        this.id = Math.random().toString();
    }

    update(delta) {

        if (this.reloading) {
            this.reloadTimeCounter += delta;
            if (this.reloadTimeCounter > this.reloadTime) {
                let bullets = this.defaultMagazine;
                bullets -= this.magazine;
                if (this.currentAmmo < bullets) {
                    bullets = this.currentAmmo;
                }
                this.magazine += bullets;
                this.currentAmmo -= bullets;
                this.mesh.rotateX(Math.PI / 4);
                this.pointer.material.opacity = 1;
                this.reloadTimeCounter = 0;
                this.reloading = false;

            }
        }
        this.soundDelayCount += delta;
        for (let projid in this.projectiles) {
            let projectile = this.projectiles[projid];
            projectile.update(delta);
            if (projectile.dead) {
                delete this.projectiles[projid];
            }
        }
        this.autoFireCount += delta;
        if (this.autoFire) this.fire();
    }

    reload() {
        if (!this.reloading && this.magazine < this.defaultMagazine && this.currentAmmo > 0) {
            this.reloading = true;
            this.mesh.rotateX(-Math.PI / 4);
            this.pointer.material.opacity = 0;
            this.owner.sm.sounds.reload.play();
        }
    }

    addFlashlight() {
        this.dirLight = new THREE.DirectionalLight(0xffffff, 1);
        this.dirLight.position.set(0, 1, 0);
        this.dirLight.castShadow = game.shadowsEnabled;
        this.dirLight.shadow.mapSize.width = game.shadowMapSize; // default is 512
        this.dirLight.shadow.mapSize.height = game.shadowMapSize; // default is 512
        //this.dirLight.rotateZ(Math.PI / 2);
        //this.dirLight.setRotationFromMatrix(this.mesh.matrix);
        //this.mesh.add(this.dirLight);
    }

    live() {
        this.dead = false;
    }

    die() {
        this.dead = true;
        this.autoFire = false;
        this.autoFireCount = 0;
        this.deleteAllProjectiles();
    }

    deleteAllProjectiles() {
        for (let projid in this.projectiles) {
            let projectile = this.projectiles[projid];
            projectile.die();
            game.scene.remove(projectile.mesh);
            delete this.projectiles[projid];
        }
    }

    fire() {
        if (this.dead || this.reloading) return false;
        if (this.autoFireCount < this.autoFireDelay) {

        } else {
            this.autoFireCount = 0;
            if (this.magazine == 0) {
                this.reload();
            } else {
                this.magazine--;
                this.createProjectile();
                if (this.soundDelayCount > this.soundDelay) {
                    this.soundDelayCount = 0;
                    this.owner.sm.sounds.laser.currentTime = 0;
                    this.owner.sm.sounds.laser.play();
                }
                if (this.magazine == 0)
                    this.reload();
            }
        }

    }

    createProjectile() {
        let projectile = new Projectile(this.scale, this.projectileColor, this.damage, this.ownerid);
        projectile.mesh.applyMatrix(this.mesh.matrixWorld);
        //projectile.mesh.setRotationFromEuler(this.mesh.rotation);
        projectile.mesh.rotateY(Math.PI);
        projectile.mesh.rotateX(randFloat(-this.accuracy, this.accuracy));
        projectile.mesh.rotateY(randFloat(-this.accuracy, this.accuracy));
        projectile.mesh.rotateZ(randFloat(-this.accuracy, this.accuracy));
        projectile.mesh.translateZ(-2);
        //this.newProjectile = projectile;
        this.projectiles[projectile.id] = projectile;
        game.scene.add(projectile.mesh);
        game.worker.postMessage({
            type: "projectile",
            id: projectile.id,
            ownerid: this.ownerid,
            position: game.vectorQuatToObject(projectile.mesh.position),
            quaternion: game.vectorQuatToObject(projectile.mesh.quaternion),
            velocity: projectile.velocity,
            damage: projectile.damage
        });
    }
}