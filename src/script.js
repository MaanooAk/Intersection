
function Point(x, y) {
    this.x = x;
    this.y = y;
}

function Path(sx, sy, ex, ey, arc, dir) {
    this.s1 = new Point(sx, sy);
    this.e1 = new Point(sx, ey + arc);
    this.s2 = new Point(sx + arc * dir, ey);
    this.e2 = new Point(ex, ey);
    this.cc = dir == -1 ? new Point(sx - arc, ey + arc) : new Point(sx + arc, ey + arc);
    this.cr = arc;
    this.dir = dir;
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

        for (let i=0; i<4; i++) {
            for (let p of ps) {

                g.beginPath();

                g.moveTo(p.s1.x, p.s1.y);
                g.lineTo(p.e1.x, p.e1.y);

                if (p.cr > 0) {
                    if (p.dir == -1) g.arc(p.cc.x, p.cc.y, p.cr, 0, -Math.PI/2, true);
                    else g.arc(p.cc.x, p.cc.y, p.cr, Math.PI, -Math.PI/2, false);
                }

                g.moveTo(p.s2.x, p.s2.y);
                g.lineTo(p.e2.x, p.e2.y);

                g.stroke();

            }
            g.translate(w/2, h/2);
            g.rotate(Math.PI/2);
            g.translate(-w/2, -h/2);
        }

    };

    engine.resize = function() {
        let w = engine.getW();
        let h = engine.getH();

        let s = 100;
        let rs = 50;
        let hrs = 25;
        let rts = 50;
        let rtb = 75;

        ps = [
            new Path(w/2 + hrs, h, 0, h/2 - hrs , rtb, -1),
            new Path(w/2 + hrs, h, w/2 + hrs, 0, 0),
            new Path(w/2 + hrs, h, w, h/2 + hrs, rts, 1),
        ]
    };

    engine.mouseDown = function(e) {

        console.log(e.offsetX, e.offsetY);
    };

    engine.mouseMove = function(e) { };
    engine.mouseUp = function(e) { };

    engine.start();
}
