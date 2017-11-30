
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

var COL = {};
COL[P_D0] = [P_L1, P_U2];
COL[P_U0] = [P_R1, P_D2];
COL[P_R0] = [P_D1, P_L2];
COL[P_L0] = [P_U1, P_R2];
COL[P_D1] = [P_R0, P_R1, P_R2, P_L1, P_L2, P_U2];
COL[P_U1] = [P_L0, P_L1, P_L2, P_R1, P_R2, P_D2];
COL[P_R1] = [P_U0, P_U1, P_U2, P_D1, P_D2, P_L2];
COL[P_L1] = [P_D0, P_D1, P_D2, P_U1, P_U2, P_R2];
COL[P_D2] = [P_U1, P_U0, P_R1, P_R2, P_L1, P_L2];
COL[P_U2] = [P_D1, P_D0, P_R1, P_R2, P_L1, P_L2];
COL[P_R2] = [P_L1, P_L0, P_U1, P_U2, P_D1, P_D2];
COL[P_L2] = [P_R1, P_R0, P_U1, P_U2, P_D1, P_D2];

const M_LIN = 0;
const M_CUR = 1;
const M_CLA = 2;
const M_SPE = 3;

var opts = {
    sync_start: false,
    debug: false,
    speed: 1,
    show: {
        paths: true,
        lights: true,
        sensors: false,
        cars: true,
        delay: false,
    }
}

var master_configs = {
    classic: [
        [200, M_CLA, 0],
        [200, M_LIN, 1],
        [200, M_CLA, 1],
        [200, M_CLA, 3],
        [200, M_LIN, 0],
        [200, M_CLA, 2],
    ],
    adapt: "@"
}

function rnd(c) {
    return (Math.random() * c) | 0;
}

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
        if (this.s == S_GRE) return false;
        this.s = S_GRE;
        return true;
    };
    this.setRed = function() {
        if (this.s == S_RED) return false;
        this.s = S_RED;
        this.q = 0;
        return true;
    };
}

function Car(p_i, ps, ss) {

    this.a = true;

    this.pro_i = p_i;
    this.pro = 0;
    this.len = ps[p_i].len;

    this.speed = 4;
    this.mspeed = 4;

    this.dur = 0;
    this.edur = ps[p_i].len / this.mspeed;
    this.delay = 0;

    this.qi = ss[this.pro_i].q;
    ss[this.pro_i].q += 1;

    this.next = null;

    this.die = function() {
        this.a = false;
    }
}

function Input(p_i) {

    this.p_i = p_i;
    this.count = 0;
    this.last_car = null;

    this.can_add = function() {
        if (this.count == 0) return false;
        if (this.last_car == null || !this.last_car.a) return true;

        //this.last_car.speed == this.last_car.mspeed &&
        return this.last_car.pro > 30;
    }

    this.add = function(ps, cs, ss) {
        this.count -= 1;
        let ncar = new Car(this.p_i, ps, ss);
        ncar.pro = -30

        if (this.last_car != null && this.last_car.a) {
            // ncar.speed = this.last_car.speed;
            ncar.next = this.last_car;
        }
        this.last_car = ncar;
        cs.push(this.last_car);
    }
}

