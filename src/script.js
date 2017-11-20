
const D_U = 0;
const D_UL = 1;
const D_UR = 2;
const D_D = 3;
const D_DL = 4;
const D_DR = 5;

function Point(x, y) {
    this.x = x;
    this.y = y;
}

function Path(sx, sy, ex, ey, arc, dir) {

    let cmultx = dir == D_UL || dir == D_DL ? -1 : 1;
    let cmulty = dir == D_DR || dir == D_DL ? -1 : 1;

    this.s1 = new Point(sx, sy);
    this.e1 = new Point(sx, ey + arc * cmulty);
    this.s2 = new Point(sx + arc * cmultx, ey);
    this.e2 = new Point(ex, ey);
    this.cc = new Point(sx + arc * cmultx, ey + arc * cmulty);
    this.cr = arc;
    if (dir == D_UL) {
        this.cs1 = 0;
        this.cs2 = -Math.PI/2;
        this.cs3 = true;
    } else if (dir == D_UR) {
        this.cs1 = Math.PI,
        this.cs2 = -Math.PI/2;
        this.cs3 = false;
    } else if (dir == D_DR) {
        this.cs1 = Math.PI,
        this.cs2 = Math.PI/2;
        this.cs3 = true;
    } else if (dir == D_DL) {
        this.cs1 = 0,
        this.cs2 = Math.PI/2;
        this.cs3 = false;
    }
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
                    g.arc(p.cc.x, p.cc.y, p.cr, p.cs1, p.cs2, p.cs3);
                }

                g.moveTo(p.s2.x, p.s2.y);
                g.lineTo(p.e2.x, p.e2.y);

                g.stroke();

            }
            g.translate(w/2, h/2);
            // g.rotate(Math.PI/2);
            g.translate(-w/2, -h/2);
            break;
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
            new Path(w/2 + hrs, h, 0, h/2 - hrs , rtb, D_UL),
            new Path(w/2 + hrs, h, w/2 + hrs, 0, D_U),
            new Path(w/2 + hrs, h, w, h/2 + hrs, rts, D_UR),

            new Path(w/2 - hrs, 0, w, h/2 - hrs , rtb, D_DR),
            new Path(w/2 - hrs, 0, w/2 - hrs, h , 0, D_D),
            new Path(w/2 - hrs, 0, 0, h/2 - hrs , rtb, D_DL),
        ]
    };

    engine.mouseDown = function(e) {

        console.log(e.offsetX, e.offsetY);
    };

    engine.mouseMove = function(e) { };
    engine.mouseUp = function(e) { };

    engine.start();
}
