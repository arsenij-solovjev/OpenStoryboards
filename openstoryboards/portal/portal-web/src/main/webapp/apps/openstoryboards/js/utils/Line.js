openstoryboards.utils.Line = Base.extend({
	constructor: function(from, to) {
		this.a = from;
		this.b = to;
	},
	intersects: function(line) {
		var q = (this.a.y - line.a.y) * (line.b.x - line.a.x) - (this.a.x - line.a.x) * (line.b.y - line.a.y),
        	d = (this.b.x - this.a.x) * (line.b.y - line.a.y) - (this.b.y - this.a.y) * (line.b.x - line.a.x);
        if(d == 0) {
            return false;
        }
        var r = q / d;
        q = (this.a.y - line.a.y) * (this.b.x - this.a.x) - (this.a.x - line.a.x) * (this.b.y - this.a.y);
        var s = q / d;
        if( r < 0 || r > 1 || s < 0 || s > 1 ) {
            return false;
        }
        return true;		
	}
});
