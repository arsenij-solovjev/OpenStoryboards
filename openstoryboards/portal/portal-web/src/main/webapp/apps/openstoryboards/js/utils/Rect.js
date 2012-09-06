openstoryboards.utils.Rect = Base.extend({
	constructor: function(left, top, width, height) {
		this.left = left;
		this.top = top;
		this.width = width;
		this.height = height;
	},
	getLeft: function() { return this.left; },
	getTop: function() { return this.top; },
	getWidth: function() { return this.width; },
	getHeight: function() { return this.height; },
	containsPoint: function(point) {
		return point.x >= this.left && point.x < this.left + this.width
			&& point.y >= this.top && point.y < this.top + this.height;
	},
	intersectsLine: function(line) {
		var left = this.left,
			right = this.left + this.width - 1,
			top = this.top,
			bottom = this.top + this.height - 1,
			c1 = {x: left, y: top},
			c2 = {x: left, y: bottom},
			c3 = {x: right, y: bottom},
			c4 = {x: right, y: top};
		return line.intersects(new openstoryboards.utils.Line(c1, c2)) ||
			line.intersects(new openstoryboards.utils.Line(c2, c3)) ||
			line.intersects(new openstoryboards.utils.Line(c3, c4)) ||
			line.intersects(new openstoryboards.utils.Line(c4, c1)) ||
			(this.containsPoint(line.a) && this.containsPoint(line.b));
	}
});
