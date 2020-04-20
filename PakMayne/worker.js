importScripts('libraries/cannon.js');
// Setup our world
var world = new CANNON.World();
world.gravity.set(0, 0, -9.82); // m/s²

/**
 * @type {CANNON.Body[]}
 */
let players = [];
let bots = [];
let projectiles = [];

let scale = 1;

let GROUP1 = 1;
let GROUP2 = 2;
let GROUP3 = 4;
/**
 * 
 * @param {CANNON.Vec3} position 
 * @param {CANNON.Quaternion} quaternion 
 */
function createPlayerBody(position, quaternion) {
    return new CANNON.Body({
        mass: 200, // kg
        position: new CANNON.Vec3(position.x, position.z, position.y), // m
        shape: new CANNON.Box(new CANNON.Vec3(0.5 * scale, 0.5 * scale, 0.5 * scale)),
        quaternion: new CANNON.Quaternion(quaternion.x, quaternion.z, quaternion.y, quaternion.w).inverse(),
        fixedRotation: true,
        collisionFilterGroup: GROUP2,
        collisionFilterMask: GROUP1 | GROUP2 | GROUP3
    });
}

/**
 * 
 * @param {CANNON.Vec3} position 
 * @param {CANNON.Quaternion} quaternion 
 */
function createProjectileBody(position, quaternion) {
    let body = new CANNON.Body({
        mass: 1, // kg
        position: new CANNON.Vec3(position.x, position.z, position.y), // m
        shape: new CANNON.Sphere(0.3 * scale),
        quaternion: new CANNON.Quaternion(quaternion.x, quaternion.z, quaternion.y, quaternion.w).inverse(),
        collisionFilterGroup: GROUP1,
        collisionFilterMask: GROUP2 | GROUP3
    });
    return body;
}

function newProjectile(data) {
    let projectileBody = createProjectileBody(data.position, data.quaternion);
    var localForward = new CANNON.Vec3(0, -1, 0); // correct?
    var worldForward = new CANNON.Vec3();
    projectileBody.vectorToWorldFrame(localForward, worldForward);
    worldForward = worldForward.mult(data.velocity);
    projectileBody.velocity = worldForward;
    // @ts-ignore
    projectileBody.customID = data.id;
    // @ts-ignore
    projectileBody.isProjectile = true;
    // @ts-ignore
    projectileBody.damage = data.damage;
    // @ts-ignore
    projectileBody.ownerID = data.ownerid;
    // @ts-ignore
    projectileBody.customType = "projectile";
    // @ts-ignore
    projectileBody.dead = false;
    projectileBody.addEventListener("collide", function (e) {
        if (e.body.customType == "wall" && e.target.customType == "projectile") {
            e.target.dead = true;
        }
        if (!e.target.dead && e.body.customID != e.target.customID && e.body.customID != undefined && e.body.isProjectile != true && e.target.ownerID != e.body.customID) {
            //console.log(e.body.customID, e.target.customID, e.body.isProjectile, e.target.isProjectile);
            e.target.dead = true;
            // @ts-ignore
            postMessage({
                type: "hit",
                targetType: e.body.customType,
                id: e.body.customID,
                projectileid: e.target.customID,
                ownerid: e.target.ownerID,
                damage: e.target.damage
            });

            //
        }

    });
    world.addBody(projectileBody);
    if (projectiles[data.ownerid] == undefined) projectiles[data.ownerid] = [];
    projectiles[data.ownerid][data.id] = projectileBody;
}

function newPlayer(data) {
    let playerBody = createPlayerBody(data.position, data.quaternion);
    // @ts-ignore
    playerBody.customID = data.id;
    // @ts-ignore
    playerBody.customType = "player";
    world.addBody(playerBody);
    players[data.id] = playerBody;
}

function newBot(data) {
    let botBody = createPlayerBody(data.position, data.quaternion);
    // @ts-ignore
    botBody.customID = data.id;
    // @ts-ignore
    botBody.customType = "bot";
    world.addBody(botBody);
    bots[data.id] = botBody;
}