function Master(ps, cs, ss) {

    this.ps = ps;
    this.cs = cs;
    this.ss = ss;

    this.red = function(i) {
        let s = this.ss[i];
        let p = this.ps[i];

        // if(!s.setRed()) return;
        s.setRed();
        s.q = 0;

        for (let c of this.cs) {
            if (!c.a) continue;
            if (c.pro_i == i && c.pro <= p.sig) {

                c.qi = s.q;
                s.q += 1;
            }
        }

    }

    this.gre = function(i) {
        let s = this.ss[i];
        let p = this.ps[i];

        for (let ci of COL[i]) {
            this.red(ci);
        }

        if(!s.setGre()) return;

    }

    this.sig = function(c, i) {
        if (c == S_GRE) this.gre(i);
        else if (c == S_RED) this.red(i);
    }

    this.canalso = function(i) {

        for (let ci of COL[i]) {
            if (ss[ci].s != S_RED) return false;
        }

        return true;
    }

    this.m_corners = function(c) {
        this.sig(c, P_D0);
        this.sig(c, P_U0);
        this.sig(c, P_R0);
        this.sig(c, P_L0);
    }

    this.m_line = function(c, i) {
        if (i == true || i == 1) {
            this.m_corners(c);
            this.sig(c, P_D1);
            this.sig(c, P_U1);
        } else {
            this.m_corners(c);
            this.sig(c, P_R1);
            this.sig(c, P_L1);
        }
    }

    this.m_curve = function(c, i) {
        this.m_corners(c);
        if (i == true) {
            this.sig(c, P_D2);
            this.sig(c, P_U2);
        } else {
            this.sig(c, P_R2);
            this.sig(c, P_L2);
        }
    }

    this.m_cla = function(c, i) {
        if (i == 0) {
            this.m_corners(c);
            this.sig(c, P_D1);
            this.sig(c, P_D2);
        } else if (i == 1) {
            this.m_corners(c);
            this.sig(c, P_U1);
            this.sig(c, P_U2);
        } else if (i == 2) {
            this.m_corners(c);
            this.sig(c, P_R1);
            this.sig(c, P_R2);
        } else if (i == 3) {
            this.m_corners(c);
            this.sig(c, P_L1);
            this.sig(c, P_L2);
        }
    }

    this.m_spe = function(c, i) {
        if (i == 0) {
            this.sig(c, P_D1);
            this.sig(c, P_L2);
        } else if (i == 1) {
            this.sig(c, P_U1);
            this.sig(c, P_R2);
        } else if (i == 2) {
            this.sig(c, P_L1);
            this.sig(c, P_U2);
        } else if (i == 3) {
            this.sig(c, P_R1);
            this.sig(c, P_D2);
        }
    }

    this.m_all = function(c) {
        for (let i=0; i<12; i++) {
            this.sig(c, i);
        }
    }

    this.m = function(i, ii) {
        const c = S_GRE;
        if (i == M_LIN) this.m_line(c, ii);
        else if (i == M_CUR) this.m_curve(c, ii);
        else if (i == M_CLA) this.m_cla(c, ii);
        else if (i == M_SPE) this.m_spe(c, ii);
    }
}

function Handler(master, config) {
    this.master = master;

    this.config = config;
    this.ci = 0;
    this.t = 0;

    this.start = function() {
        if (this.config.length == 0) return;

        this.ci = 0;
        this.t = 0;

        this.master.m_corners(S_GRE);
        this.perform();
    }

    this.update = function() {
        if (this.config.length == 0) return;

        this.t += 1;

        if (this.t >= this.config[this.ci][0]) {
            this.t = 0;
            this.ci += 1;
            if (this.ci >= this.config.length) this.ci = 0;

            this.perform();
        }
    }

    this.perform = function() {
        let c = this.config[this.ci];
        this.master.m(c[1], c[2]);
    }
}

function AHandler(master, lambda) {
    this.master = master;

    this.lambda = lambda;
    this.ci = 0;
    this.t = 0;

    this.start = function() {
        if (this.config.length == 0) return;

        this.ci = 0;
        this.t = 0;

        this.perform();
    }

    this.update = function() {

        this.t += 1;

        if (this.t >= 100) {
            this.t = 0;

            this.perform();
        }
    }

    this.perform = function() {

        let l = [];
        for (let i=0; i<12; i++) {
            l.push({
                p: i,
                q: master.ss[i].q
            });
        }

        l.sort(function(i1, i2) {
            return i2.q - i1.q;
        })

        this.master.m_all(S_RED);
        for (let i of l) {
            if (this.master.canalso(i.p)) {
                this.master.sig(S_GRE, i.p);
            }
        }
    }
}

