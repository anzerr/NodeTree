
window.onload = function() {

	var layer = function() {
		this.main = document.getElementsByClassName('view')[0];

		this.init( 'col', { 'pointerEvents':'none', 'display':'none' } );
		this.init( 'gui' );
		
		this.div_box = new create_div( { 'p':this.main, 'c':'in' } );
		this.div_box.style( { '*id':'div_box', 'pointerEvents':'none' } );
		
		this.init( 'hud', { 'pointerEvents':'none' } );
		
		var him = this, list = {'col':1, 'gui':1, 'hud':1};
		this.resize = function() {
			for (var k in list ) {
				if (isset(him[k].self)) {
					him[k].self.resize();
				}
			}
		}
		
		window.addEventListener("resize", this.resize, false);
	}
	
	layer.prototype.init = function( a, b ) {
		this[a] = {};
		this[a].self = new create_div( { 'p':this.main, 't':'canvas', 'c':'in' } );
		if (isset(b)) {
			this[a].self.style( b );
		}
		this[a].ctx = this[a].self.div.getContext("2d");
		var him = this;
		this[a].self.resize = function() {
			this.div.width = him.main.offsetWidth;
			this.div.height = him.main.offsetHeight;
		}
		this[a].self.resize();
	}

	var drag = { 'toggle':false };
	var renderlist = [];
		
	var fps = {
		'last':(new Date()).getTime(),
		'cur':0,
		'cou':0,
		'fps':0,
		'scale':2,
		'run':function() {
			this.cur += (new Date()).getTime() - this.last;
			this.last = (new Date()).getTime();
			this.cou = ( (this.cur > (1000 / this.scale))? (this.fps = (this.cou + this.fps) / 2, this.cur = 0) : this.cou + 1 );
			return ( Math.round( (this.fps * this.scale) * 100 ) / 100 );
		}
	};

	var _obj = new objManager( {
		'layer':(new layer()),
		'renderlist':renderlist,
		'raytrace':{},
		'render':{},
		'maxCal':50,
		'zindex':1,
		'drag':drag,
		'debug':false,
	} );
	
	var draw = {
		'x':200,
		'y':200, 
		'range':Math.sqrt(Math.pow(_obj.layer.main.offsetHeight, 2)+Math.pow(_obj.layer.main.offsetWidth, 2))/1.5,
	};
	_obj.draw = draw;
	_obj.raytrace = new rayTrace( _obj.layer.col.self.div );
	
	_obj.layer.gui.self.div.addEventListener("mousedown", function(e) {
		drag.toggle = true;
		drag.sx = e.pageX;
		drag.sy = e.pageY;
		drag.spx = draw.x;
		drag.spy = draw.y;
	}, false);
	
	document.body.addEventListener("mousemove", function(e) {
		if (drag.toggle) {
			draw.x = drag.spx + (drag.sx - e.pageX);
			draw.y = drag.spy + (drag.sy- e.pageY);
		}
	}, false);
	
	document.body.addEventListener("mouseup", function(e) {
		drag.toggle = false;
	}, false);
	
	var obj_list = [];
	
	obj_list[0] = new ent( {
		'obm':_obj, 
		'x':0, 
		'y':0,
		'base':true,
		'place':false
	} );
	
	var maxent = 20;
	var space = Math.min( Math.max( 100, maxent*2 ), draw.range/4);
	var makebox = function() {
		var getp = function() {
			return ( obj_list[ Math.floor( Math.random() * obj_list.length ) ] );
		}
		
		var p = getp();
		while (p.child >= 2) {
			p = getp();
		}
		
		p.child += 1;
		obj_list[ obj_list.length ] = new ent( {
			'obm':_obj, 
			'x':Math.round( p.x + ( ( p.child * space ) * ( (p.child%2 == ((p.place)?1:0))? 1 : -1 ) ) + (Math.random() * 20 - 10) ), 
			'y':Math.round( p.y + (space*2) + (Math.random() * 20 - 10) ),
			'p':p,
			'place':(p.child%2 == 0)
		} );
	}
	
	for (var i = 0; i < maxent; i++) {
		makebox();
	}
	
	document.getElementById("projectbar").addEventListener("click", function(e) {
		makebox();
	}, false);
	
	var render = function() {
		_obj.layer.gui.ctx.clearRect( 0, 0, _obj.layer.gui.self.div.width, _obj.layer.gui.self.div.height );
		_obj.layer.hud.ctx.clearRect( 0, 0, _obj.layer.gui.self.div.width, _obj.layer.gui.self.div.height );
		_obj.layer.hud.self.style( { 'zIndex':_obj.zindex+100 } );
		
		var c = fps.run();
		if (_obj.debug) {
			_obj.layer.hud.ctx.font = "20px Georgia";
			_obj.layer.hud.ctx.fillStyle = "red";
			_obj.layer.hud.ctx.fillText( c, 10, 20 );
		}
		
		var pos = { 'x':Math.round(draw.x/draw.range), 'y':Math.round(draw.y/draw.range) };
		var render = {}, entc = 0;
		
		_obj.maxCal = Math.round(c);
		
		for (var ox =  -1; ox <= 1; ox++) {
			for (var oy = -1; oy <= 1; oy++) {
				if ( isset(renderlist[pos.x+ox]) ) {
					if ( isset(renderlist[pos.x+ox][pos.y+oy]) ) {		

						var list = renderlist[pos.x+ox][pos.y+oy];
						for (var i in list) {
							if ( distance(draw.x, draw.y, list[i].x, list[i].y) < draw.range) {
								render[entc++] = list[i];
							} else {
								if (isset(list[i].self)) {
									if (list[i].self.pos.e) {
										list[i].self.style( { 'display':'none' } );
										list[i].self.pos.e = false;
									}
								}
							}
						}
					}
				}		
			}
		}

		_obj.render = render;
		for(var i in _obj.render) {
			_obj.render[i]._index = i;
			_obj.render[i].render();
		}
	}

	function animloop() {
		requestAnimFrame(animloop);
		render();
	}
	animloop();
}

