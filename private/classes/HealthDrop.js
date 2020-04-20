class HealthDrop extends Drop {
    constructor(position, color = 0xFFFF00) {
        super(position, color);
        this.material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 1,
            wireframe: false,
            transparent: true
        });
        this.mesh = game.crossModel.clone();

        this.mesh.traverse((o) => {
            if (o.isMesh) {
                o.castShadow = game.shadowsEnabled;
                o.receiveShadow = game.shadowsEnabled;
                o.material = this.material
            }
        });
        this.mesh.position.set(position.x, position.y, position.z);
    }

    onpickup(player) {
        super.onpickup(player);
        player.health = player.maxHealth;
        game.sm.sounds.max_health.play();
    }
}