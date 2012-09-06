openstoryboards.ui.Container = openstoryboards.ui.Widget.extend({
	constructor: function() {
		this.base();
	},
	
	children: [],
	
	add: function(widget) {
		this.children.push(widget);
		$(this.contentElement).append(widget.containerElement);
		widget.parent = this;
	}
});