class World {
    /**
     * Definitions
     */
    scale = new THREE.Vector3();
    size = {
        x: 200,
        z: 200
    }
    halfExtents = {
        x: this.size.x / 2,
        z: this.size.z / 2
    }
    /**
     * @type {THREE.Group}
     */
    mesh = null;

    walls = [];
    wallInfo = [{
            position: [0, -4.5, -100],
            size: [200, 20, 10]
        },
        {
            position: [-100, -4.5, 0],
            size: [10, 20, 200]
        },
        {
            position: [100, -4.5, 0],
            size: [10, 20, 200]
        },
        {
            position: [0, -4.5, 100],
            size: [200, 20, 10]
        }
        /* ,
                {
                    position: [0, -4.5, 0],
                    size: [100, 10, 10]
                } */
    ]

    constructor(_scale) {
        if (_scale) this.scale = _scale;
        this.mesh = new THREE.Group();
        this.floor = new THREE.Mesh(new THREE.BoxBufferGeometry(200, 1, 200), new THREE.MeshPhongMaterial({
            color: 0x333333,
            /* wireframe: true, */
            /* emissive: 0x021CA4,
            emissiveIntensity: 0.1 */
        }));
        for (let info of this.wallInfo) {
            let wall = new THREE.Mesh(new THREE.BoxBufferGeometry(info.size[0], info.size[1], info.size[2]), new THREE.MeshPhongMaterial({
                color: 0xaa5555,
                /* wireframe: true, */
                emissive: 0x021CA4,
                emissiveIntensity: 0.2
            }));
            wall.receiveShadow = true;
            wall.position.set(info.position[0], info.position[1], info.position[2]);
            this.mesh.add(wall);
        }
        this.floor.receiveShadow = true;
        this.floor.position.set(0, -10, 0);
        this.mesh.add(this.floor);
        this.dirLight = new THREE.DirectionalLight(0x021CA4, 2);
        this.dirLight.position.set(0, -1, 0);
        /* this.dirLight.castShadow = game.shadowsEnabled;
        this.dirLight.shadow.mapSize.width = game.shadowMapSize; // default is 512
        this.dirLight.shadow.mapSize.height = game.shadowMapSize; // default is 512 */
        //this.mesh.add(this.dirLight);
    }

    /**
     * Functions
     */

    inMap(location) {
        return (Math.abs(location.x) < this.halfExtents.x && Math.abs(location.z) < this.halfExtents.z);
    }
}