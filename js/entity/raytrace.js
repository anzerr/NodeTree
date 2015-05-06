
var angle = function( x1, y1, x2, y2 ) {
	return ( Math.atan2( y2-y1, x2-x1 ) );
}

var distance = function( x1, y1, x2, y2 ) {
	return Math.sqrt( Math.pow( x2-x1, 2 ) + Math.pow( y2-y1, 2 ) );
}

var rayTrace =  function( canvas, call ) {
	this.canvas = canvas;
	this.context = this.canvas.getContext('2d');
	//this.data = this.context.getImageData(0, 0, this.canvas.height, this.canvas.width ).data
	
	this.dcall = function( a, x, y ) { var c = a.getColor( x, y ); return( c.r != 0 || c.g != 0 || c.b != 0 ); };
	this.call = ( (isset(call))? call : this.dcall );
	this.draw = true;
}

rayTrace.prototype.getColor = function( x, y ) {
	var p = ( (this.canvas.width*y)+x )*4
	return ( { 'r':this.data[p], 'g':this.data[p+1], 'b':this.data[p+2] } );
}

rayTrace.prototype.zone = function( x, y, w, h ) {
	for (var i = x; i < w; i++) {
		for (var v = y; v < h; v++) {
			var c = this.getColor( i, v );
			if (c.r != 0 || c.g != 0 || c.b != 0) {
				return (true);
			}
		}
	}
	return (false);
}

rayTrace.prototype.colision = function( obj, list ) {
	var ret = false;
	for (var i in list) {
		for (var v in list) {
			if ( isset(list[i].self) && isset(list[v].self) ) {
				if (v != i && !list[i].self.dragable.isdrag() && !list[v].self.dragable.isdrag()) {
					if ( Math.abs(list[i].x - list[v].x) < (list[i].sx + list[v].sx)/2 ) {
						if ( Math.abs(list[i].y - list[v].y) < (list[i].sy + list[v].sy)/2 ) {
							list[v].inCollision = true;
							list[v].colWith = list[i];
							if (obj._index == i || obj._index == v) {
								ret = true;
							}
						}
					}
				}
			}
		}
	}
	return (ret);
}

rayTrace.prototype.run = function( x0, y0, x1, y1 ) {
	var dx = Math.abs(x1-x0), dy = Math.abs(y1-y0);
	var sx = ( (x0 < x1) ? 1 : -1 ), sy = ( (y0 < y1) ? 1 : -1 );
	var err = dx-dy;

	while(true){
		if ( this.draw ) {
			this.context.fillStyle = ( (this.dcall(this, x0, y0))? "red" : "green" );
			this.context.fillRect(x0,y0,1,1);
		}

		if ( this.call( this, x0, y0 ) ) break;
		if ( (x0==x1) && (y0==y1) ) break;
			var e2 = 2*err;
			if (e2 >-dy){ err -= dy; x0  += sx; }
			if (e2 < dx){ err += dx; y0  += sy; }
	}
	return ( { 'x':x0, 'y':y0 } );
}
