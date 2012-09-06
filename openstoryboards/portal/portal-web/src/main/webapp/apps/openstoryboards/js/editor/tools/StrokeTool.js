openstoryboards.editor.tools.StrokeTool = openstoryboards.editor.tools.Tool.extend({
	constructor: function(name, iconClass, cursorClass, model) {
		this.base(name, iconClass, cursorClass, model);
	},
	
	generateBegin: function() {
		//OVERRIDE!!!
		return {type: "BEGIN"};
	},
	
	begin: function() {
		this.trigger("action", this.generateBegin());
	},
	
	end: function() {
		this.trigger("action", {type: "END"});
	},
	
	stroke: function(from, to) {
		this.trigger("action", {type: "STROKE", from: from, to: to});
	},
	
	tryStroke: function(from, to) {
		var rect = new openstoryboards.utils.Rect(0, 0, this.model.width.get(), this.model.height.get()),
			line = new openstoryboards.utils.Line(from, to);
		if(rect.intersectsLine(line))
			this.stroke(from, to);
	},
	
	mouseDown: function(event) {
		var rect = new openstoryboards.utils.Rect(0, 0, this.model.width.get(), this.model.height.get()),
			position = event.getPosition();
		if(event.isButtonDown() && rect.containsPoint(position)) {
			this.buttonDown = true;
			this.lastPosition = position;
			this.begin();
		}
	},
	
	mouseUp: function(event) {
		if(this.buttonDown) {
			this.buttonDown = false;
			this.tryStroke(this.lastPosition, event.position);
			this.lastPosition = null;
			this.end();
		}
	},
	
	mouseMove: function(event) {
		if(this.buttonDown && event.isButtonDown()) {
			this.tryStroke(this.lastPosition, event.getPosition());
			this.lastPosition = event.getPosition();
		}
	},
	
	mouseEnter: function(event) {},
	
	mouseLeave: function(event) {
		if(this.buttonDown) {
			this.buttonDown = false;
			this.lastPosition = null;
			this.end();
		}
	},
	
	keyDown: function(event) {
		
	},
	
	keyUp: function(event) {
		
	},
	
	keyPress: function(event) {
		
	}
	/* stroke(image, from, to)
 */
});