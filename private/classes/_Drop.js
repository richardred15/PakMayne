class Drop {

    /**
     * @type {THREE.Group|THREE.Mesh}
     */
    mesh = null;
    /**
     * @type {THREE.Mesh}
     */
    sphere = null;
    /**
     * @type {THREE.Material}
     */
    material = null;
    /**
     * @type {THREE.Material}
     */
    sphereMaterial = null;
    /**
     * @type {THREE.Material}
     */
    crossMaterial = null;
    /**
     * @type {THREE.BufferGeometry}
     */
    geometry = null;

    pickedUp = false;
    myLifeTime = 10;
    myElapsedTime = 0;
    blinkSpeed = 10;
    constructor(position, color = 0xFFFF00) {

    }

    /**
     * 
     * @param {THREE.Vector3} location 
     * @returns {boolean}
     */
    isPickup(location) {
        let pickup = this.mesh.position.distanceTo(location) < game.scale;
        return pickup;
    }

    pickup(player) {
        this.pickedUp = true;
        this.onpickup(player);
    }

    update(delta) {
        this.mesh.position.setY(this.mesh.position.y + (Math.sin(this.myElapsedTime * 4) / 50));
        this.mesh.rotateY(delta);
        this.myElapsedTime += delta;
        if (this.myElapsedTime > this.myLifeTime) {
            this.pickedUp = true;
        } else if (this.myElapsedTime > (this.myLifeTime - 5)) {
            let op = Math.sin(this.myElapsedTime * this.blinkSpeed);
            this.setOpacity(op);
        }
    }

    setOpacity(op) {
        this.mesh.traverse(o => {
            if (o.isMesh) {
                o.material.opacity = op;
            }
        });
    }


    /**
     * 
     * @param {Player} player 
     */
    onpickup(player) {

    }
}