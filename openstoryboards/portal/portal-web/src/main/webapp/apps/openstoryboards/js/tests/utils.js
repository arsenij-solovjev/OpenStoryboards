module("utils.Line");
test("intersection test", function() {
	var line1 = new openstoryboards.utils.Line({x:-10, y:0}, {x:10, y:0}),
		line2 = new openstoryboards.utils.Line({x:0, y:-10}, {x:0, y:10}),
		line3 = new openstoryboards.utils.Line({x:10, y:-10}, {x:10, y:10});
	ok(line1.intersects(line2), "orthogonal lines do intersect");
	ok(!line2.intersects(line3), "parallel lines do not intersect");
	ok(line1.intersects(line1), "identical lines do intersect");
});