/* importScripts('libraries/ammo.js');

Ammo().then(function (Ammo) {
    let bodies = [];

    var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    var overlappingPairCache = new Ammo.btDbvtBroadphase();
    var solver = new Ammo.btSequentialImpulseConstraintSolver();
    var dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

    var groundShape = new Ammo.btBoxShape(new Ammo.btVector3(100, 1, 100));
    var groundTransform = new Ammo.btTransform();
    groundTransform.setIdentity();
    groundTransform.setOrigin(new Ammo.btVector3(0, -10, 0));

    (function () {
        var mass = 0;
        var localInertia = new Ammo.btVector3(0, 0, 0);
        var myMotionState = new Ammo.btDefaultMotionState(groundTransform);
        var rbInfo = new Ammo.btRigidBodyConstructionInfo(0, myMotionState, groundShape, localInertia);
        var body = new Ammo.btRigidBody(rbInfo);

        dynamicsWorld.addRigidBody(body);
        bodies.push(body);
    })();

    var boxShape = new Ammo.btBoxShape(new Ammo.btVector3(1, 1, 1));

    var startTransform = new Ammo.btTransform();
    startTransform.setIdentity();
    var mass = 1;
    var localInertia = new Ammo.btVector3(0, 0, 0);
    boxShape.calculateLocalInertia(mass, localInertia);

    var myMotionState = new Ammo.btDefaultMotionState(startTransform);
    var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, boxShape, localInertia);
    var body = new Ammo.btRigidBody(rbInfo);

    dynamicsWorld.addRigidBody(body);
    bodies.push(body);

    function simulate(delta) {
        delta = delta || 1;

        dynamicsWorld.stepSimulation(delta, 2);

        /* var alpha;
        if (meanDt > 0) {
            alpha = Math.min(0.1, delta / 1000);
        } else {
            alpha = 0.1; // first run
        }
        meanDt = alpha * delta + (1 - alpha) * meanDt;

        var alpha2 = 1 / frame++;
        meanDt2 = alpha2 * delta + (1 - alpha2) * meanDt2; *

        var data = {
            objects: [],
            //currFPS: Math.round(1000 / meanDt),
            //allFPS: Math.round(1000 / meanDt2)
        };
        let objects = [];
        readBulletObject(1, objects);
        data.objects = objects;
        postMessage(data);

    }
    var transform = new Ammo.btTransform(); // taking this out of readBulletObject reduces the leaking
    function readBulletObject(i, object) {
        var body = bodies[i];
        body.getMotionState().getWorldTransform(transform);
        var origin = transform.getOrigin();
        object[0] = origin.x();
        object[1] = origin.y();
        object[2] = origin.z();
        var rotation = transform.getRotation();
        object[3] = rotation.x();
        object[4] = rotation.y();
        object[5] = rotation.z();
        object[6] = rotation.w();
    }

    onmessage = function (e) {
        let data = e.data;

        body.

        simulate();
    }
}); */