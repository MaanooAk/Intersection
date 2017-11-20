
/**
 * Engine class
 */
function Engine(canvas_id, fullscreen) {

	var w = -1;
	var h = -1;

	var canvas = document.getElementById(canvas_id);
	var context = canvas.getContext('2d');

	var lastRender = 0;

	var keys;
	var keys_new;

	var fps_duration = 0;
	var fps_frames = 0;
	var fps = 1;

	this.loop = function() {

		var delta = Date.now() - lastRender;

		// fps
		fps_duration += delta;
		fps_frames += 1;
		if(fps_duration > 300) {
			fps = (fps_frames * 1000/fps_duration) | 0;
			fps_duration = 0;
			fps_frames = 0;
		}

		if(delta > 100) delta = 100;

		if(delta>0) {
			lastRender = Date.now();

			this.update(delta);
		}else{
			//console.info("skip update");
		}

		this.draw(context);

		requestAnimationFrame(this.loop.bind(this));
	};

	this.resized = function() {
        if (fullscreen) {
    		w = canvas.width = window.innerWidth;
    		h = canvas.height = window.innerHeight;
        } else {
    		w = canvas.width;
    		h = canvas.height;
        }

		this.resize();
	}

	this.getW = function() { return w; };
	this.getH = function() { return h; };
	this.getFps = function() { return fps; };

	// public
	this.start = function() {

		this.init();

		window.addEventListener('resize', this.resized.bind(this), false);
		this.resized();

		// mouse

		canvas.addEventListener("mousedown", this.mouseDown.bind(this), false);
		canvas.addEventListener("mousemove", this.mouseMove.bind(this), false);
		canvas.addEventListener("mouseup", this.mouseUp.bind(this), false);

		// keyboad

		document.addEventListener("keydown", this.keyDown.bind(this), false);
		document.addEventListener("keypress", this.keyPress.bind(this), false);
		document.addEventListener("keyup", this.keyUp.bind(this), false);

		keys = [];
		keys_new = [];

		for(var i=0; i<225; i++) {
			keys[i] = false;
			keys_new[i] = false;
		}

		// update

		lastRender = Date.now();
		this.update(0);

		this.loop();
	};

	this.getContext = function() {
		return context;
	}

	this.keyDown = function(e) {
		if(!keys[e.keyCode]) {
			keys_new[e.keyCode] = true;
			keys[e.keyCode] = true;
		}
	}
	this.keyPress = function(e) {

	}
	this.keyUp = function(e) {
		keys[e.keyCode] = false;
	}

	this.isKeyDown = function(code) {
		return keys[code];
	}
	this.isKeyPressed = function(code) {
		if(keys_new[code]) {
			keys_new[code] = false;
			return true;
		}else{
			return false;
		}
	}

	// --- Must be implemented ---

	this.init = function() { /* must be implemented */ };
	this.update = function(delta) { /* must be implemented */ };
	this.draw = function(context) { /* must be implemented */ };

	this.resize = function() { /* must be implemented */ };

	this.mouseDown = function(e) { /* must be implemented */ };
	this.mouseMove = function(e) { /* must be implemented */ };
	this.mouseUp = function(e) { /* must be implemented */ };

}
