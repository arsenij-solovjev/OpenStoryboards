openstoryboards.ui.Canvas = openstoryboards.ui.Widget.extend({
	constructor: function() {
		this.base();
		this.containerElement = DOMBuilder.dom.CANVAS({}, "Can not display canvas object!");
	},
	
	setWidth: function(width) {
		this.containerElement.width = width;
		this.trigger("resize", this);
	},

	setHeight: function(height) {
		this.containerElement.height = height;
		this.trigger("resize", this);
	},
});