onmessage = function (e) {
    let data = e.data;
    //console.log(data);
    switch (data.type) {
        case "init":
            if (data.scale) scale = data.scale;
            //console.log(scale);
            if (data.players) {
                for (let player of data.players) {
                    newPlayer(player);
                }
            }
            if (data.bots) {
                for (let bot of data.bots) {
                    newBot(bot);
                }
            }
            //console.log(data);
            break;
        case "simulate":
            update(data);
            simulate(data.delta);
            post();
            break;
        case "projectile":
            newProjectile(data);
            break;
        case "killProjectile":
            if (projectiles[data.ownerid] && projectiles[data.ownerid][data.id]) {
                world.remove(projectiles[data.ownerid][data.id]);
                delete projectiles[data.ownerid][data.id];
            }
            break;
        case "killPlayer":
            world.remove(players[data.id]);
            delete players[data.id];
            break;
        case "killBot":
            //console.log(data.id);
            world.remove(bots[data.id]);
            delete bots[data.id];
            break;
        default:
            break;
    }
}


function update(data) {
    for (let player of data.players) {
        if (players[player.id] != undefined) {
            let p = players[player.id];
            p.position.set(player.position.x, player.position.z, player.position.y);
            p.quaternion.set(player.quaternion.x, player.quaternion.z, player.quaternion.y, player.quaternion.w);
            p.velocity.set(player.velocity.x, player.velocity.z, player.velocity.y);
            /* p.inertia.set(0, 0, 0);
            p.invInertia.set(0, 0, 0); */
        }
    }
    for (let bot of data.bots) {
        if (bots[bot.id] != undefined) {
            let b = bots[bot.id];
            b.position.set(bot.position.x, bot.position.z, bot.position.y);
            b.quaternion.set(bot.quaternion.x, bot.quaternion.z, bot.quaternion.y, bot.quaternion.w);
            b.velocity.set(bot.velocity.x, bot.velocity.z, bot.velocity.y);
        }
    }
    /* for (let projectile of data.projectiles) {
        if (projectiles[projectile.ownerid] != undefined) {
            let pr = projectiles[projectile.id];
            pr.position.set(projectile.position.x, projectile.position.z, projectile.position.y);
            pr.quaternion.set(projectile.quaternion.x, projectile.quaternion.z, projectile.quaternion.y, projectile.quaternion.w);
            pr.velocity.set(projectile.velocity.x, projectile.velocity.z, projectile.velocity.y);
        }
    } */
}


function post() {
    let pData = [];
    for (let id in players) {
        let player = players[id];
        pData.push({
            id: id,
            position: vectorQuatToObject(player.position),
            quaternion: vectorQuatToObject(player.quaternion),
            velocity: vectorQuatToObject(player.velocity)
        });
    }
    let bData = [];
    for (let id in bots) {
        let bot = bots[id];
        bData.push({
            id: id,
            position: vectorQuatToObject(bot.position),
            quaternion: vectorQuatToObject(bot.quaternion),
            velocity: vectorQuatToObject(bot.velocity)
        });
    }
    let prData = [];
    for (let ownerid in projectiles) {
        let owner = projectiles[ownerid];
        for (let id in owner) {
            let projectile = owner[id];
            prData.push({
                id: id,
                ownerid: ownerid,
                position: vectorQuatToObject(projectile.position),
                quaternion: vectorQuatToObject(projectile.quaternion),
                dead: projectile.dead
                //velocity: vectorQuatToObject(projectile.velocity)
            });
        }
    }
    //console.log(prData);
    // @ts-ignore
    postMessage({
        type: "update",
        players: pData,
        bots: bData,
        projectiles: prData
    });
}


function vectorQuatToObject(vectorQuat) {
    let arr = vectorQuat.toArray();
    let obj = {};
    if (arr.length == 4) {
        obj.w = arr[3];
    }
    obj.x = arr[0];
    obj.y = arr[2];
    obj.z = arr[1];
    return obj;
}


/* // Create a sphere
var radius = 1; // m
var playerBody = new CANNON.Body({
    mass: 1000, // kg
    position: new CANNON.Vec3(0, 10, 0), // m
    shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
});
var blockBody = new CANNON.Body({
    mass: 100,
    position: new CANNON.Vec3(0, 0, 0),
    shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
});
//playerBody.velocity.set(0, 10, 0);
//playerBody.quaternion.setFromEuler(1.57069632679523, 0, -0, "XYZ");
world.addBody(blockBody);
world.addBody(playerBody); */

