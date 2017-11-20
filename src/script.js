
function Point(x, y) {
    this.x = x;
    this.y = y;
}

function Path(sx, sy, ex, ey, arc) {
    this.s1 = new Point(sx, sy);
    this.e1 = new Point(sx, ey + 100);
    this.s2 = new Point(sx - 100, ey);
    this.e2 = new Point(ex, ey);
    this.cc = new Point(sx - 100, ey + 100);
    this.cr = arc;
}

function load() {

    engine = new Engine('canvas', false);

    p = null;

    engine.init = function() {

    };

    engine.update = function(delta) {

    };

    engine.draw = function(g) {
        let w = engine.getW();
        let h = engine.getH();

        g.fillStyle = "#fff";
        g.fillRect(0, 0, w, h)

        for (let p of ps) {

            g.beginPath();

            g.moveTo(p.s1.x, p.s1.y);
            g.lineTo(p.e1.x, p.e1.y);

            g.arc(p.cc.x, p.cc.y, p.cr, 0, -Math.PI/2, true);

            g.moveTo(p.s2.x, p.s2.y);
            g.lineTo(p.e2.x, p.e2.y);

            g.stroke();

        }

    };

    engine.resize = function() {
        let w = engine.getW();
        let h = engine.getH();

        ps = [
            new Path(w/2, h, 0, h/2, 100)
        ]
    };

    engine.mouseDown = function(e) {

        console.log(e.offsetX, e.offsetY);
    };

    engine.mouseMove = function(e) { };
    engine.mouseUp = function(e) { };

    engine.start();
}
