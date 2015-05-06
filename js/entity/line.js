	
var linedrawer = function( a ) {
	this.self = a;
	this.obm = a.obm;
	this.last = '';
	this.cur = { 's':0, 'p':0 };

	this.color = { 'r':255, 'b':0, 'g':0 };	
	this.tcolor = { 'r':255, 'b':0, 'g':0 };
}

linedrawer.prototype.getside = function() {
	var dis = distance( this.self.x, this.self.y, this.self.p.x, this.self.p.y );
	var out = this.cur;
	for (var i in this.self.sides) {
		for (var x in this.self.p.sides) {
			var tmp = distance( this.self.sides[i].x, this.self.sides[i].y, this.self.p.sides[x].x, this.self.p.sides[x].y )
			if ( tmp < dis ) {
				out.s = i;
				out.p = x;
				dis = tmp;
			}
		}
	}
	
	return (out);
}

linedrawer.prototype._get = function( a, t, ent )  {
	var o = { 'x':'width', 'y':'height' };
	if ( !isset(ent.sides) ) {
		console.log( ent.sides );
	}

	return Math.round( (ent.sides[a][t]-this.obm.draw[t])+(this.obm.layer.gui.self.div[o[t]]/2) );
}

linedrawer.prototype.setcolor = function( r, g, b )  {
	this.color = { 'r':r, 'b':g, 'g':b };
}

linedrawer.prototype.getcolor = function( )  {
	this.tcolor.r += ( (this.color.r < this.tcolor.r)? -1 : ( (this.color.r == this.tcolor.r)? 0 : 1 ) );
	this.tcolor.g += ( (this.color.g < this.tcolor.g)? -1 : ( (this.color.g == this.tcolor.g)? 0 : 1 ) );
	this.tcolor.b += ( (this.color.b < this.tcolor.b)? -1 : ( (this.color.b == this.tcolor.b)? 0 : 1 ) );
	
	return ( this.tcolor );
}

linedrawer.prototype.render = function() {
	if ( isset(this.self.p) && isset(this.self.self.dragable) && isset(this.self.p.self) ) {
		if ( this.last !== this.self.x+','+this.self.y+','+this.self.p.x+','+this.self.p.y ) {
			this.last = this.self.x+','+this.self.y+','+this.self.p.x+','+this.self.p.y;
			this.cur = this.getside();
		}

		this.obm.layer.gui.ctx.beginPath();
		this.obm.layer.gui.ctx.moveTo( this._get( this.cur.s, 'x', this.self ), this._get( this.cur.s, 'y', this.self ) );
		this.obm.layer.gui.ctx.lineTo( this._get( this.cur.p, 'x', this.self.p ), this._get( this.cur.p, 'y', this.self.p ) );
		this.obm.layer.gui.ctx.lineWidth = 2;
		
		if ( this.self.self.dragable.isdrag() || this.self.p.self.dragable.isdrag()) {
				this.obm.layer.gui.ctx.setLineDash([10])
		}
		//this.getcolor();
		this.obm.layer.gui.ctx.strokeStyle = rgb(255, 255, 255);
		
		this.obm.layer.gui.ctx.stroke();
		this.obm.layer.gui.ctx.setLineDash([0])

	}
}