var groundMaterial = new CANNON.Material("groundMaterial");
// Adjust constraint equation parameters for ground/ground contact
var ground_ground_cm = new CANNON.ContactMaterial(groundMaterial, groundMaterial, {
    friction: 0.01,
    restitution: 0.01,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
    frictionEquationStiffness: 1e8,
    // @ts-ignore
    frictionEquationRegularizationTime: 3
});
// Add contact material to the world
world.addContactMaterial(ground_ground_cm);
// ground plane
var groundShape = new CANNON.Plane();
var groundBody = new CANNON.Body({
    mass: 0,
    material: groundMaterial,
    position: new CANNON.Vec3(0, 0, -9.5),
    collisionFilterGroup: GROUP3,
    collisionFilterMask: GROUP1 | GROUP2 | GROUP3
});
groundBody.addShape(groundShape);
world.addBody(groundBody);

let wallMaterial = new CANNON.Material("wallMaterial");
let wall_cm = new CANNON.ContactMaterial(wallMaterial, wallMaterial, {
    friction: 1
});
world.addContactMaterial(wall_cm);

let walls = [];

let wallInfo = [{
        position: [0, -100, -4.5],
        size: [200, 10, 100]
    },
    {
        position: [-100, 0, -4.5],
        size: [10, 200, 100]
    },
    {
        position: [100, 0, -4.5],
        size: [10, 200, 100]
    },
    {
        position: [0, 100, -4.5],
        size: [200, 10, 100]
    }
    /* ,
        {
            position: [0, 0, -4.5],
            size: [100, 10, 10]
        } */
]

for (let info of wallInfo) {
    let wallShape = new CANNON.Box(new CANNON.Vec3(info.size[0] / 2, info.size[1] / 2, info.size[2] / 2));
    let wallBody = new CANNON.Body({
        mass: 0,
        material: wallMaterial,
        shape: wallShape,
        position: new CANNON.Vec3(info.position[0], info.position[1], info.position[2]),
        collisionFilterGroup: GROUP3,
        collisionFilterMask: GROUP1 | GROUP2 | GROUP3
    });
    // @ts-ignore
    wallBody.customType = "wall";
    world.addBody(wallBody);
    walls.push(wallBody);
    console.log("wall");
}

/* this.wall = new THREE.Mesh(new THREE.BoxBufferGeometry(200, 10, 1), new THREE.MeshBasicMaterial({
    color: 0xaa5555
}));
this.wall.receiveShadow = true;
this.wall.position.set(-0, -4.5, -100); */

var fixedTimeStep = 1.0 / 60.0; // seconds
var maxSubSteps = 3;

function simulate(delta) {
    world.step(fixedTimeStep, delta, maxSubSteps);
}

/* onmessage = function (e) {
    let data = e.data;
    playerBody.position.set(data.player.position.x, data.player.position.z, data.player.position.y);
    playerBody.quaternion.set(data.player.rotation.x, data.player.rotation.z, data.player.rotation.y, data.player.rotation.w);
    playerBody.velocity.set(data.player.velocity.x, data.player.velocity.z, data.player.velocity.y);
    //playerBody.angularVelocity.set(data.player.velocity[2], data.player.velocity[0], data.player.velocity[1]);
    simulate(data.delta);
    let rotation = playerBody.quaternion.toArray();
    let position = playerBody.position.toArray();
    // @ts-ignore
    postMessage({
        position: {
            x: position[0],
            y: position[2],
            z: position[1]
        },
        rotation: {
            x: rotation[0],
            y: rotation[2],
            z: rotation[1],
            w: rotation[3]
        },
        velocity: {
            x: playerBody.velocity.x,
            y: playerBody.velocity.z,
            z: playerBody.velocity.y
        }
    });
}
 */
/*
// Start the simulation loop
var lastTime;
(function simloop(time) {
    requestAnimationFrame(simloop);
    if (lastTime !== undefined) {
        var dt = (time - lastTime) / 1000;
        world.step(fixedTimeStep, dt, maxSubSteps);
    }
    console.log("Sphere z position: " + sphereBody.position.z);
    lastTime = time;
})(); */