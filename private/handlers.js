function addHandlers() {
    document.onmousemove = function (e) {
        game.input.onmousemove(e);
    }

    document.onkeydown = function (e) {
        game.input.onkeydown(e);
    }
    document.onkeyup = function (e) {
        game.input.onkeyup(e);
    }

    document.onmousedown = function (e) {
        game.input.onmousedown(e);
    }

    document.onmouseup = function (e) {
        game.input.onmouseup(e);
    }

    document.oncontextmenu = function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        return false;
    }

    window.onresize = function () {
        game.resize();
    }

    game.renderer.domElement.requestPointerLock = game.renderer.domElement.requestPointerLock ||
        // @ts-ignore
        game.renderer.domElement.mozRequestPointerLock;

    document.exitPointerLock = document.exitPointerLock ||
        // @ts-ignore
        document.mozExitPointerLock;

    game.renderer.domElement.onclick = function () {
        game.renderer.domElement.requestPointerLock();
    };
}