function Renderer() {

    this.draw_curves = function(g, ps, ss, cond) {
        i = 0;
        for (let p of ps) {
            let s = ss[i];
            i++;
            if (s.s != cond) continue;

            g.beginPath();
            if (p.cr > 0) {
                g.arc(p.cc.x, p.cc.y, p.cr, p.cs1, p.cs2, p.cs3);
            } else {
                if (p.s1.x == p.e1.x) {
                    g.moveTo(p.s1.x, (p.s1.y + p.e1.y) / 2 - 87.5);
                    g.lineTo(p.s1.x, (p.s1.y + p.e1.y) / 2 + 87.5);
                } else {
                    g.moveTo((p.s1.x + p.e1.x) / 2 - 87.5, p.s1.y);
                    g.lineTo((p.s1.x + p.e1.x) / 2 + 87.5, p.s1.y);
                }
            }
            g.stroke();
        }
    }

    this.draw_car = function(g, ps, c) {
        if (!c.a) return;

        let p = ps[c.pro_i];
        let cur = c.pro;

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

    this.draw_path = function(g, p) {

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
}

function World(ps) {

    this.ps = ps;
    this.cs = [];

    this.ss = [];
    this.is = [];

    let i = 0;
    for (let p of this.ps) {
        this.ss.push(new Signal());
        this.is.push(new Input(i));
        i += 1;
    }

    this.master = new Master(this.ps, this.cs, this.ss);
    this.handler = new Handler(this.master, master_configs.classic);

    this.get_qs = function() {
        let qs = [];

        let i=0;
        for (let s of this.ss) {
            qs[i] = s.q;
            i+=1;
        }

        return qs;
    }

    this.set_handler_config = function(config) {
        if (config == "@") {
            this.handler = new AHandler(this.master, 0.8);
        } else {
            this.handler = new Handler(this.master, config);
        }
    }

}

function load() {

    engine = new Engine('canvas', true);

    world = null;

    renderer = new Renderer();

    engine.init = function() { };

    engine.update = function(delta) {

        for (let repeats=0; repeats<opts.speed; repeats++) {

        world.handler.update(1);

        for (let i of world.is) {
            if (i.can_add()) {
                i.add(world.ps, world.cs, world.ss);
            }
        }

        for (let c of world.cs) {
            if (!c.a) continue;
            let p = world.ps[c.pro_i];
            let s = world.ss[c.pro_i];

            let stop = p.sig - 30 * c.qi;
            if (s.s == S_RED && c.pro <= p.sig && c.speed >= 0 && stop - c.pro < 100) {

                if (c.speed > 0 && stop - c.pro > 0) {
                    c.speed = c.mspeed * (stop - c.pro) / 100;
                    if (c.speed <= 0.01) {
                        c.speed = 0;
                    }
                } else {
                    c.speed = 0;
                }
            } else {//if (c.speed < c.mspeed) {

                let space = opts.sync_start ? (25 + c.speed * 4) : (35 + c.speed * 10);

                let next_dis = 10000;
                if (c.next != null && c.next.a) {
                    next_dis = c.next.pro - c.pro;
                }

                if (next_dis >= space) {

                    c.speed += c.mspeed / 100;
                    if (c.speed > c.mspeed) c.speed = c.mspeed;

                } else {

                    if (c.speed > c.next.speed) {

                        c.speed -= c.mspeed / 10;
                        if (c.speed < 0) c.speed = 0;
                    }
                }
            }

            c.pro += c.speed;

            c.delay += c.mspeed - c.speed;

            c.dur += 1;

            if (c.pro >= p.len + 30) {
                c.die();
            }
        }

        // clean up

        // TODO move to function
        if (world.cs.length > 400) {
            tmp = [];
            while(world.cs.length > 0) tmp.push(world.cs.pop());
            while(tmp.length > 0) {
                let c = tmp.pop();
                if (c.a) world.cs.push(c);
            }
        }

        }

    };

    engine.draw = function(g) {
        let w = engine.getW();
        let h = engine.getH();

        g.lineCap = "round";

        g.fillStyle = "#fff";
        g.clearRect(0, 0, w, h)
        g.fillStyle = "#000";

        if (engine.getFps() < 58 || opts.debug) g.fillText(engine.getFps(), 20, 20)

        if (opts.show.paths) {

            g.strokeStyle = "#ccc";
            g.lineWidth = 2;

            for (let p of world.ps) {
                renderer.draw_path(g, p);
            }
        }

        if (opts.show.lights) {

            g.strokeStyle = "#fcc";
            g.lineWidth = 4;
            renderer.draw_curves(g, world.ps, world.ss, S_RED);

            g.strokeStyle = "#fff";
            g.lineWidth = 9;
            renderer.draw_curves(g, world.ps, world.ss, S_GRE);

            g.strokeStyle = "#080";
            g.lineWidth = 5;
            renderer.draw_curves(g, world.ps, world.ss, S_GRE);
        }

        if (opts.show.cars) {

            g.fillStyle = "#000";

            for (let c of world.cs) {
                if (!c.a) continue;

                if (opts.show.delay) {
                    if (c.delay < 4000) g.fillStyle = "rgb(" + ((c.delay * 255 / 4000)|0) + ", 0, 0)";
                    else g.fillStyle = "#ff0000";
                }

                renderer.draw_car(g, world.ps, c);
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

        let ps = [
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

        world = new World(ps);

        world.handler.start();
    };

    engine.mouseDown = function(e) {

        for (let i=0; i<opts.speed; i++) {
            world.is[rnd(4)*3 + rnd(2) + rnd(2)].count += 1;
        }

        // console.log(e.offsetX, e.offsetY);
    };

    engine.mouseMove = function(e) { };
    engine.mouseUp = function(e) { };

    engine.start();
    setInterval(engine.mouseDown, 300)

}
