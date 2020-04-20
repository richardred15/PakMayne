class Bot extends Player {
    /**
     * Definitions
     */
    /**
     * @type {Player}
     */
    target = null;
    playerTarget = null;
    evading = false;
    evasionDirection = randInt(3, 4);
    hitCooldown = 1;
    hitCooldownCounter = 0;
    isBot = true;
    colors = [0xff0000, 0xffaaaa, 0xaaccff, 0xffaa00];
    /**
     * 
     * @param {Player} target 
     * @param {number} scale 
     * @param {THREE.Mesh} model
     */
    constructor(target, scale = 1, model) {
        super(scale, model);
        this.isBot = true;
        this.playerTarget = target;
        this.weapon.autoFireDelay = randFloat(0.5, 3);
        this.weapon.autoFire = true;
        this.accuracy = 0.05;
        this.speed = 8 * this.scale;
        this.sm.loadSound("audio/ghost_death.wav");
    }

    /**
     * Functions
     */

    init() {
        this.colors = [0xFF0000, 0xFFC0CB, 0x00FFFF, 0xFFA500];
        let color = this.colors[randInt(0, 4)];
        this.material = new THREE.MeshPhongMaterial({
            color: 0xFFC0CB,
            opacity: 0.6,
            shininess: 0.1
        });
        this.eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            opacity: 0.6,
            emissive: color,
            emissiveIntensity: 5
            //shininess: 0
        });
        this.frame.material.color = this.material.color;
        //BODY
        this.model.children[0].material = this.material;
        this.model.children[1].material = this.eyeMaterial;
        this.model.children[2].material = this.material;
        this.model.children[3].material = this.eyeMaterial;
        this.model.children[4].material = this.material;
        this.projectileColor = 0xff0000;
        this.weapon = new Weapon({
            scale: this.scale,
            ownerid: this.id,
            projectileColor: this.projectileColor,
            accuracyMultiplier: 10
        }, this);
        this.model.traverse((o) => {
            if (o.isMesh) {
                o.castShadow = game.shadowsEnabled;
                o.receiveShadow = game.shadowsEnabled;
            }
        });
        this.mesh.add(this.weapon.mesh);
        this.weapon.autoFireDelay = randFloat(0.3, 0.8);

    }

    hit(damage) {
        super.hit(damage);

        if (!this.evading) {
            this.evasionDirection = randInt(3, 5);
            if (randInt(1, 25) == 5) this.evasionDirection = 5;
            this.hitCooldownCounter = 0;
            this.evading = true;
        }
    }

    setGhost() {
        super.setGhost();
        this.sm.sounds["ghost_death"].play();
        //this.material.opacity = 0.2;
        //this.eyeMaterial.opacity = 0.2;
    }

    update(delta) {
        super.update(delta);
        if (this.playerTarget.dead && !this.dead) {
            let pos = this.mesh.position;
            let closestP = null;
            let closest = Infinity;
            for (let b in game.bots) {
                let bot = game.bots[b];
                if (bot.id == this.id || bot.dead) continue;
                let d = bot.mesh.position.distanceTo(pos);
                if (d < closest) {
                    closest = d;
                    closestP = bot;
                }
            }
            if (closestP != null) {
                this.playerTarget = closestP;
            } else {
                this.material.color = new THREE.Color('blue');
                this.weapon.autoFire = false;
                this.die();
                /* setTimeout(() => {
                    window.location.reload()
                }, 3000); */
            }
        }
        if (!this.dead) {
            if (!game._paused) {
                this.lookAtLevel(this.playerTarget.mesh.position);
                let distance = this.mesh.position.distanceTo(this.playerTarget.mesh.position);
                //let y = this.mesh.position.y;
                if (distance < 9 * game.scale) {
                    this.move(DIRECTIONS.DOWN);
                } else if (distance > 11 * game.scale) {
                    this.move(DIRECTIONS.UP);
                }
                //this.mesh.position.y = y;
                if (this.evading) {
                    if (this.evasionDirection == 5) {
                        this.jump();
                        this.evading = false;
                    } else {
                        if (this.hitCooldownCounter < this.hitCooldown) {
                            this.move(this.evasionDirection);
                            this.hitCooldownCounter += delta;
                        } else this.evading = false;
                    }
                }
            }
        } else {
            this.mesh.position.setY(this.mesh.position.y + 0.2);
            if (this.material.opacity > 0 || this.eyeMaterial.opacity > 0) {
                this.material.opacity -= 0.008;
                this.eyeMaterial.opacity -= 0.008;
            }
            this.despawnTimer -= delta;
            if (this.despawnTimer <= 0) {
                game.scene.remove(this.mesh);
                delete game.bots[this.id];
            }
        }
        /* if (this.targetLookLocation != null) {
            let weaponLookLocation = this.playerTarget.mesh.position.clone();
            //if (weaponLookLocation.z - (this.scale) > this.mesh.position.z) {
            this.weapon.mesh.lookAt(weaponLookLocation);
            if (Math.abs(this.weapon.mesh.rotation.z) > 45) {
                this.weapon.mesh.rotation.set(this.mesh.rotation.x, this.mesh.rotation.y, (this.weapon.mesh.rotation.z / Math.abs(this.mesh.rotation.z) * 45));
            }
            //}
        } */
    }

    die() {
        super.die();
    }

    fire() {
        if (super.fire()) {} else {
            return false;
        }
        return true;
    }
}