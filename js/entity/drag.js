
var dragable = function( div ) {
	
	this.div = div;
	this.obm = this.div.obm;
	this.info = { 'toggle':false };

	if ( !isset(this.div.base) ) {
		var him = this;
		this.div.self.div.addEventListener("mousedown", function(e) {
			him.div.self.style( { 'zIndex':(him.obm.zindex+=1)} );
			him.info.toggle = true;
			him.info.sx = e.pageX;
			him.info.sy = e.pageY;
			him.info.spx = him.div.x;
			him.info.spy = him.div.y;
			him.div.inCollision = false;
		}, false);
		
		document.body.addEventListener("mousemove", function(e) {
			if (him.info.toggle) {
				him.div.x = him.info.spx + (him.info.sx - e.pageX)*-1;
				him.div.y = him.info.spy + (him.info.sy- e.pageY)*-1;
			}
		}, false);
		
		document.body.addEventListener("mouseup", function(e) {
			if (him.info.toggle) {
				him.info.toggle = false;
				him.div.updateGrid();
				him.div.col();
			}
		}, false);
	}
}

dragable.prototype.isdrag = function() {
	return (this.info.toggle);
}