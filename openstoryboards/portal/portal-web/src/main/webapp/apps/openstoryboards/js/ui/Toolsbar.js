openstoryboards.ui.Toolsbar = openstoryboards.ui.Widget.extend({
	constructor: function() {
		this.base();
		this.addClass("toolsbar");
		this.listElement = DOMBuilder.dom.UL();
		$(this.containerElement).append(this.listElement);
	},
	
	add: function(toolButton) {
		var li = DOMBuilder.dom.LI({}, toolButton.containerElement);
		$(this.listElement).append(li);
	}
});