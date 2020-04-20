class AmmoDrop extends Drop {
    constructor(position, color = 0xFF0000) {
        super(position, color);
        this.material = new THREE.MeshPhongMaterial({
            color: 0x333333,
            emissive: 0x333333,
            emissiveIntensity: 1,
            opacity: 1,
            transparent: true
        });
        this.innerMaterial = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 1,
            opacity: 1,
            transparent: true
        });
        this.mesh = game.ammoModel.clone();
        this.mesh.traverse((o) => {
            if (o.isMesh) {
                o.castShadow = game.shadowsEnabled;
                o.receiveShadow = game.shadowsEnabled;
                o.material = o.material.clone();
                /* o.material.map = o.material.map.clone(); */
                o.material.transparent = true;
            }
        });
        this.myLifeTime = 10;
        //model.children[0].material = this.innerMaterial;
        //model.children[1].material = this.material;
        this.mesh.position.set(position.x, position.y, position.z);
    }

    update(delta) {
        super.update(delta);
    }

    onpickup(player) {
        super.onpickup(player);
        player.weapon.currentAmmo = player.weapon.defaultAmmo;
        game.sm.sounds.full_ammo.play();
    }

}