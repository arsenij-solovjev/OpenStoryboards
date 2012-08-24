openstoryboards.ui.MouseEvent = Base.extend({
	constructor: function(domEvent, domNode) {
		var offset = $(domNode).offset();
		this.buttonDown = domEvent.which == 1;
		this.position = {
		    x: domEvent.pageX - offset.left, 
			y: domEvent.pageY - offset.top
		};
	},
	
	isButtonDown: function() {
		return this.buttonDown;
	},
	
	getPosition: function() {
		return this.position;
	},
});