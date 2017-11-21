
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

const S_RED = 0;
const S_YEL = 1;
const S_GRE = 2;

const P_D0 = 2;
const P_D1 = 1;
const P_D2 = 0;
const P_U0 = 5;
const P_U1 = 4;
const P_U2 = 3;
const P_R0 = 9;
const P_R1 = 10;
const P_R2 = 11;
const P_L0 = 8;
const P_L1 = 7;
const P_L2 = 6;

function Point(x, y) {
    this.x = x;
    this.y = y;

    this.dis = function(other) {
        if (this.x == other.x) return this.y > other.y ? this.y - other.y : other.y - this.y;
        if (this.y == other.y) return this.x > other.x ? this.x - other.x : other.x - this.x;
    }
}

function Path(sx, sy, ex, ey, arc, dir, sig) {

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
    this.sig = sig;

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

function Signal() {

    this.s = S_RED;
    this.q = 0;

    this.setGre = function() {
        this.s = S_GRE;
    };
    this.setRed = function() {
        this.s = S_RED;
        this.q = 0;
    };
}

function Car(ps, ss) {

    this.pro_i = (Math.random() * ps.length) | 0;
    this.pro = 0;

    this.speed = 4;
    this.mspeed = 4;

    this.qi = ss[this.pro_i].q++;
    this.pro = -this.qi * 100;

    this.reset = function() {
        this.pro_i = (Math.random() * ps.length) | 0;
        this.pro = 0;

        this.speed = 4;
        this.mspeed = 4;

        this.qi = ss[this.pro_i].q++;
    }
}

function Master(ps, cs, ss) {

    this.ps = ps;
    this.cs = cs;
    this.ss = ss;

    this.red = function(i) {
        this.ss[i].setRed();

        for (let c of this.cs) {
            if (c.pro_i == i) {
                c.qi = this.ss[c.pro_i].q++;
            }
        }
    }

    this.gre = function(i) {
        this.ss[i].setGre();

    }

    this.sig = function(c, i) {
        if (c == S_GRE) this.gre(i);
        else if (c == S_RED) this.red(i);
    }

    this.m_corners = function(c) {
        this.sig(c, P_D0);
        this.sig(c, P_U0);
        this.sig(c, P_R0);
        this.sig(c, P_L0);
    }

    this.m_line = function(c, i) {
        if (i == true) {
            this.sig(c, P_D1);
            this.sig(c, P_U1);
        } else {
            this.sig(c, P_R1);
            this.sig(c, P_L1);
        }
    }

    this.m_all = function(c) {
        for (let i=0; i<12; i++) {
            this.sig(c, i);
        }
    }

}

function load() {

    engine = new Engine('canvas', true);

    ps = [];
    cs = [];
    ss = [];
    master = new Master(ps, cs, ss);

    engine.init = function() {

    };

    engine.update = function(delta) {

        for (let c of cs) {
            let p = ps[c.pro_i];
            let s = ss[c.pro_i];

            let stop = p.sig - 30 * c.qi;
            if (s.s == S_RED && c.speed > 0 && stop - c.pro < 100) {
                c.speed = c.mspeed * (stop - c.pro) / 100;
                if (c.speed < 0) {
                    c.speed = 0;
                }
            }

            if (s.s == S_GRE && c.speed < c.mspeed) {
                c.speed += c.mspeed / 100;
                if (c.speed > c.mspeed) {
                    c.speed = c.mspeed;
                }
            }

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

        let i = 0;
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

            //g.fillText(i++, p.e1.x, p.e1.y);

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
        let sigw = w/2 -rtb;
        let sigh = h/2 -rtb;

        ps = [
            new Path(w/2 + hrs - ls, h, 0, h/2 - hrs + ls, rtb, D_UL, sigh),
            new Path(w/2 + hrs, h, w/2 + hrs, 0, 0, D_U, sigh),
            new Path(w/2 + hrs + ls, h, w, h/2 + hrs + ls, rts, D_UR, sigh),

            new Path(w/2 - hrs + ls, 0, w, h/2 + hrs - ls, rtb, D_DR, sigh),
            new Path(w/2 - hrs, 0, w/2 - hrs, h, 0, D_D, sigh),
            new Path(w/2 - hrs - ls, 0, 0, h/2 - hrs - ls, rts, D_DL, sigh),

            new Path(0, h/2 + hrs -ls, w/2 + hrs -ls, 0, rtb, D_LU, sigw),
            new Path(0, h/2 + hrs, w, h/2 + hrs, 0, D_L, sigw),
            new Path(0, h/2 + hrs +ls, w/2 - hrs -ls, h, rts, D_LD, sigw),

            new Path(w, h/2 - hrs -ls, w/2 + hrs +ls, 0, rts, D_RU, sigw),
            new Path(w, h/2 - hrs, 0, h/2 - hrs, 0, D_R, sigw),
            new Path(w, h/2 - hrs +ls, w/2 - hrs +ls, h, rtb, D_RD, sigw),
        ]

        for (let p of ps) {
            ss.push(new Signal());
        }

        cs = [];
        for (let i=0; i<20; i++) {
            cs.push(new Car(ps, ss));
        }

        master = new Master(ps, cs, ss);
    };

    engine.mouseDown = function(e) {

        for (let i=0; i<1; i++) {
            cs.push(new Car(ps, ss));
        }

        // console.log(e.offsetX, e.offsetY);
    };

    engine.mouseMove = function(e) { };
    engine.mouseUp = function(e) { };

    engine.start();
}
