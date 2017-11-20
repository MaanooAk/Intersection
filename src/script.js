

function load() {

    engine = new Engine('canvas', false);

    engine.init = function() {

    };

    engine.update = function(delta) {

    };

    engine.draw = function(g) {
        let w = engine.getW();
        let h = engine.getH();

        g.fillStyle = "#fff";
        g.fillRect(0, 0, w, h)

        g.fillStyle = "#000";



    };

    engine.resize = function() { };

    engine.mouseDown = function(e) {

        console.log(e.offsetX, e.offsetY);
    };

    engine.mouseMove = function(e) { };
    engine.mouseUp = function(e) { };

    engine.start();
}
