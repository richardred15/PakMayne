<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Game</title>
    <link rel="stylesheet" href="style.css" />
    <script>
        let version = "0.0.1.1415";
    </script>
    <script src="libraries/cannon.js"></script>
    <script src="libraries/three.min.js"></script>
    <script src="libraries/BufferGeometryUtils.js"></script>
    <script src="libraries/OrbitControl.js"></script>
    <script src="libraries/GLTFLoader.js"></script>
    <script src="libraries/MTLLoader.js"></script>
    <script src="libraries/OBJLoader.js"></script>
    <script src="game.min.js"></script>
</head>

<body>
    <div id="diagnostics">
        <div id="framerate">

        </div>
        <div id="physicsFrameRate"></div>
        <div id="objectCount"></div>
        <div id="engineObjects"></div>
    </div>
    <div id="info">
        <div id="health"></div>
        <div id="bots_left"></div>
        <div id="time_survived"></div>
        <div id="round"></div>
    </div>
    <div id="ammo"></div>
    <div id="menu">
        <div id="menu_container">
            <img src="images/logo.png">
            <button id="play" onclick="game.resume()">PLAY</button><br>
            <button id="quality_button" onclick="game.qualitySelector.parentElement.style.display= 'block'">SET
                QUALITY</button>
            <h4>Lowering the quality may help slower computers</h4>
            <div id="menu_info">
                <div>Controls:</div>
                <table>
                    <tr>
                        <td><button>[r]</button></td>
                        <td>Reload</td>
                    </tr>
                    <tr>
                        <td><button>[c]</button></td>
                        <td>Camera</td>
                    </tr>
                    <tr>
                        <td><button>[space]</button></td>
                        <td>Jump</td>
                    </tr>
                    <tr>
                        <td><button>[p]</button></td>
                        <td>Pause</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
    <div id="graphics_settings">
        <div>Quality</div>
        <ul id="quality_selector">
            <li onclick="game.setQuality(this.getAttribute('data-quality'))" data-quality="ultra">Ultra</li>
            <li onclick="game.setQuality(this.getAttribute('data-quality'))" data-quality="high">High</li>
            <li onclick="game.setQuality(this.getAttribute('data-quality'))" data-quality="medium">Medium</li>
            <li onclick="game.setQuality(this.getAttribute('data-quality'))" data-quality="low">Low</li>
            <li onclick="game.setQuality(this.getAttribute('data-quality'))" data-quality="ultra-low">Ultra-Low</li>
        </ul>
    </div>
    <div id="paused">PAUSED</div>
</body>

</html>