
var isset = function( e ) {
	return (typeof e !== 'undefined');
}

var keystats = [];
window.addEventListener("keyup", function(e) { keystats[e.keyCode] = false; }, false);
window.addEventListener("keydown", function(e) { keystats[e.keyCode] = true; }, false);

window.requestAnimFrame = (function(){
	return (
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame	||
		function( callback ){
			window.setTimeout(callback, 1000 / 60);
		}
	);
})();

var objManager = function( a ) {
	for (var i in a) {
		this[i] = a[i];
	}
}

var boxcolor = [];

var ent = function( a ) {
	for (var i in a) {
		this[i] = a[i];
	}

	this.init = false;
	this.inCollision = false;
	this.child = 0;
	this.updateGrid();
}

ent.prototype.updateGrid = function() {
	
	var load = false;
	var pos = { 
		'x':Math.round(this.x/this.obm.draw.range), 
		'y':Math.round(this.y/this.obm.draw.range) 
	};

	if (!isset(this.gridpos)) {
		load = true;
		this.gridpos = pos;
		this.lastcol = 0;
	}
	
	if ( this.gridpos.x != pos.x || this.gridpos.y != pos.y || load ) {
		if (isset(this.index)) {
			delete this.obm.renderlist[this.gridpos.x][this.gridpos.y][this.index];
		}
	
		this.gridpos = pos;
		
		if (!isset(this.obm.renderlist[this.gridpos.x])) {
			this.obm.renderlist[this.gridpos.x] = [];
		}
		if (!isset(this.obm.renderlist[this.gridpos.x][this.gridpos.y])) {
			this.obm.renderlist[this.gridpos.x][this.gridpos.y] = [];
		}
		
		if (!isset(boxcolor[this.gridpos.x+','+this.gridpos.y])) {
			boxcolor[this.gridpos.x+','+this.gridpos.y] = rgb( 
				Math.random()*255,
				Math.random()*255,
				Math.random()*255
			);
		}
		
		if (this.color != boxcolor[this.gridpos.x+','+this.gridpos.y]) {
			this.color = boxcolor[this.gridpos.x+','+this.gridpos.y];
			
			if (isset(this.self)) {
				this.self.style( { 'BColor':this.color } );
			}
		}

		this.obm.renderlist[this.gridpos.x][this.gridpos.y][ (this.index = this.obm.renderlist[this.gridpos.x][this.gridpos.y].length) ] = this;
					
		if (!isset(this.self) || !isset(this.sides)) {
			this.sides = {
				0:{ 'x':0, 'y':0 },
				1:{ 'x':0, 'y':0 },
				2:{ 'x':0, 'y':0 },
				3:{ 'x':0, 'y':0 },
			}
		}
	}
}

ent.prototype._get = function( t, ent ) {
	var o = { 'x':'width', 'y':'height', 'drawx':'width', 'drawy':'height'};
	var c = { 'x':'x', 'y':'y', 'drawx':'x', 'drawy':'y'};
	if (!isset(o[t])) { return (0); }
	return Math.round( (ent[t]-this.obm.draw[c[t]])+(this.obm.layer.gui.self.div[o[t]]/2) );
}

ent.prototype.col = function( ) {
	if (this.obm.maxCal > 0) {
		this.obm.maxCal -= 1;
		if (isset(this.colWith)) {
			var ang = angle( this.x, this.y, this.colWith.x, this.colWith.y );
			this.x -= Math.round( Math.cos(ang) * (this.movescale += (1/this.movescale)) );
			this.y -= Math.round( Math.sin(ang) * (this.movescale += (1/this.movescale)) );
		}
		var ret = this.obm.raytrace.colision( this, this.obm.render );
		this.lastcol = ( (ret)? (new Date()).getTime() + 250 : this.lastcol );
		this.inCollision = ret
	}
}

ent.prototype.updateside = function() {			
	this.sides = {
		0:{ 'x':this.drawx + ((this.sx-this.sb)/2), 'y':this.drawy },
		1:{ 'x':this.drawx, 'y':this.drawy + ((this.sy-this.sb)/2) },
		2:{ 'x':this.drawx + ((this.sx-this.sb)), 'y':this.drawy + ((this.sy-this.sb)/2) },
		3:{ 'x':this.drawx + ((this.sx-this.sb)/2), 'y':this.drawy + ((this.sy-this.sb)) },
	}
}

ent.prototype.drawPos = function( pos ) {	
	if (this.self.div.style.display != 'block') {
		this.self.style( { 'display':'block' } );
		this.self.pos.e = true;
	}
	
	if ( this.lastcol < (new Date()).getTime() || this.self.dragable.info.toggle ) {
		if (this.self.dragable.info.toggle ) {
			this.drawx = this.x;
			this.drawy = this.y;
			this.updateside();
		} else {
			if ( this.drawx != this.x || this.drawy != this.y ) {
				var cx = Math.max(this.x, this.drawx) - Math.min(this.x, this.drawx);
				if (cx != 0) {
					cx =  Math.min( Math.round( (cx > 10)? cx/10 : 1 ), 10 ); 
					this.drawx += ( (this.x < this.drawx)? cx * -1 : ( (this.x == this.drawx)? 0 : cx ) );
				}
				
				var cy = Math.max(this.y, this.drawy) - Math.min(this.y, this.drawy);
				if (cy != 0) {
					cy =  Math.min( Math.round( (cy > 10)? cy/10 : 1 ), 10 ); 
					this.drawy += ( (this.y < this.drawy)? cy * -1 : ( (this.y == this.drawy)? 0 : cy ) );
				}
				
				this.updateside();
			}
		}
	}
	var pos = { 'x':this._get('drawx', this), 'y':this._get('drawy', this) };
	this.self.style( { 'left':pos.x+'px', 'top':pos.y+'px' } );
}

ent.prototype.render = function() {
	var pos = { 'x':this._get('x', this), 'y':this._get('y', this) };
	
	if (!this.init) {
		this.sb = 10;
		this.sx = 100;
		this.sy = 100;

		this.drawx = this.x;
		this.drawy = this.y;
		this.movescale = 1;

		this.updateside();
		
		this.self = new create_div( { 'p':document.getElementById( 'div_box' ) } );
		this.self.style( { 'width':(this.sx-this.sb)+'px', 'height':(this.sx-this.sb)+'px', 'BColor':this.color, 'position':'absolute', 'display':'none', 'pointerEvents':'all', 'cursor':'default', 'border':'2px solid white', 'zIndex':this.obm.zindex } );
		this.self.dragable = new dragable( this );
		this.line = new linedrawer( this );
		
		this.self.pos = {
			'x':0,
			'y':0,
			'e':true,
		}
		this.init = true;
		if (!isset(this.base)) {
			this.col();
		}
	} else {
		if (isset(this.self)) {
			this.drawPos( pos );
			this.line.render( );
			
			if (!isset(this.base)) {
				if (this.inCollision) {
					this.col();
				} else {
					this.movescale = 1;
					if (this.obm.debug) {
						this.obm.layer.gui.ctx.fillStyle = 'white';
						this.obm.layer.gui.ctx.fillRect(pos.x, pos.y, this.sx-(this.sb/2), this.sy-(this.sb/2) );
					}
				}
			}
		}
	}
}

