
const D_U = 0;
const D_UL = 1;
const D_UR = 2;
const D_D = 3;
const D_DL = 4;
const D_DR = 5;
const D_L = 6;
const D_LU = 7;
const D_LD = 8;
const D_R = 9;
const D_RU = 10;
const D_RD = 11;
const D_SWAP = 6;

function Point(x, y) {
    this.x = x;
    this.y = y;

    this.dis = function(other) {
        if (this.x == other.x) return this.y > other.y ? this.y - other.y : other.y - this.y;
        if (this.y == other.y) return this.x > other.x ? this.x - other.x : other.x - this.x;
    }
}

function Path(sx, sy, ex, ey, arc, dir) {

    if (dir < D_SWAP) {
        let cmultx = dir == D_UL || dir == D_DL ? -1 : 1;
        let cmulty = dir == D_DR || dir == D_DL ? -1 : 1;

        this.s1 = new Point(sx, sy);
        this.e1 = new Point(sx, ey + arc * cmulty);
        this.s2 = new Point(sx + arc * cmultx, ey);
        this.e2 = new Point(ex, ey);
        this.cc = new Point(sx + arc * cmultx, ey + arc * cmulty);
        this.cr = arc;
    } else {
        let cmultx = dir == D_LD || dir == D_LU ? -1 : 1;
        let cmulty = dir == D_RU || dir == D_LU ? -1 : 1;

        this.s1 = new Point(sx, sy);
        this.e1 = new Point(ex + arc * cmultx, sy);
        this.s2 = new Point(ex, sy + arc * cmulty);
        this.e2 = new Point(ex, ey);
        this.cc = new Point(ex + arc * cmultx, sy + arc * cmulty);
        this.cr = arc;
    }

    if (dir == D_UL || dir == D_DL) this.cs1 = 0;
    else if (dir == D_UR || dir == D_DR) this.cs1 = Math.PI;
    else if (dir == D_LU || dir == D_RU) this.cs1 = Math.PI/2;
    else if (dir == D_LD || dir == D_RD) this.cs1 = 3*Math.PI/2;

    this.cs3 = dir == D_UL || dir == D_DR || dir == D_LU || dir == D_RD;

    this.cs2 = this.cs1 + (this.cs3? -1 : 1)*Math.PI/2;
    this.dir = dir;

    this.len1 = this.s1.dis(this.e1);
    this.len2 = 0.5*Math.PI*this.cr;
    this.len3 = this.s2.dis(this.e2);
    this.len = this.len1 + this.len2 + this.len3;

    this.len_part = function(index) {
        if (index == 0) return this.len1;
        if (index == 1) return this.len2;
        if (index == 2) return this.len3;
    }
}

function Car(ps) {

    this.pro_i = (Math.random() * ps.length) | 0;
    this.pro = Math.random() * ps[this.pro_i].len;

    this.speed = 4;
    this.mspeed = 4;

    this.reset = function() {
        this.pro_i = (Math.random() * ps.length) | 0;
        this.pro = 0;
    }
}

function load() {

    engine = new Engine('canvas', true);

    ps = [];
    cs = [];

    engine.init = function() {

    };

    engine.update = function(delta) {

        for (let c of cs) {
            let p = ps[c.pro_i];

            c.pro += c.speed;

            if (c.pro >= p.len) {
                c.reset();
            }
        }

    };

    engine.draw = function(g) {
        let w = engine.getW();
        let h = engine.getH();

        g.fillStyle = "#fff";
        g.fillRect(0, 0, w, h)
        g.fillStyle = "#000";

        if (engine.getFps() < 58) g.fillText(engine.getFps(), 20, 20)

        for (let i=0; i<2; i++) {
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

        for (let c of cs) {
            let p = ps[c.pro_i];

            cur = c.pro;

            if (cur < p.len_part(0)) {
                prog = cur / p.len_part(0);

                let x = p.s1.x + (p.e1.x - p.s1.x) * prog;
                let y = p.s1.y + (p.e1.y - p.s1.y) * prog;

                if (p.dir < D_SWAP) {
                    g.fillRect(x -5, y -10, 10, 20)
                } else {
                    g.fillRect(x -10, y -5, 20, 10)
                }

            } else if (cur < p.len_part(0) + p.len_part(1)) {

                prog = (cur - p.len_part(0)) / p.len_part(1);

                let x = p.e1.x + (p.s2.x - p.e1.x) * prog;
                let y = p.e1.y + (p.s2.y - p.e1.y) * prog;

                g.save();
                g.translate(p.cc.x, p.cc.y)
                g.rotate(p.cs1 + prog * (p.cs2-p.cs1))

                g.fillRect(p.cr -5, -10, 10, 20)

                g.restore();

            } else {
                prog = (cur - p.len_part(0) - p.len_part(1)) / p.len_part(2);

                let x = p.s2.x + (p.e2.x - p.s2.x) * prog;
                let y = p.s2.y + (p.e2.y - p.s2.y) * prog;

                if (p.dir < D_SWAP) {
                    g.fillRect(x -10, y -5, 20, 10)
                } else {
                    g.fillRect(x -5, y -10, 10, 20)
                }
            }
        }

    };

    engine.resize = function() {
        let w = engine.getW();
        let h = engine.getH();

        let s = 100;
        let rs = 50;
        let hrs = 25;
        let ls = 12;
        let rtb = 100;
        let rts = rtb-rs;

        ps = [
            new Path(w/2 + hrs - ls, h, 0, h/2 - hrs + ls, rtb, D_UL),
            new Path(w/2 + hrs, h, w/2 + hrs, 0, D_U),
            new Path(w/2 + hrs + ls, h, w, h/2 + hrs + ls, rts, D_UR),

            new Path(w/2 - hrs + ls, 0, w, h/2 + hrs - ls, rtb, D_DR),
            new Path(w/2 - hrs, 0, w/2 - hrs, h , 0, D_D),
            new Path(w/2 - hrs - ls, 0, 0, h/2 - hrs - ls, rts, D_DL),

            new Path(0, h/2 + hrs -ls, w/2 + hrs -ls, 0, rtb, D_LU),
            new Path(0, h/2 + hrs, w, h/2 + hrs, 0, D_L),
            new Path(0, h/2 + hrs +ls, w/2 - hrs -ls, h, rts, D_LD),

            new Path(w, h/2 - hrs -ls, w/2 + hrs +ls, 0, rts, D_RU),
            new Path(w, h/2 - hrs, 0, h/2 - hrs, 0, D_R),
            new Path(w, h/2 - hrs +ls, w/2 - hrs +ls, h, rtb, D_RD),
        ]

        cs = [];
        for (let i=0; i<20; i++) {
            cs.push(new Car(ps));
        }
    };

    engine.mouseDown = function(e) {

        for (let i=0; i<10; i++) {
            cs.push(new Car(ps));
        }

        console.log(e.offsetX, e.offsetY);
    };

    engine.mouseMove = function(e) { };
    engine.mouseUp = function(e) { };

    engine.start();
}
