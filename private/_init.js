/**
 * Definitions
 */

/**
 * @type {Game}
 */
let game;
let initInterval;

/**
 * Functions
 */

function init() {
    game = new Game();
    game.load();
    initInterval = setInterval(function () {
        if (game.playerModelLoaded && game.botModelLoaded && game.ammoModelLoaded && game.ammoModelLoaded) {
            game.ready = true;
            clearInterval(initInterval);
            game.init();
            addHandlers();

            game.start();
            run()
        }
    }, 500);
}

function run() {
    game.render();
    requestAnimationFrame(run);
    //setTimeout(run, 1000 / game.frameRate);
}

setTimeout(init, 0);
/* setTimeout(() => {
    window.location.reload()
}, 120000); */